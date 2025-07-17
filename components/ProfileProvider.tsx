"use client";

import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';

export default function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();

  console.log('ProfileProvider: Component rendered', { isLoaded, hasUser: !!user, userId: user?.id });

  useEffect(() => {
    if (isLoaded && user) {
      console.log('ProfileProvider: Creating profile for user:', user.id);
      // Create profile if it doesn't exist
      fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          username: user.username || user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'Player',
          xp: 0,
          level: 1,
        }),
      })
        .then(response => {
          console.log('ProfileProvider: Profile creation response:', response.status);
          if (!response.ok) {
            return response.text().then(text => {
              console.error('ProfileProvider: Profile creation failed:', text);
            });
          }
          return response.json();
        })
        .then(data => {
          if (data) console.log('ProfileProvider: Profile created successfully:', data);
        })
        .catch(error => {
          console.error('ProfileProvider: Error creating profile:', error);
        });
    }
  }, [user, isLoaded]);

  return <>{children}</>;
} 