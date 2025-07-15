import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { Medal, Brain, Search, Calculator, Grid, Puzzle, Crown } from 'lucide-react';

const mockProfile = {
  elo: 1240, // mock Elo value
  record: '20W - 38L',
  winRate: '34%',
  recentMatches: [
    { result: 'L', xp: -100 },
    { result: 'W', xp: 220 },
    { result: 'L', xp: -100 },
    { result: 'W', xp: 220 },
    { result: 'L', xp: -100 },
  ],
  gameModesCasual: [
    // Use first three as casual for mock
    {
      name: 'Memory Pulse',
      record: '4W - 2L',
      wins: 4,
      losses: 2,
      skill: 'Amateur',
      winPct: 67,
      points: 120,
      bestStreak: 3,
      trophies: [0, 1, 0, 2],
      xp: 340,
      lastPlayed: '2024-06-01',
    },
    {
      name: 'Word Quest',
      record: '2W - 3L',
      wins: 2,
      losses: 3,
      skill: 'Novice',
      winPct: 40,
      points: 80,
      bestStreak: 2,
      trophies: [0, 0, 1, 0],
      xp: 210,
      lastPlayed: '2024-05-28',
    },
    {
      name: 'Jigsaw Jam',
      record: '2W - 0L',
      wins: 2,
      losses: 0,
      skill: 'Amateur',
      winPct: 100,
      points: 60,
      bestStreak: 2,
      trophies: [0, 1, 0, 0],
      xp: 150,
      lastPlayed: '2024-06-03',
    },
  ],
  gameModesCompetitive: [
    // Use last three as competitive for mock
    {
      name: 'Math Blitz',
      record: '3W - 1L',
      wins: 3,
      losses: 1,
      skill: 'Pro',
      winPct: 75,
      points: 150,
      bestStreak: 4,
      trophies: [1, 0, 0, 1],
      xp: 400,
      lastPlayed: '2024-06-02',
    },
    {
      name: 'Sudoku Sphere',
      record: '1W - 2L',
      wins: 1,
      losses: 2,
      skill: 'Novice',
      winPct: 33,
      points: 40,
      bestStreak: 1,
      trophies: [0, 0, 0, 0],
      xp: 90,
      lastPlayed: '2024-05-30',
    },
    {
      name: 'Chess Clash',
      record: '0W - 0L',
      wins: 0,
      losses: 0,
      skill: 'Unranked',
      winPct: 0,
      points: 0,
      bestStreak: 0,
      trophies: [0, 0, 0, 0],
      xp: 0,
      lastPlayed: '-',
    },
  ],
};

const gameModeIcons: { [key: string]: React.ComponentType<{ size?: number; className?: string }> } = {
  'Memory Pulse': Brain,
  'Word Quest': Search,
  'Math Blitz': Calculator,
  'Sudoku Sphere': Grid,
  'Jigsaw Jam': Puzzle,
  'Chess Clash': Crown,
};

// XP table for levels 1–50
const xpTable = [
  300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200,
  1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200,
  2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000, 3100, 3200,
  3300, 3400, 3500, 3600, 3700, 3800, 3900, 4000, 4100, 4200,
  4300, 4400, 4500, 4600, 4700, 4800, 4900, 5000, 5100
];

function getLevelInfo(totalXp: number) {
  let level = 1;
  let xpForNext = xpTable[0];
  let xpSum = 0;
  for (let i = 0; i < xpTable.length; i++) {
    if (totalXp < xpSum + xpTable[i]) {
      xpForNext = xpTable[i];
      break;
    }
    xpSum += xpTable[i];
    level = i + 2;
  }
  const xpThisLevel = totalXp - xpSum;
  const progress = xpForNext ? xpThisLevel / xpForNext : 1;
  return { level, xpThisLevel, xpForNext, progress };
}

