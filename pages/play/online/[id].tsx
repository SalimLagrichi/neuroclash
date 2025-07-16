import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function OnlineGamePage() {
  const router = useRouter();
  const { id } = router.query;
  const [countdown, setCountdown] = useState(3);
  const [showGame, setShowGame] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowGame(true);
    }
  }, [countdown]);

  if (!showGame) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#181e24] text-white">
        <div className="flex flex-col items-center">
          <div className="mb-4">
            <svg width="64" height="64" fill="none" viewBox="0 0 24 24"><path d="M7 21V19M17 21V19M7 19C7 16.7909 8.79086 15 11 15H13C15.2091 15 17 16.7909 17 19M7 19H17" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M9 7L12 4L15 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 4V15" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Match Found!</h1>
          <p className="mb-6 text-lg text-gray-300">Prepare for battle</p>
          <div className="bg-[#232a32] rounded-2xl shadow-2xl border-2 border-gray-500/40 px-8 py-8 max-w-md w-full flex flex-col items-center mb-6">
            <span className="text-lg font-semibold text-white mb-2">Game ID: {id}</span>
            <span className="text-gray-400 text-sm text-center mb-2">Your opponent has joined. Get ready!</span>
            <span className="text-5xl font-extrabold text-purple-400 mb-2">{countdown}</span>
            <span className="text-gray-300">Starting in...</span>
          </div>
          <p className="text-gray-400 mt-4">Get ready to find words faster than your opponent!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#181e24] text-white">
      <h1 className="text-3xl font-bold mb-4">Online Game</h1>
      <p className="text-lg">Game ID: {id}</p>
      {/* TODO: Add your online game logic here */}
    </div>
  );
} 