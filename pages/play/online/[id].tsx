import { useRouter } from 'next/router';

export default function OnlineGamePage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#181e24] text-white">
      <h1 className="text-3xl font-bold mb-4">Online Game</h1>
      <p className="text-lg">Game ID: {id}</p>
      {/* TODO: Add your online game logic here */}
    </div>
  );
} 