import { useRouter } from 'next/router';
import { Brain, Search, Calculator, Grid, Puzzle, Crown, ArrowLeft } from 'lucide-react';

const gameModes = [
  { name: 'Memory Pulse', icon: Brain },
  { name: 'Word Quest', icon: Search },
  { name: 'Math Blitz', icon: Calculator },
  { name: 'Sudoku Sphere', icon: Grid },
  { name: 'Jigsaw Jam', icon: Puzzle },
  { name: 'Chess Clash', icon: Crown },
];

export default function GameModeChoose() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#181e24] text-white px-4 py-6">
      <div className="w-full max-w-4xl mx-auto mt-8">
        {/* Back button to the left of the heading, both centered */}
        <div className="flex flex-row items-center justify-center mb-4 gap-4">
          <button
            className="flex items-center px-5 py-1.5 rounded-full bg-[#232a32] text-blue-200 hover:bg-[#20262c] border border-[#353c44] font-semibold text-base shadow-sm transition cursor-pointer"
            onClick={() => router.back()}
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>
          <h1 className="text-4xl font-extrabold tracking-tight text-white" style={{ letterSpacing: 0 }}>Choose Your Game Mode</h1>
        </div>
        <div className="text-gray-400 text-center mb-10 text-lg">Select a game mode to start playing. More modes coming soon!</div>
        {/* Tiles grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {gameModes.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={`flex flex-col items-center justify-center rounded-2xl bg-[#232a32] shadow p-12 min-h-[220px] transition-all duration-200 font-bold text-xl tracking-wide
                ${name === 'Word Quest' ? 'border-2 border-transparent hover:border-blue-500 hover:scale-105 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
              onClick={name === 'Word Quest' ? () => router.push('/gamesetup') : undefined}
              disabled={name !== 'Word Quest'}
            >
              <Icon size={56} className="mb-6 text-gray-200" />
              <span>{name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 