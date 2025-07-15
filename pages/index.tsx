import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Swords, Globe, Trophy, BarChart } from "lucide-react";
import '../app/globals.css';

export default function Home() {
  const { isSignedIn } = useUser();

  return (
    <div className="min-h-screen bg-[#181e24] text-white flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 py-20 px-[10%]">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-center">Neuro Clash</h1>
        <p className="text-lg md:text-xl text-gray-300 mb-8 text-center max-w-2xl">Challenge players worldwide in real-time 1v1 word search battles. Find more words than your opponent in 3 minutes and climb the leaderboard!</p>
        <Link href={isSignedIn ? "/gamemodechoose" : "/sign-in"}>
          <button className="bg-blue-500 text-white font-bold px-8 py-3 rounded-xl text-lg shadow mb-8 transition cursor-pointer transform hover:scale-105">Play Now</button>
        </Link>
        <div className="flex flex-col items-center gap-4">
          <div className="bg-[#232a32] rounded-xl p-6 flex flex-col items-center shadow w-72 transition transform hover:scale-105 hover:bg-[#2d3640] cursor-pointer">
            <Swords className="w-12 h-12 mb-2 text-blue-400" />
            <span className="font-semibold text-xl mb-1">Neuro Clash</span>
            <span className="text-gray-400 text-sm text-center">Find words in a grid faster than your opponent. Real-time, competitive, and fun!</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="scroll-mt-24 bg-[#20262c] py-12 px-[10%]">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-2 text-center">Compete, Connect, and Conquer</h2>
          <p className="text-gray-300 mb-8 text-center max-w-2xl">Join players worldwide, challenge your friends in real time, and earn exclusive rewards to dominate the leaderboard!</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <div className="bg-[#232a32] rounded-xl p-6 flex flex-col items-center shadow transition transform hover:scale-105 hover:bg-[#2d3640] cursor-pointer">
              <Globe className="text-3xl mb-2 text-blue-400" />
              <span className="font-semibold text-lg mb-1">Worldwide 1v1 Battles</span>
              <span className="text-gray-400 text-sm text-center">Challenge anyone, anytime. Prove your word skills against real opponents in fast-paced matches.</span>
            </div>
            <div className="bg-[#232a32] rounded-xl p-6 flex flex-col items-center shadow transition transform hover:scale-105 hover:bg-[#2d3640] cursor-pointer">
              <Trophy className="text-3xl mb-2 text-yellow-400" />
              <span className="font-semibold text-lg mb-1">Daily Challenges</span>
              <span className="text-gray-400 text-sm text-center">Complete new challenges every day to earn rewards and keep your streak alive.</span>
            </div>
            <div className="bg-[#232a32] rounded-xl p-6 flex flex-col items-center shadow transition transform hover:scale-105 hover:bg-[#2d3640] cursor-pointer">
              <BarChart className="text-3xl mb-2 text-green-400" />
              <span className="font-semibold text-lg mb-1">Live Leaderboards</span>
              <span className="text-gray-400 text-sm text-center">Track your progress instantly and see how you rank among players around the globe.</span>
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