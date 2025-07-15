import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../lib/supabaseClients';

// Utility to generate a random word grid and word list (replace with your actual logic)
function generateGameGridAndWords() {
  // For now, just mock a 12x12 grid and 12 words
  const words = [
    'APPLE', 'BANANA', 'ORANGE', 'GRAPE', 'PEACH', 'MANGO',
    'BERRY', 'PLUM', 'LEMON', 'LIME', 'PEAR', 'KIWI',
  ];
  const grid = Array.from({ length: 12 }, () =>
    Array.from({ length: 12 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
  );
  return { grid, words };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');
  const { userId, difficulty } = req.body;
  if (!userId || !difficulty) {
    return res.status(400).json({ error: 'Missing userId or difficulty' });
  }

  // 1. Try to find a waiting game
  const { data: waitingGames, error: findError } = await supabase
    .from('games')
    .select('*')
    .eq('status', 'waiting')
    .is('player2_id', null)
    .eq('difficulty', difficulty)
    .limit(1);

  if (findError) return res.status(500).json({ error: findError.message });

  if (waitingGames && waitingGames.length > 0) {
    // 2. Join as player2 and start the game
    const game = waitingGames[0];
    // If grid/words not set, generate them
    let grid = game.grid;
    let words = game.words;
    if (!grid || !words) {
      const generated = generateGameGridAndWords();
      grid = generated.grid;
      words = generated.words;
    }
    const { data: updated, error: updateError } = await supabase
      .from('games')
      .update({
        player2_id: userId,
        status: 'active',
        grid,
        words,
        started_at: new Date().toISOString(),
      })
      .eq('id', game.id)
      .select()
      .single();
    if (updateError) return res.status(500).json({ error: updateError.message });
    return res.status(200).json({ game: updated });
  } else {
    // 3. No waiting game, create a new one
    const { grid, words } = generateGameGridAndWords();
    const { data: created, error: createError } = await supabase
      .from('games')
      .insert([
        {
          player1_id: userId,
          status: 'waiting',
          grid,
          words,
          difficulty,
        },
      ])
      .select()
      .single();
    if (createError) return res.status(500).json({ error: createError.message });
    return res.status(200).json({ game: created });
  }
} 