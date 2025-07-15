import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Bot, Users, ArrowLeft } from 'lucide-react';
import '../app/globals.css';

function GameSetupTile({ icon, title, description, onClick, colorClass }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  colorClass: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-between bg-[#232a32] rounded-2xl shadow-xl border border-gray-500/30 px-12 py-12 w-full max-w-xs ${colorClass} cursor-pointer transition-transform hover:scale-105`}
      onClick={onClick}
      tabIndex={0}
      role="button"
      style={{ outline: 'none' }}
    >
      <div className="mb-6">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2 text-center">{title}</h3>
      <p className="text-gray-300 text-center mb-2 text-lg">{description}</p>
    </div>
  );
}

export default function GameSetupPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isSignedIn) {
      router.replace('/sign-in');
    }
  }, [isSignedIn, router]);

  if (!isSignedIn) return null;

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#181e24] text-white px-4 py-6">
      <div className="w-full max-w-4xl mx-auto mt-8">
        <div className="flex items-center gap-3 mb-4 justify-center">
          <button
            onClick={() => router.push('/gamemodechoose')}
            className="flex items-center gap-2 text-gray-300 hover:text-white bg-[#232a32] rounded-full px-4 py-2 shadow border border-gray-600 transition cursor-pointer"
            aria-label="Back to Game Mode Choose"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h2 className="text-4xl font-extrabold">Choose Your Game Mode</h2>
        </div>
        <div className="text-gray-400 text-center mb-10 text-lg">Select a mode to play against the CPU or real players.</div>
        <div className="flex flex-col md:flex-row gap-6 w-full justify-center">
          <GameSetupTile
            icon={<Bot className="w-14 h-14 text-green-400" />}
            title="Play vs CPU"
            description="Challenge the computer at your own pace. Great for practice and improving your skills!"
            onClick={() => router.push('/gamesetupcpumode')}
            colorClass="hover:ring-2 hover:ring-green-400"
          />
          <GameSetupTile
            icon={<Users className="w-14 h-14 text-blue-400" />}
            title="Play Online"
            description="Compete against real players in fast-paced online matches. Climb the leaderboard!"
            onClick={() => router.push('/gamesetuponline')}
            colorClass="hover:ring-2 hover:ring-blue-400"
          />
        </div>
      </div>
    </div>
  );
} 