// Rank table (highest percentile first)
const rankTable = [
  { tier: 'Diamond', sub: 'I', min: 99.95 },
  { tier: 'Diamond', sub: 'II', min: 99.85 },
  { tier: 'Diamond', sub: 'III', min: 99.7 },
  { tier: 'Onyx', sub: '', min: 99.3 },
  { tier: 'Ruby', sub: 'I', min: 99 },
  { tier: 'Ruby', sub: 'II', min: 98.5 },
  { tier: 'Ruby', sub: 'III', min: 98 },
  { tier: 'Emerald', sub: 'I', min: 97 },
  { tier: 'Emerald', sub: 'II', min: 95.5 },
  { tier: 'Emerald', sub: 'III', min: 94 },
  { tier: 'Sapphire', sub: 'I', min: 92 },
  { tier: 'Sapphire', sub: 'II', min: 88 },
  { tier: 'Sapphire', sub: 'III', min: 84 },
  { tier: 'Platinum', sub: 'I', min: 76 },
  { tier: 'Platinum', sub: 'II', min: 68 },
  { tier: 'Platinum', sub: 'III', min: 60 },
  { tier: 'Gold', sub: 'I', min: 52 },
  { tier: 'Gold', sub: 'II', min: 44 },
  { tier: 'Gold', sub: 'III', min: 36 },
  { tier: 'Silver', sub: 'I', min: 36 },
  { tier: 'Silver', sub: 'II', min: 30 },
  { tier: 'Silver', sub: 'III', min: 24 },
  { tier: 'Bronze', sub: 'I', min: 18 },
  { tier: 'Bronze', sub: 'II', min: 14 },
  { tier: 'Bronze', sub: 'III', min: 10 },
  { tier: 'Iron', sub: 'I', min: 6 },
  { tier: 'Iron', sub: 'II', min: 2 },
  { tier: 'Iron', sub: 'III', min: 0 },
];

