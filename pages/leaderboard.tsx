import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

const rankTable = [
  { tier: 'Iron', sub: 3, min: 96 },
  { tier: 'Iron', sub: 2, min: 92.5 },
  { tier: 'Iron', sub: 1, min: 90 },
  { tier: 'Bronze', sub: 3, min: 82 },
  { tier: 'Bronze', sub: 2, min: 75.5 },
  { tier: 'Bronze', sub: 1, min: 70 },
  { tier: 'Silver', sub: 3, min: 60 },
  { tier: 'Silver', sub: 2, min: 50 },
  { tier: 'Silver', sub: 1, min: 45 },
  { tier: 'Gold', sub: 3, min: 40 },
  { tier: 'Gold', sub: 2, min: 35 },
  { tier: 'Gold', sub: 1, min: 30 },
  { tier: 'Platinum', sub: 3, min: 25 },
  { tier: 'Platinum', sub: 2, min: 20 },
  { tier: 'Platinum', sub: 1, min: 15 },
  { tier: 'Sapphire', sub: 3, min: 12 },
  { tier: 'Sapphire', sub: 2, min: 9 },
  { tier: 'Sapphire', sub: 1, min: 6 },
  { tier: 'Emerald', sub: 3, min: 4 },
  { tier: 'Emerald', sub: 2, min: 2.5 },
  { tier: 'Emerald', sub: 1, min: 1.5 },
  { tier: 'Ruby', sub: 3, min: 1 },
  { tier: 'Ruby', sub: 2, min: 0.75 },
  { tier: 'Ruby', sub: 1, min: 0.5 },
  { tier: 'Onyx', sub: 3, min: 0.4 },
  { tier: 'Onyx', sub: 2, min: 0.3 },
  { tier: 'Onyx', sub: 1, min: 0.2 },
  { tier: 'Diamond', sub: 3, min: 0.1 },
  { tier: 'Diamond', sub: 2, min: 0.05 },
  { tier: 'Diamond', sub: 1, min: 0.01 },
];

function getRank(percentile: number) {
  for (const rank of rankTable) {
    if (percentile >= rank.min) {
      return `${rank.tier} ${rank.sub}`;
    }
  }
  return 'Diamond I';
}

export default function LeaderboardPage() {
  const { user } = useUser();
  const [profiles, setProfiles] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/profile/all')
      .then(res => res.json())
      .then(data => setProfiles(data.profiles || []));
  }, []);

  const sorted = [...profiles].sort((a, b) => b.xp - a.xp);

  return (
    <div className="min-h-screen bg-[#181e24] text-white flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-2xl bg-[#232a32] rounded-2xl shadow-lg p-8 flex flex-col gap-8 mx-auto" style={{ minWidth: '320px' }}>
        <h1 className="text-3xl font-bold text-blue-300 mb-6 text-center">Leaderboard</h1>
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-blue-400 text-sm uppercase">
              <th>#</th>
              <th>Username</th>
              <th>Rank</th>
              <th>Level</th>
              <th>XP</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((profile, i) => {
              const percentile = sorted.length > 1 ? 100 * (1 - i / (sorted.length - 1)) : 0;
              const rank = getRank(percentile);
              const isMe = user && profile.userId === user.id;
              return (
                <tr key={profile.userId} className={isMe ? 'bg-blue-900/40 font-bold' : 'bg-[#20262c]'}>
                  <td className="py-2 px-3 rounded-l-xl">{i + 1}</td>
                  <td className="py-2 px-3">{profile.username}</td>
                  <td className="py-2 px-3">{rank}</td>
                  <td className="py-2 px-3">{profile.level}</td>
                  <td className="py-2 px-3 rounded-r-xl">{profile.xp}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
} 