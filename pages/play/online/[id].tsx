import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import supabase from '../../../lib/supabaseClients';
import { Clock } from 'lucide-react';
import { getLevelInfo } from '../../../lib/xpUtils';
import { useUser } from '@clerk/nextjs';

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
  player1_color: string;
  player2_color: string;
}

export default function OnlineGamePage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [selecting, setSelecting] = useState(false);
  const [selectedCells, setSelectedCells] = useState<[number, number][]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [xpResult, setXpResult] = useState<{ oldXp: number, newXp: number, oldLevel: number, newLevel: number, xpEarned: number } | null>(null);
  const [usernames, setUsernames] = useState<{ you: string; opponent: string } | null>(null);

  // Determine player identity for use throughout the component
  const youId = user?.id || game?.player1_id;
  const isPlayer1 = game ? youId === game.player1_id : true;

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

  // Timer logic (local only for now)
  useEffect(() => {
    if (!game || game.status !== 'active') return;
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [game, timeLeft]);

  // Game over detection
  const gameOver =
    !!game && (
      timeLeft <= 0 ||
      game.player1_words_found.length >= game.words.length ||
      game.player2_words_found.length >= game.words.length ||
      game.status === 'ended'
    );

  // Fetch usernames for both players
  useEffect(() => {
    if (!game) return;
    async function fetchNames() {
      if (!game) return; // Additional null check
      const youId = user?.id || game.player1_id;
      const oppId = youId === game.player1_id ? game.player2_id : game.player1_id;

      // Fetch your profile
      const youRes = await fetch(`/api/profile?userId=${youId}`);
      type UserProfile = { userId: string; username: string; xp: number; level: number };
      let youData: UserProfile = youRes.ok ? await youRes.json() : { userId: '', username: '', xp: 0, level: 1 };

      // If your profile doesn't exist, create it
      if (!youRes.ok && user) {
        const createRes = await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            username: user.username || user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'Player',
            xp: 0,
            level: 1,
          }),
        });
        if (createRes.ok) {
          youData = await createRes.json();
        }
      }

      // Fetch opponent's profile
      let oppData: UserProfile = { userId: '', username: '', xp: 0, level: 1 };
      if (oppId) {
        const oppRes = await fetch(`/api/profile?userId=${oppId}`);
        if (oppRes.ok) {
          oppData = await oppRes.json();
        } else {
          // If opponent profile doesn't exist, we can't create it without their user data
          console.log('Opponent profile not found for ID:', oppId);
        }
      }

      setUsernames({ you: youData.username || 'You', opponent: oppData.username || 'Opponent' });
    }
    fetchNames();
  }, [game, user]);

  // End game and award XP
  useEffect(() => {
    if (!gameOver || !game || !user) return;
    // Only end once
    if (game.status !== 'ended') {
      // Determine result
      let result: 'win' | 'draw' | 'loss' = 'draw';
      if (game.player1_score > game.player2_score) result = 'win';
      else if (game.player1_score < game.player2_score) result = 'loss';
      // XP table for online: win=100, draw=20, loss=5 (can adjust)
      const xpTable = { win: 100, draw: 20, loss: 5 };
      const xpToAdd = xpTable[result];
      // Fetch current XP before awarding
      fetch(`/api/profile?userId=${user.id}`)
        .then(res => res.json())
        .then(profile => {
          const oldXp = profile.xp ?? 0;
          fetch('/api/profile/add-xp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, xpToAdd }),
          })
            .then(res => res.json())
            .then(data => {
              setXpResult({
                oldXp,
                newXp: data.xp,
                oldLevel: getLevelInfo(oldXp).level,
                newLevel: getLevelInfo(data.xp).level,
                xpEarned: xpToAdd,
              });
              setShowSummary(true);
            });
        });
      // Mark game as ended in Supabase
      supabase.from('games').update({ status: 'ended', ended_at: new Date().toISOString() }).eq('id', game.id);
    }
  }, [gameOver, game, user]);

  // Helper to get the word from selected cells
  function getSelectedWord() {
    if (!game) return '';
    return selectedCells.map(([i, j]) => game.grid[i][j]).join('');
  }

  // Helper to find the path of a word in the grid
  function findWordPath(grid: string[][], word: string) {
    const size = grid.length;
    const directions = [
      [0, 1],    // right
      [1, 0],    // down
      [1, 1],    // down-right
      [1, -1],   // down-left
      [0, -1],   // left
      [-1, 0],   // up
      [-1, -1],  // up-left
      [-1, 1],   // up-right
    ];
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        for (const [dx, dy] of directions) {
          let found = true;
          const path: [number, number][] = [];
          for (let k = 0; k < word.length; k++) {
            const x = i + dx * k;
            const y = j + dy * k;
            if (x < 0 || y < 0 || x >= size || y >= size || grid[x][y] !== word[k]) {
              found = false;
              break;
            }
            path.push([x, y]);
          }
          if (found) return path;
        }
      }
    }
    return null;
  }

  // Mouse/touch handlers
  function handleCellMouseDown(i: number, j: number) {
    setSelecting(true);
    setSelectedCells([[i, j]]);
  }
  function handleCellMouseEnter(i: number, j: number) {
    if (selecting) {
      setSelectedCells((prev) => {
        // Only allow straight lines
        if (prev.length === 0) return [[i, j]];
        const [si, sj] = prev[0];
        const di = i - si;
        const dj = j - sj;
        if (di !== 0 && dj !== 0 && Math.abs(di) !== Math.abs(dj)) return prev;
        // Only allow contiguous
        if (prev.some(([pi, pj]) => pi === i && pj === j)) return prev;
        return [...prev, [i, j]];
      });
    }
  }
  function handleMouseUp() {
    if (!selecting || !game) return;
    const word = getSelectedWord();
    // Always use only the current player's found words for blocking and updating
    const youId = user?.id || game.player1_id;
    const isPlayer1 = youId === game.player1_id;
    const wordsFoundKey = isPlayer1 ? 'player1_words_found' : 'player2_words_found';
    const scoreKey = isPlayer1 ? 'player1_score' : 'player2_score';
    const foundWords = game[wordsFoundKey] as string[];
    // Only check the current player's found words for blocking
    if (
      word.length >= 3 &&
      game.words.includes(word) &&
      !foundWords.includes(word)
    ) {
      // Optimistically update local state for instant feedback
      setGame({
        ...game,
        [wordsFoundKey]: [...foundWords, word],
        [scoreKey]: game[scoreKey] + word.length,
      });
      // Debug logging
      console.log('Attempting to update:', {
        [wordsFoundKey]: [...foundWords, word],
        [scoreKey]: game[scoreKey] + word.length,
        id: game.id
      });
      // Update Supabase with error handling
      supabase
        .from('games')
        .update({
          [wordsFoundKey]: [...foundWords, word],
          [scoreKey]: game[scoreKey] + word.length,
        })
        .eq('id', game.id)
        .select()
        .then(({ error }) => {
          if (error) {
            console.error('Supabase update error:', error);
            alert('Error updating game: ' + error.message);
          }
        });
    }
    setSelecting(false);
    setSelectedCells([]);
  }

  if (loading) return <div>Loading...</div>;
  if (!game) return null;

  // Build a map of cell highlights for found words
  const cellHighlights: { [key: string]: 'blue' | 'red' } = {};
  if (game) {
    const youId = user?.id || game.player1_id;
    const isPlayer1 = youId === game.player1_id;
    const foundWords = isPlayer1 ? game.player1_words_found : game.player2_words_found;
    const color: 'blue' | 'red' = (isPlayer1 ? game.player1_color : game.player2_color) === 'red' ? 'red' : 'blue';
    for (const word of foundWords) {
      const path = findWordPath(game.grid, word);
      if (path) {
        for (const [i, j] of path) {
          cellHighlights[`${i}-${j}`] = color;
        }
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#181e24] text-white px-4 py-6">
      {/* Summary Modal */}
      {showSummary && xpResult && usernames && game && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-[#232a32] rounded-2xl shadow-2xl p-8 w-full max-w-lg flex flex-col items-center gap-6 border border-blue-900">
            <h2 className="text-3xl font-bold text-blue-300 mb-2">Match Summary</h2>
            <div className="text-lg font-semibold mb-2">
              <span className={
                game.player1_score > game.player2_score ? 'text-green-400' :
                  game.player1_score < game.player2_score ? 'text-red-400' :
                    'text-yellow-300'
              }>
                {game.player1_score > game.player2_score ? 'Victory!' :
                  game.player1_score < game.player2_score ? 'Defeat' : 'Draw'}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 mb-2">
              <span className="text-base text-white font-bold">{usernames.you} {game.player1_score} – {game.player2_score} {usernames.opponent}</span>
              <span className="text-xs text-blue-200 font-semibold uppercase tracking-wide">Online Match</span>
            </div>
            <div className="w-full flex flex-col gap-2">
              <div className="flex justify-between w-full">
                <span>XP Earned:</span>
                <span className="text-blue-400 font-bold">+{xpResult.xpEarned}</span>
              </div>
              <div className="flex justify-between w-full">
                <span>Level Progress:</span>
                <span>Level {xpResult.oldLevel} → {xpResult.newLevel}</span>
              </div>
              <div className="flex flex-col gap-1 w-full">
                <span className="text-xs text-gray-400">XP Progress</span>
                <div className="w-full h-4 bg-[#181e24] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.round(getLevelInfo(xpResult.newXp).progress * 100))}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>{getLevelInfo(xpResult.newXp).xpThisLevel} / {getLevelInfo(xpResult.newXp).xpForNext} XP</span>
                  <span>Next Level: {getLevelInfo(xpResult.newXp).xpForNext - getLevelInfo(xpResult.newXp).xpThisLevel} XP</span>
                </div>
              </div>
            </div>
            {/* Mock accolades */}
            <div className="w-full mt-4">
              <div className="text-center text-lg font-bold mb-2 text-blue-200">Top Accolades</div>
              <div className="flex justify-center gap-6">
                <div className="flex flex-col items-center">
                  <span className="text-2xl">🏆</span>
                  <span className="text-yellow-300 font-bold text-sm mt-1">Word Wizard</span>
                  <span className="text-xs text-gray-400">Most words found</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl">⚡</span>
                  <span className="text-green-300 font-bold text-sm mt-1">Speed Demon</span>
                  <span className="text-xs text-gray-400">Fastest solve</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl">🔥</span>
                  <span className="text-red-300 font-bold text-sm mt-1">Comeback King</span>
                  <span className="text-xs text-gray-400">Biggest comeback</span>
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-2 rounded-xl" onClick={() => router.push('/gamesetuponline')}>Play Again</button>
              <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold px-6 py-2 rounded-xl" onClick={() => router.push('/')}>Back to Menu</button>
            </div>
          </div>
        </div>
      )}
      {/* Timer at the very top */}
      <div className="flex flex-col items-center w-full max-w-6xl mx-auto mt-10">
        <div className="flex flex-col items-center w-full">
          {/* Timer */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-4">
              <Clock className="w-10 h-10 text-green-400" />
              <span className="text-4xl font-mono text-green-400">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
          {/* Words to Find Bar */}
          <div className="mb-8 w-full flex justify-center">
            <div className="bg-[#232a32] rounded-xl py-3 px-6 shadow-lg mx-auto max-w-4xl w-full">
              <div className="grid grid-cols-3 md:grid-cols-6 grid-rows-4 md:grid-rows-2 gap-2 w-full">
                {game.words.map((word) => {
                  const foundByPlayer1 = game.player1_words_found.includes(word);
                  const foundByPlayer2 = game.player2_words_found.includes(word);
                  const youId = user?.id || game.player1_id;
                  const isPlayer1 = youId === game.player1_id;
                  const foundByYou = isPlayer1
                    ? foundByPlayer1
                    : foundByPlayer2;
                  let color = '';
                  if (foundByPlayer1 && foundByPlayer2) color = 'bg-green-600 text-white';
                  else if (foundByYou) color = (isPlayer1 ? game.player1_color : game.player2_color) === 'red' ? 'bg-red-500 text-white' : 'bg-blue-600 text-white';
                  else color = 'bg-[#181e24] text-gray-200';
                  return (
                    <span
                      key={word}
                      className={`px-2 md:px-4 py-1 md:py-2 rounded-lg text-sm md:text-base font-mono font-bold text-center transition border border-[#232a32] shadow-sm select-none ${color}`}
                    >
                      {word}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Score Bar - Only visible on mobile */}
      <div className="md:hidden w-full px-4 mb-4">
        <div className="bg-[#232a32] rounded-xl p-4 shadow-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#181e24] flex items-center justify-center text-2xl">🎮</div>
              <div className="flex flex-col">
                <span className="font-bold text-white">{usernames?.you || 'You'}</span>
                <span className="text-blue-400 text-2xl font-mono">{game.player1_score}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="font-bold text-white">{usernames?.opponent || 'Opponent'}</span>
                <span className="text-pink-400 text-2xl font-mono">{game.player2_score}</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#181e24] flex items-center justify-center text-2xl">👤</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex flex-col md:flex-row justify-center items-start gap-8 px-2 py-8 max-w-6xl w-full mx-auto">
        {/* Player Panel - Hidden on mobile, visible on desktop */}
        <div className="hidden md:flex bg-[#232a32] rounded-2xl p-6 w-64 flex-col items-center shadow-lg">
          <div className={`w-16 h-16 rounded-full bg-[#181e24] flex items-center justify-center mb-2 text-4xl ${(isPlayer1 ? game.player1_color : game.player2_color) === 'red' ? 'text-red-500' : 'text-blue-400'}`}>🎮</div>
          <span className="font-bold text-lg mb-1">{usernames?.you || 'You'}</span>
          <span className={`${(isPlayer1 ? game.player1_color : game.player2_color) === 'red' ? 'text-red-500' : 'text-blue-400'} text-3xl font-mono mb-4`}>{isPlayer1 ? game.player1_score : game.player2_score}</span>
          <div className="flex flex-col gap-1 w-full mt-2">
            {(isPlayer1 ? game.player1_words_found : game.player2_words_found).map((w) => (
              <div key={w} className={`${(isPlayer1 ? game.player1_color : game.player2_color) === 'red' ? 'bg-red-500' : 'bg-blue-600'} text-white rounded px-1 py-1 text-center text-xs font-bold whitespace-nowrap overflow-hidden text-ellipsis`}>{w}</div>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div
          className="bg-[#232a32] rounded-2xl p-4 md:p-6 flex flex-col items-center shadow-lg w-full max-w-xl mx-auto"
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchEnd={handleMouseUp}
          onTouchStart={(e) => e.preventDefault()}
          onTouchMove={(e) => e.preventDefault()}
          style={{ touchAction: 'none' }}
        >
          <div className="font-bold text-lg mb-2 text-gray-200">Select letters</div>
          <div className="flex flex-col gap-1 mb-2">
            {game.grid.map((row, i) => (
              <div key={i} className="grid grid-cols-12 gap-1">
                {row.map((cell, j) => {
                  const isSelected = selectedCells.some(([si, sj]) => si === i && sj === j);
                  const highlight = cellHighlights[`${i}-${j}`];
                  let cellColor = '';
                  if (highlight === 'blue') cellColor = 'bg-blue-600 text-white';
                  else if (highlight === 'red') cellColor = 'bg-red-500 text-white';
                  else if (highlight === 'green') cellColor = 'bg-green-600 text-white';
                  else if (isSelected) cellColor = 'bg-blue-500 text-white';
                  else cellColor = 'bg-[#181e24] text-white';
                  return (
                    <div
                      key={i + '-' + j}
                      className={`w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded text-sm md:text-lg font-mono border border-[#2d3640] select-none cursor-pointer ${cellColor}`}
                      onMouseDown={() => handleCellMouseDown(i, j)}
                      onMouseEnter={() => handleCellMouseEnter(i, j)}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        handleCellMouseDown(i, j);
                      }}
                      onTouchMove={(e) => {
                        e.preventDefault();
                        const touch = e.touches[0];
                        const element = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;
                        if (element && element.dataset.cell) {
                          const [ti, tj] = element.dataset.cell.split('-').map(Number);
                          handleCellMouseEnter(ti, tj);
                        }
                      }}
                      data-cell={`${i}-${j}`}
                      style={{ touchAction: 'none' }}
                    >
                      {cell}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-400">Drag to select words • Minimum 3 letters</div>
        </div>

        {/* Opponent Panel - Hidden on mobile, visible on desktop */}
        <div className="hidden md:flex bg-[#232a32] rounded-2xl p-6 w-64 flex-col items-center shadow-lg">
          <div className={`w-16 h-16 rounded-full bg-[#181e24] flex items-center justify-center mb-2 text-4xl ${(isPlayer1 ? game.player2_color : game.player1_color) === 'red' ? 'text-red-500' : 'text-blue-400'}`}>👤</div>
          <span className="font-bold text-lg mb-1">{usernames?.opponent || 'Opponent'}</span>
          <span className={`${(isPlayer1 ? game.player2_color : game.player1_color) === 'red' ? 'text-red-500' : 'text-blue-400'} text-3xl font-mono mb-4`}>{isPlayer1 ? game.player2_score : game.player1_score}</span>
          <div className="flex flex-col gap-1 w-full mt-2">
            {(isPlayer1 ? game.player2_words_found : game.player1_words_found).map((w) => (
              <div key={w} className={`${(isPlayer1 ? game.player2_color : game.player1_color) === 'red' ? 'bg-red-500' : 'bg-blue-600'} text-white rounded px-1 py-1 text-center text-xs font-bold whitespace-nowrap overflow-hidden text-ellipsis`}>{w}</div>
            ))}
          </div>
        </div>
      </div>


    </div>
  );
} 