function getRank(percentile: number) {
  for (const rank of rankTable) {
    if (percentile >= rank.min) {
      return `${rank.tier} ${rank.sub}`.trim();
    }
  }
  return 'Iron III'; // Worst possible
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [username, setUsername] = useState('');
  const [profileViews, setProfileViews] = useState<number | null>(null);
  const [xp, setXp] = useState(4200); // mock XP for now
  const [elo, setElo] = useState(1000); // real Elo if available
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'casual' | 'competitive'>('casual');

  useEffect(() => {
    if (!isLoaded || !user) return;
    fetch(`/api/profile?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setUsername(data.username || '');
        setProfileViews(data.profileViews ?? 0);
        setXp(data.xp ?? 0);
        setElo(data.elo ?? 1000);
      });
    fetch('/api/profile/all')
      .then(res => res.json())
      .then(data => setAllProfiles(data.profiles || []));
    fetch('/api/profile/increment-views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    });
  }, [isLoaded, user]);

  // Calculate percentile and rank from Elo
  let myPercentile = 100;
  if (allProfiles.length > 1) {
    const sorted = [...allProfiles].sort((a, b) => a.elo - b.elo);
    const myIndex = sorted.findIndex(p => p.userId === user?.id);
    if (myIndex !== -1) {
      myPercentile = 100 * (1 - myIndex / (sorted.length - 1));
    }
  }
  const myRank = getRank(myPercentile);
  const levelInfo = getLevelInfo(xp);

  if (!isLoaded) return <div style={{ color: 'white' }}>Loading...</div>;

  return (
    <div className="min-h-screen bg-[#181e24] text-white flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-[60vw] bg-[#232a32] rounded-2xl shadow-lg p-8 flex flex-col gap-8 mx-auto"
        style={{ minWidth: '320px' }}>
        {/* Profile header */}
        <div className="flex items-center gap-8">
          <img src={user?.imageUrl} alt="Profile" className="w-24 h-24 rounded-full border-4 border-blue-500 shadow" />
          <div>
            <h1 className="text-3xl font-bold mb-1">{username}</h1>
            <div className="text-blue-200 text-sm font-medium mt-1">{profileViews ?? 0} profile views</div>
          </div>
        </div>
        {/* Stats Bar with vertical dividers */}
        <div className="w-full flex flex-col md:flex-row items-center justify-between bg-[#20262c] rounded-xl px-6 py-4 shadow border border-gray-700/40 gap-6 md:gap-0">
          {/* Rank */}
          <div className="flex flex-col items-center min-w-[120px] justify-center h-full">
            <span className="text-blue-400 font-bold text-sm uppercase tracking-wide mb-2">Rank</span>
            <div className="flex items-center gap-3">
              <Medal size={36} color="#FFD700" className="drop-shadow" />
              <span className="text-lg font-bold text-yellow-400">{myRank}</span>
            </div>
          </div>
          {/* Divider */}
          <div className="hidden md:block h-16 border-l border-gray-700 mx-4" />
          {/* Elo */}
          <div className="flex flex-col items-center min-w-[100px]">
            <span className="text-blue-400 font-bold text-sm mb-1 uppercase tracking-wide">Elo</span>
            <span className="text-2xl font-bold text-blue-300">{elo}</span>
          </div>
          <div className="hidden md:block h-16 border-l border-gray-700 mx-4" />
          {/* Record */}
          <div className="flex flex-col items-center min-w-[120px]">
            <span className="text-blue-400 font-bold text-sm mb-1 uppercase tracking-wide">Record</span>
            <span className="text-2xl font-bold">{mockProfile.record}</span>
            <span className="text-xs text-gray-300">{mockProfile.winRate} WIN RATE</span>
          </div>
          <div className="hidden md:block h-16 border-l border-gray-700 mx-4" />
          {/* Recent Matches */}
          <div className="flex flex-col items-center min-w-[160px]">
            <span className="text-blue-400 font-bold text-sm mb-1 uppercase tracking-wide">Recent Matches</span>
            <div className="flex gap-2 mb-1">
              {mockProfile.recentMatches.map((m, i) => (
                <span key={i} className={m.result === 'W' ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{m.result}</span>
              ))}
            </div>
            <div className="flex gap-2">
              {mockProfile.recentMatches.map((m, i) => (
                <span key={i} className={m.xp > 0 ? 'text-green-400 text-xs' : 'text-red-400 text-xs'}>{m.xp > 0 ? `+${m.xp}XP` : `${m.xp}XP`}</span>
              ))}
            </div>
          </div>
        </div>
        {/* XP Progress Bar */}
        <div className="w-full bg-[#20262c] rounded-xl px-6 py-4 shadow border border-gray-700/40 flex flex-col gap-2 mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-blue-400 font-bold text-sm uppercase tracking-wide">Level {levelInfo.level}</span>
            <span className="text-xs text-gray-300">{levelInfo.xpThisLevel} / {levelInfo.xpForNext} XP</span>
            <span className="text-xs text-gray-300">Next Level: {levelInfo.xpForNext - levelInfo.xpThisLevel} XP</span>
          </div>
          <div className="w-full h-4 bg-[#181e24] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.round(levelInfo.progress * 100))}%` }}
            />
          </div>
        </div>
        {/* Tabs for Casual and Competitive */}
        <div className="w-full flex flex-col items-center mt-4">
          <div className="flex gap-4 mb-4">
            <button
              className={`px-6 py-2 rounded-full font-semibold transition-colors duration-200 ${activeTab === 'casual' ? 'bg-blue-600 text-white' : 'bg-[#20262c] text-blue-300 border border-blue-600'}`}
              onClick={() => setActiveTab('casual')}
            >
              Casual
            </button>
            <button
              className={`px-6 py-2 rounded-full font-semibold transition-colors duration-200 ${activeTab === 'competitive' ? 'bg-blue-600 text-white' : 'bg-[#20262c] text-blue-300 border border-blue-600'}`}
              onClick={() => setActiveTab('competitive')}
            >
              Competitive
            </button>
          </div>
          <div className="w-full bg-[#20262c] rounded-xl p-6 shadow border border-gray-700/40 min-h-[100px]">
            <h2 className="text-2xl font-bold mb-4 text-white">Game Modes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(activeTab === 'casual' ? mockProfile.gameModesCasual : mockProfile.gameModesCompetitive).map((mode, i) => {
                const Icon = gameModeIcons[mode.name] || Brain;
                return (
                  <div key={mode.name} className="bg-[#20262c] rounded-xl p-6 flex flex-col items-center shadow border border-gray-600/40 min-h-[320px] w-full">
                    <div className="flex items-center gap-2 text-2xl font-bold mb-4 text-white tracking-wide">
                      <Icon size={28} className="text-gray-200" />
                      {mode.name}
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 w-full mb-4">
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-gray-400 mb-1">Skill Level</span>
                        <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded font-semibold uppercase tracking-wide">{mode.skill}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-gray-400 mb-1">Record</span>
                        <span className="text-lg font-semibold text-blue-400">{mode.record}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-gray-400 mb-1">Win %</span>
                        <span className="text-lg font-semibold text-green-400">{mode.winPct}%</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-gray-400 mb-1">Best Streak</span>
                        <span className="text-lg font-semibold text-purple-300">{mode.bestStreak}</span>
                      </div>
                    </div>
                    <hr className="w-full border-t border-gray-700 my-2 opacity-50" />
                    <div className="flex flex-col items-center w-full mb-2">
                      <span className="text-lg font-semibold text-blue-200">{mode.xp} XP</span>
                      <span className="text-xs text-gray-400">XP Earned</span>
                    </div>
                    <hr className="w-full border-t border-gray-700 my-2 opacity-50" />
                    <div className="flex flex-col items-center w-full">
                      <span className="text-xs text-gray-400">Last Played: {mode.lastPlayed}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 