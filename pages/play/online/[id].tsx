import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import supabase from '../../../lib/supabaseClients';

export default function OnlineGamePage() {
  const router = useRouter();
  const { id } = router.query;
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch game state on mount
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    supabase
      .from('games')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          // handle error
        } else {
          setGame(data);
        }
        setLoading(false);
      });
  }, [id]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel('game-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${id}` },
        (payload) => {
          setGame(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!game) return <div>Game not found.</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#181e24] text-white">
      <h1 className="text-3xl font-bold mb-4">Online Game</h1>
      <pre className="bg-[#232a32] p-4 rounded-xl max-w-2xl w-full overflow-x-auto text-sm text-green-200 shadow-lg">{JSON.stringify(game, null, 2)}</pre>
      {/* TODO: Render your game board and player info here */}
    </div>
  );
} 