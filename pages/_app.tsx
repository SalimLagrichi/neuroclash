import { ClerkProvider } from '@clerk/nextjs';
import { useUser, UserButton } from '@clerk/nextjs';
import type { AppProps } from 'next/app';
import '../app/globals.css';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Swords } from 'lucide-react';
import { useRouter } from 'next/router';

function Navbar() {
  const { isSignedIn } = useUser();
  return (
    <nav className="w-full relative flex items-center px-[10%] py-6 min-h-[64px] bg-[#232a32] shadow text-white">
      <a href="/" className="flex items-center gap-2 z-10 flex-1 cursor-pointer hover:opacity-80 transition text-white">
        <Swords className="w-7 h-7 text-white" />
        <span className="font-semibold text-xl tracking-wide text-white">Neuro Clash</span>
      </a>
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-8 text-base font-medium z-10 text-white">
        <a href="/gamemodechoose" className="hover:text-blue-400 transition cursor-pointer inline-block pointer-events-auto text-white">Play</a>
        <a href="#features" className="hover:text-blue-400 transition cursor-pointer inline-block pointer-events-auto text-white">Features</a>
        <a href="/leaderboard" className="hover:text-blue-400 transition cursor-pointer inline-block pointer-events-auto text-white">Leaderboard</a>
        <a href="#support" className="hover:text-blue-400 transition cursor-pointer inline-block pointer-events-auto text-white">Support</a>
        <a href="/profile" className="hover:text-blue-400 transition cursor-pointer inline-block pointer-events-auto text-white">Profile</a>
      </div>
      <div className="z-10">
        {isSignedIn ? (
          <UserButton
            afterSignOutUrl="/"
            userProfileMode="navigation"
            userProfileUrl="/profile"
          />
        ) : null}
      </div>
    </nav>
  );
}

function UsernameGate({ children }: { children: React.ReactNode }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const [needsUsername, setNeedsUsername] = useState(false);
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user?.id) return;
    const checkProfile = async () => {
      setChecking(true);
      setError('');
      try {
        const res = await fetch(`/api/profile?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          if (!data.username) setNeedsUsername(true);
          else setNeedsUsername(false);
        } else {
          // No profile, needs username
          setNeedsUsername(true);
        }
      } catch {
        setNeedsUsername(true);
      }
      setChecking(false);
    };
    checkProfile();
  }, [isLoaded, isSignedIn, user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !user?.id) {
      setError('Username required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          username: username.trim(),
          xp: 0,
          level: 1,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setNeedsUsername(false);
      } else {
        setError(data.error || 'Unknown error');
      }
    } catch (err: any) {
      setError(err?.toString() || 'Unknown error');
    }
    setSubmitting(false);
  };

  if (!isLoaded || !isSignedIn || checking) return null;

  return (
    <>
      {needsUsername && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 32, borderRadius: 12, minWidth: 320, boxShadow: '0 2px 16px #0002', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2>Set your username</h2>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter a unique username"
              disabled={submitting}
              style={{ fontSize: 18, padding: 8 }}
              autoFocus
            />
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <button type="submit" disabled={submitting || !username.trim()} style={{ fontSize: 18, padding: 8 }}>
              {submitting ? 'Saving...' : 'Save Username'}
            </button>
            <div style={{ fontSize: 13, color: '#888' }}>
              You must set a username to use the app.
            </div>
          </form>
        </div>
      )}
      <div style={{ filter: needsUsername ? 'blur(2px)' : undefined, pointerEvents: needsUsername ? 'none' : undefined }}>
        {children}
      </div>
    </>
  );
}

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider>
      <Navbar />
      <UsernameGate>
        <Component {...pageProps} />
      </UsernameGate>
    </ClerkProvider>
  );
} 