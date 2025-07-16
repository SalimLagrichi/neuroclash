import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../lib/supabaseClients';
import { wordBank } from '../../data/wordbank';

// Utility to generate a random word grid and word list (now embeds words in the grid and only returns placed words)
function generateGameGridAndWords() {
  const size = 12;
  // Flatten all words from all sets in wordBank.mixed
  const allWords = Array.from(new Set(wordBank.mixed.flat().map(w => w.toUpperCase())));
  // Randomly select 12 unique words
  function getRandomWords(arr: string[], n: number) {
    const result = [];
    const used = new Set();
    while (result.length < n && used.size < arr.length) {
      const idx = Math.floor(Math.random() * arr.length);
      if (!used.has(idx)) {
        result.push(arr[idx]);
        used.add(idx);
      }
    }
    return result;
  }
  const selectedWords = getRandomWords(allWords, 12);
  // Initialize empty grid
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''));
  const directions = [
    [0, 1],   // right
    [1, 0],   // down
    [1, 1],   // down-right
    [-1, 1],  // up-right
    [0, -1],  // left
    [-1, 0],  // up
    [1, -1],  // down-left
    [-1, -1], // up-left
  ];
  function canPlace(word: string, x: number, y: number, dx: number, dy: number) {
    for (let i = 0; i < word.length; i++) {
      const nx = x + dx * i;
      const ny = y + dy * i;
      if (nx < 0 || ny < 0 || nx >= size || ny >= size) return false;
      if (grid[nx][ny] && grid[nx][ny] !== word[i]) return false;
    }
    return true;
  }
  function placeWord(word: string) {
    // Try each direction systematically
    for (const [dx, dy] of directions) {
      // Try multiple starting positions for each direction
      for (let attempt = 0; attempt < 200; attempt++) {
        const x = Math.floor(Math.random() * size);
        const y = Math.floor(Math.random() * size);
        if (canPlace(word, x, y, dx, dy)) {
          for (let i = 0; i < word.length; i++) {
            grid[x + dx * i][y + dy * i] = word[i];
          }
          return true;
        }
      }
    }
    return false;
  }
  const placedWords: string[] = [];
  selectedWords.forEach(word => {
    if (placeWord(word)) {
      placedWords.push(word);
    } else {
      console.log(`Failed to place word: ${word}`);
    }
  });

  // If we couldn't place all words, try with shorter words or different placement strategy
  if (placedWords.length < 12) {
    console.log(`Only placed ${placedWords.length}/12 words. Trying to place remaining words...`);
    const remainingWords = selectedWords.filter(w => !placedWords.includes(w));
    for (const word of remainingWords) {
      if (placeWord(word)) {
        placedWords.push(word);
      }
    }
  }

  console.log(`Successfully placed ${placedWords.length}/12 words:`, placedWords);

  // Fill empty cells with random letters
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (!grid[i][j]) {
        grid[i][j] = alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
  }
  return { grid, words: placedWords };
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
          game_type: 'multiplayer',
        },
      ])
      .select()
      .single();
    if (createError) return res.status(500).json({ error: createError.message });
    return res.status(200).json({ game: created });
  }
} 