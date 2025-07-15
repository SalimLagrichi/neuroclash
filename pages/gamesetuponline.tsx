import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Swords, Clock, UserRound, Trophy as TrophyIcon, ArrowLeft, Settings, Handshake, Medal } from "lucide-react";
import '../app/globals.css';

function GameSetupOnlineCard({ user, onFindMatch, loading, waiting }: { user?: { imageUrl?: string; firstName?: string | null }; onFindMatch: () => void; loading: boolean; waiting: boolean }) {
  return (
    <div className="bg-[#232a32] rounded-2xl shadow-2xl border-2 border-gray-500/40 px-8 py-8 max-w-md w-full flex flex-col items-center">
      {/* Personalization */}
      <div className="flex flex-col items-center mb-4">
        {user?.imageUrl && (
          <img src={user.imageUrl} alt="avatar" className="w-14 h-14 rounded-full mb-2 border-2 border-blue-400 shadow" />
        )}
        <span className="text-lg font-semibold text-white">Welcome{user?.firstName ? `, ${user.firstName}` : ''}!</span>
      </div>
      <Swords className="w-12 h-12 text-blue-400 mb-2 mx-auto" />
      <h2 className="text-2xl font-bold text-white mb-4 text-center">Neuro Clash</h2>
      <div className="flex justify-between w-full mb-6 mt-2">
        <div className="flex flex-col items-center flex-1">
          <Clock className="w-6 h-6 text-blue-300 mb-1" />
          <span className="text-xs text-gray-200">3 Minutes</span>
        </div>
        <div className="flex flex-col items-center flex-1">
          <UserRound className="w-6 h-6 text-green-300 mb-1" />
          <span className="text-xs text-gray-200">Online 1v1</span>
        </div>
        <div className="flex flex-col items-center flex-1">
          <TrophyIcon className="w-6 h-6 text-yellow-300 mb-1" />
          <span className="text-xs text-gray-200">Best Score</span>
        </div>
      </div>
      <button
        className="w-full bg-gradient-to-r from-purple-500 to-blue-400 hover:from-purple-400 hover:to-blue-300 text-white font-bold py-3 rounded-xl text-lg shadow transition mb-2 cursor-pointer transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={onFindMatch}
        disabled={loading || waiting}
      >
        {loading ? 'Finding Match...' : 'Find Match!'}
      </button>
      {waiting && (
        <div className="mt-4 text-center text-blue-300 font-semibold animate-pulse">
          Waiting for opponent to join...
        </div>
      )}
      {/* Game Mode Buttons */}
      <div className="w-full flex flex-col gap-3 mt-2">
        <button className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 font-bold py-3 rounded-xl text-lg shadow transition mb-2 cursor-pointer">
          <Settings className="w-5 h-5 text-yellow-500" />
          Custom Challenge
        </button>
        <button className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 font-bold py-3 rounded-xl text-lg shadow transition mb-2 cursor-pointer">
          <Handshake className="w-5 h-5 text-pink-500" />
          Play a Friend
        </button>
        <button className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 font-bold py-3 rounded-xl text-lg shadow transition mb-2 cursor-pointer">
          <Medal className="w-5 h-5 text-green-500" />
          Tournaments
        </button>
      </div>
    </div>
  );
}

export default function GameSetupOnlinePage() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Poll for game status if waiting
  useEffect(() => {
    if (!waiting || !gameId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/game-status?gameId=${gameId}`);
        if (!res.ok) {
          setError('Failed to check game status.');
          return;
        }
        const data = await res.json();
        if (data?.game?.player2_id) {
          clearInterval(interval);
          router.push(`/play/online/${gameId}`);
        }
      } catch (e) {
        setError('Error checking game status.');
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [waiting, gameId, router]);

  const handleFindMatch = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/matchmaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, difficulty: 'medium' }),
      });
      if (!res.ok) {
        setError('Failed to find or create a match.');
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data?.game) {
        setGameId(data.game.id);
        if (!data.game.player2_id) {
          setWaiting(true);
        } else {
          router.push(`/play/online/${data.game.id}`);
        }
      } else {
        setError('Failed to find or create a match.');
      }
    } catch (e) {
      setError('Error connecting to matchmaking.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#181e24] text-white px-4 py-6">
      <div className="w-full max-w-md">
        <button
          onClick={() => router.push('/gamesetup')}
          className="flex items-center gap-2 text-gray-300 hover:text-white bg-[#232a32] rounded-full px-4 py-2 shadow border border-gray-600 transition mb-6 cursor-pointer"
          aria-label="Back to Game Mode Choose"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <GameSetupOnlineCard user={user ?? undefined} onFindMatch={handleFindMatch} loading={loading} waiting={waiting} />
        {error && (
          <div className="mt-2 text-center text-red-400 font-semibold">{error}</div>
        )}
      </div>
    </div>
  );
} 