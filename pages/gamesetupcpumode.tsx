import { useRouter } from 'next/router';
import { ArrowLeft, Layers, Zap } from 'lucide-react';

export default function GameSetupCpuMode() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#181e24] text-white px-4 py-6">
      <div className="w-full max-w-4xl mx-auto mt-8">
        {/* Back button and heading */}
        <div className="flex flex-row items-center justify-center mb-4 gap-4">
          <button
            className="flex items-center px-5 py-1.5 rounded-full bg-[#232a32] text-blue-200 hover:bg-[#20262c] border border-[#353c44] font-semibold text-base shadow-sm transition cursor-pointer"
            onClick={() => router.back()}
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>
          <h1 className="text-4xl font-extrabold tracking-tight text-white" style={{ letterSpacing: 0 }}>Choose CPU Mode</h1>
        </div>
        <div className="text-gray-400 text-center mb-10 text-lg">Pick a CPU mode to play. More options coming soon!</div>
        {/* Tiles grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Levels Mode Tile (not clickable) */}
          <div className="flex flex-col items-center justify-center rounded-2xl bg-[#232a32] shadow p-12 min-h-[220px] font-bold text-xl tracking-wide opacity-60 cursor-not-allowed">
            <Layers size={56} className="mb-6 text-gray-200" />
            <span>Levels Mode</span>
            <span className="text-base text-gray-400 mt-2 text-center">1000 levels of word search puzzles. (Coming soon!)</span>
          </div>
          {/* Blitz Battle Tile (clickable) */}
          <button
            className="flex flex-col items-center justify-center rounded-2xl bg-[#232a32] shadow p-12 min-h-[220px] font-bold text-xl tracking-wide border-2 border-transparent hover:border-blue-500 hover:scale-105 transition-all duration-200 cursor-pointer"
            onClick={() => router.push('/gamesetupcpu')}
          >
            <Zap size={56} className="mb-6 text-yellow-300" />
            <span>Blitz Battle</span>
            <span className="text-base text-gray-400 mt-2 text-center">Play a fast-paced match against the CPU. Choose your difficulty!</span>
          </button>
        </div>
      </div>
    </div>
  );
} 