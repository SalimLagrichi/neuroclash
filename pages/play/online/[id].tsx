import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import supabase from '../../../lib/supabaseClients';

interface Game {
  id: string;
  player1_id: string;
  player2_id: string;
  status: string;
  grid: string[][];
  words: string[];
  player1_score: number;
  player2_score: number;
  player1_words_found: string[];
  player2_words_found: string[];
  started_at: string | null;
  ended_at: string | null;
  difficulty: string;
  winner_id: string | null;
  game_type: string;
}

export default function OnlineGamePage() {
  const router = useRouter();
  const { id } = router.query;
  const [game, setGame] = useState<Game | null>(null);
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
          setGame(data as Game);
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
          setGame(payload.new as Game);
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
      <div className="flex gap-8 mb-8">
        <div className="bg-[#232a32] p-4 rounded-xl flex flex-col items-center">
          <span className="font-bold">You</span>
          <span className="text-2xl">{game.player1_score}</span>
        </div>
        <div className="bg-[#232a32] p-4 rounded-xl flex flex-col items-center">
          <span className="font-bold">Opponent</span>
          <span className="text-2xl">{game.player2_score}</span>
        </div>
      </div>
      <div className="mb-8">
        <div className="font-bold mb-2">Words to Find:</div>
        <div className="flex flex-wrap gap-2">
          {game.words.map(word => (
            <span key={word} className="bg-blue-900 px-3 py-1 rounded text-white">{word}</span>
          ))}
        </div>
      </div>
      <div className="bg-[#232a32] p-4 rounded-xl">
        <table>
          <tbody>
            {game.grid.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} className="w-8 h-8 text-center border border-gray-700">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 