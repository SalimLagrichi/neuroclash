import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Globe, Trophy, BarChart, Brain, Search, Calculator, Grid, Puzzle, Crown } from "lucide-react";
import '../app/globals.css';

// Debug: Log environment variables
console.log("SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("SUPABASE_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
console.log("CLERK_KEY:", process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function Home() {
  const { isSignedIn } = useUser();

  return (
    <div className="min-h-screen text-white flex flex-col">
      {/* Hero Section */}
      <section
        className="flex flex-col items-center justify-center flex-1 py-4 px-[10%] min-h-[60vh]"
        style={{ background: 'radial-gradient(circle, #35495E 0%, #1B2530 100%)' }}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-center bg-transparent selection:bg-transparent">Compete, Connect, and Conquer</h1>
        <p className="text-lg md:text-xl text-gray-300 mb-6 text-center max-w-2xl">Challenge players worldwide in real-time 1v1 word search battles. Find more words than your opponent in 3 minutes and climb the leaderboard!</p>
        <Link href={isSignedIn ? "/gamemodechoose" : "/sign-in"}>
          <button className="bg-blue-500 text-white font-bold px-8 py-3 rounded-xl text-lg shadow mb-6 transition cursor-pointer transform hover:scale-105">Play Now</button>
        </Link>
        {/* Feature Tiles under Play Now */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mx-auto mt-2">
          <div className="bg-[#232a32] rounded-xl p-6 flex flex-col items-center transition transform hover:scale-105 cursor-pointer border-b-4 border-blue-500">
            <Globe className="text-3xl mb-2 text-blue-400" />
            <span className="font-semibold text-lg mb-1">Worldwide 1v1 Battles</span>
            <span className="text-gray-400 text-sm text-center">Challenge anyone, anytime. Prove your word skills against real opponents in fast-paced matches.</span>
          </div>
          <div className="bg-[#232a32] rounded-xl p-6 flex flex-col items-center transition transform hover:scale-105 cursor-pointer border-b-4 border-yellow-400">
            <Trophy className="text-3xl mb-2 text-yellow-400" />
            <span className="font-semibold text-lg mb-1">Daily Challenges</span>
            <span className="text-gray-400 text-sm text-center">Complete new challenges every day to earn rewards and keep your streak alive.</span>
          </div>
          <div className="bg-[#232a32] rounded-xl p-6 flex flex-col items-center transition transform hover:scale-105 cursor-pointer border-b-4 border-green-400">
            <BarChart className="text-3xl mb-2 text-green-400" />
            <span className="font-semibold text-lg mb-1">Live Leaderboards</span>
            <span className="text-gray-400 text-sm text-center">Track your progress instantly and see how you rank among players around the globe.</span>
          </div>
        </div>
      </section>

      {/* Game Modes Section */}
      <section className="w-full py-12 px-[10%] bg-transparent">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-2 text-center">Challenge Yourself in These Modes</h2>
          <p className="text-gray-300 mb-8 text-center max-w-2xl mx-auto">Sharpen your mind and have fun with a variety of exciting game modes.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Memory Pulse */}
            <div className="bg-[#232a32] rounded-xl p-12 flex flex-col items-center justify-center transition transform hover:scale-105 cursor-pointer border-b-4 border-white/60">
              <Brain className="w-14 h-14 mb-6 text-gray-200" />
              <span className="font-semibold text-lg mb-1">Memory Pulse</span>
              <span className="text-gray-400 text-sm text-center">Test and train your memory.</span>
            </div>
            {/* Word Quest */}
            <div className="bg-[#232a32] rounded-xl p-12 flex flex-col items-center justify-center transition transform hover:scale-105 cursor-pointer border-b-4 border-white/60">
              <Search className="w-14 h-14 mb-6 text-gray-200" />
              <span className="font-semibold text-lg mb-1">Word Quest</span>
              <span className="text-gray-400 text-sm text-center">Find words in a grid faster than your opponent.</span>
            </div>
            {/* Math Blitz */}
            <div className="bg-[#232a32] rounded-xl p-12 flex flex-col items-center justify-center transition transform hover:scale-105 cursor-pointer border-b-4 border-white/60">
              <Calculator className="w-14 h-14 mb-6 text-gray-200" />
              <span className="font-semibold text-lg mb-1">Math Blitz</span>
              <span className="text-gray-400 text-sm text-center">Solve math problems quickly.</span>
            </div>
            {/* Sudoku Sphere */}
            <div className="bg-[#232a32] rounded-xl p-12 flex flex-col items-center justify-center transition transform hover:scale-105 cursor-pointer border-b-4 border-white/60">
              <Grid className="w-14 h-14 mb-6 text-gray-200" />
              <span className="font-semibold text-lg mb-1">Sudoku Sphere</span>
              <span className="text-gray-400 text-sm text-center">Classic sudoku puzzles, competitive twist.</span>
            </div>
            {/* Jigsaw Jam */}
            <div className="bg-[#232a32] rounded-xl p-12 flex flex-col items-center justify-center transition transform hover:scale-105 cursor-pointer border-b-4 border-white/60">
              <Puzzle className="w-14 h-14 mb-6 text-gray-200" />
              <span className="font-semibold text-lg mb-1">Jigsaw Jam</span>
              <span className="text-gray-400 text-sm text-center">Piece together puzzles fast.</span>
            </div>
            {/* Chess Clash */}
            <div className="bg-[#232a32] rounded-xl p-12 flex flex-col items-center justify-center transition transform hover:scale-105 cursor-pointer border-b-4 border-white/60">
              <Crown className="w-14 h-14 mb-6 text-gray-200" />
              <span className="font-semibold text-lg mb-1">Chess Clash</span>
              <span className="text-gray-400 text-sm text-center">Fast-paced chess duels.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#181e24] py-6 text-center text-gray-500 text-sm px-[10%]" id="support">
        &copy; {new Date().getFullYear()} Neuro Clash. All rights reserved.
      </footer>
    </div>
  );
} 