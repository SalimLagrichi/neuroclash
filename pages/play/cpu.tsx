import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { Clock } from 'lucide-react';
import React from 'react';
import { useUser } from '@clerk/nextjs';
import { wordBank } from '../../data/wordbank';

function getRandomWordSet() {
  // Flatten all sets in wordBank.mixed
  const allSets = wordBank.mixed;
  const randomSet = allSets[Math.floor(Math.random() * allSets.length)];
  // If the set has less than 12 words, fill with words from other sets
  if (randomSet.length >= 12) return randomSet.slice(0, 12).map(w => w.toUpperCase());
  const extraWords = allSets.flat().filter(w => !randomSet.includes(w));
  const needed = 12 - randomSet.length;
  const shuffledExtra = extraWords.sort(() => Math.random() - 0.5).slice(0, needed);
  return [...randomSet, ...shuffledExtra].slice(0, 12).map(w => w.toUpperCase());
}

const GRID_SIZE = 12;

// Utility to shuffle an array
function shuffle<T>(array: T[]): T[] {
  let arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Directions: [dx, dy]
const DIRECTIONS = [
  [0, 1],    // right
  [1, 0],    // down
  [1, 1],    // down-right
  [1, -1],   // down-left
  [0, -1],   // left
  [-1, 0],   // up
  [-1, -1],  // up-left
  [-1, 1],   // up-right
];

function canPlace(grid: string[][], word: string, x: number, y: number, dx: number, dy: number): boolean {
  for (let i = 0; i < word.length; i++) {
    const nx = x + dx * i;
    const ny = y + dy * i;
    if (
      nx < 0 || nx >= grid.length ||
      ny < 0 || ny >= grid.length ||
      (grid[nx][ny] !== '' && grid[nx][ny] !== word[i])
    ) {
      return false;
    }
  }
  return true;
}

function placeWord(grid: string[][], word: string): boolean {
  const size = grid.length;
  const tries = size * size * 4;
  const directions = shuffle(DIRECTIONS);
  for (let attempt = 0; attempt < tries; attempt++) {
    const dxdy = directions[attempt % directions.length];
    const dx = dxdy[0];
    const dy = dxdy[1];
    const x = Math.floor(Math.random() * size);
    const y = Math.floor(Math.random() * size);
    if (canPlace(grid, word, x, y, dx, dy)) {
      for (let i = 0; i < word.length; i++) {
        grid[x + dx * i][y + dy * i] = word[i];
      }
      return true;
    }
  }
  return false;
}

function generateWordSearch(words: string[], size: number): string[][] {
  // Create empty grid
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''));
  // Place each word
  for (const word of shuffle(words)) {
    placeWord(grid, word);
  }
  // Fill empty cells with random letters
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (!grid[i][j]) {
        grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }
  return grid;
}

function getCpuMatchXp(result: 'win' | 'draw' | 'loss', difficulty: 'easy' | 'medium' | 'hard') {
  const xpTable = {
    win: { easy: 50, medium: 100, hard: 200 },
    draw: { easy: 15, medium: 20, hard: 30 },
    loss: { easy: 2, medium: 5, hard: 10 },
  };
  return xpTable[result][difficulty];
}

// XP table for levels 1–50
const xpTable = [
  300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200,
  1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200,
  2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000, 3100, 3200,
  3300, 3400, 3500, 3600, 3700, 3800, 3900, 4000, 4100, 4200,
  4300, 4400, 4500, 4600, 4700, 4800, 4900, 5000, 5100
];
function getLevelInfo(totalXp: number) {
  let level = 1;
  let xpForNext = xpTable[0];
  let xpSum = 0;
  for (let i = 0; i < xpTable.length; i++) {
    if (totalXp < xpSum + xpTable[i]) {
      xpForNext = xpTable[i];
      break;
    }
    xpSum += xpTable[i];
    level = i + 2;
  }
  const xpThisLevel = totalXp - xpSum;
  const progress = xpForNext ? xpThisLevel / xpForNext : 1;
  return { level, xpThisLevel, xpForNext, progress };
}

function GameBoard({ difficulty }: { difficulty: 'easy' | 'medium' | 'hard' }) {
  const [wordSet] = useState(() => getRandomWordSet());
  const [timeLeft, setTimeLeft] = useState(180);
  const [playerWords, setPlayerWords] = useState<string[]>([]);
  const [cpuWords, setCpuWords] = useState<string[]>([]);
  const [grid] = useState(() => generateWordSearch(wordSet, GRID_SIZE));
  const [playerScore, setPlayerScore] = useState(0);
  const [cpuScore, setCpuScore] = useState(0);
  const [cpuWordsToFind, setCpuWordsToFind] = useState<string[]>([]);
  const [cpuWordIndex, setCpuWordIndex] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const { user } = useUser();
  const [showSummary, setShowSummary] = useState(false);
  const [xpResult, setXpResult] = useState<{ oldXp: number, newXp: number, oldLevel: number, newLevel: number, xpEarned: number } | null>(null);

  // Drag-to-select state
  const [selecting, setSelecting] = useState(false);
  const [selectedCells, setSelectedCells] = useState<[number, number][]>([]);
  const [foundPaths, setFoundPaths] = useState<{ [word: string]: [number, number][] }>({});

  // Setup CPU word list and timing on mount/difficulty change
  useEffect(() => {
    let wordCount = 5;
    if (difficulty === 'medium') { wordCount = 8; }
    if (difficulty === 'hard') { wordCount = 11; }
    const availableWords = [...wordSet];
    const cpuWordsList: string[] = [];
    for (let i = 0; i < wordCount; i++) {
      const idx = Math.floor(Math.random() * availableWords.length);
      cpuWordsList.push(availableWords.splice(idx, 1)[0]);
    }
    setCpuWordsToFind(cpuWordsList);
    setCpuWordIndex(0);
    setCpuWords([]);
    setCpuScore(0);
    startTimeRef.current = Date.now();
    setTimeLeft(180);
  }, [difficulty, wordSet]);

  // Single timer for both game and CPU
  useEffect(() => {
    startTimeRef.current = startTimeRef.current || Date.now();
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
      // CPU logic
      const elapsed = Math.floor((Date.now() - (startTimeRef.current || Date.now())) / 1000);
      if (
        cpuWordIndex < cpuWordsToFind.length &&
        elapsed >= ((difficulty === 'easy' ? 36 : difficulty === 'medium' ? 22 : 16) * (cpuWordIndex + 1))
      ) {
        const word = cpuWordsToFind[cpuWordIndex];
        // Only add if not already found
        setCpuWords((prev) => {
          if (!prev.includes(word)) {
            setCpuScore((score) => score + word.length);
            return [...prev, word];
          }
          return prev;
        });
        setCpuWordIndex((idx) => idx + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [cpuWordsToFind, cpuWordIndex, difficulty]);

  // Drag logic
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
    if (selecting && selectedCells.length >= 3) {
      const letters = selectedCells.map(([i, j]) => grid[i][j]).join('');
      const reversed = selectedCells.map(([i, j]) => grid[i][j]).reverse().join('');
      let found = null;
      for (const word of wordSet) {
        if (
          (letters === word || reversed === word) &&
          !playerWords.includes(word)
        ) {
          found = word;
          break;
        }
      }
      if (found) {
        setPlayerWords((prev) => [...prev, found]);
        setFoundPaths((prev) => ({ ...prev, [found]: selectedCells.slice() }));
        setPlayerScore((prev) => prev + found.length);
      }
    }
    setSelecting(false);
    setSelectedCells([]);
  }

  // End of game
  const gameOver =
    timeLeft <= 0 ||
    playerWords.length >= wordSet.length ||
    cpuWords.length >= wordSet.length;

  // Determine result and award XP when game ends
  useEffect(() => {
    if (!gameOver || !user) return;
    let result: 'win' | 'draw' | 'loss' = 'draw';
    if (playerScore > cpuScore) result = 'win';
    else if (playerScore < cpuScore) result = 'loss';
    const xpToAdd = getCpuMatchXp(result, difficulty);
    // Fetch current XP before awarding
    fetch(`/api/profile?userId=${user.id}`)
      .then(res => res.json())
      .then(profile => {
        const oldXp = profile.xp ?? 0;
        const oldLevel = getLevelInfo(oldXp).level;
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
  }, [gameOver, user, playerScore, cpuScore, difficulty]);

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#181e24] text-white overflow-y-hidden" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      {/* Timer and Words to Find Bar above main row */}
      <div className="flex flex-col items-center w-full max-w-6xl mx-auto mt-10">
        {/* Timer */}
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-4">
            <Clock className="w-10 h-10 text-green-400" />
            <span className="text-4xl font-mono text-green-400">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>
        {/* Horizontal Words to Find Bar - 2 rows of 6 words */}
        <div className="bg-[#232a32] rounded-xl py-3 px-6 shadow-lg mb-4 mx-auto max-w-fit">
          <div className="grid grid-cols-6 grid-rows-2 gap-2">
            {wordSet.map((word, idx) => {
              const foundByPlayer = playerWords.includes(word);
              const foundByCPU = cpuWords.includes(word);
              let colorClass = '';
              if (foundByPlayer && foundByCPU) {
                colorClass = 'bg-green-600 text-white border border-green-800'; // both found: green 600
              } else if (foundByPlayer) {
                colorClass = 'bg-blue-600 text-white border border-blue-800'; // player: blue 600
              } else if (foundByCPU) {
                colorClass = 'bg-red-600 text-white border border-red-800'; // cpu: red 600
              } else {
                colorClass = 'bg-[#181e24] text-white border border-[#232a32]';
              }
              return (
                <span
                  key={word}
                  className={`px-3 py-1 rounded text-sm font-mono border border-[#232a32] shadow-sm text-center select-none transition ${colorClass}`}
                  style={{ minWidth: '60px', display: 'inline-block' }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </div>
      </div>
      {/* Main Game Area - all boxes level */}
      <div className="flex flex-col md:flex-row justify-center items-start gap-8 px-2 max-w-6xl w-full mx-auto">
        {/* Player Panel */}
        <div className="bg-[#232a32] rounded-2xl p-6 w-full md:w-64 flex flex-col items-center shadow-lg">
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt="avatar" className="w-14 h-14 rounded-full mb-2 border-2 border-blue-400 shadow" />
          ) : (
            <span className="text-3xl mb-2">🎮</span>
          )}
          <span className="font-bold text-lg mb-2">You</span>
          <span className="text-blue-400 text-3xl font-mono mb-2">{playerScore}</span>
          {/* Found words list only */}
          <div className="flex flex-col gap-1 w-full mb-2">
            {playerWords.map((w) => (
              <div key={w} className="bg-blue-600 text-white border border-blue-800 rounded px-2 py-1 text-center text-xs">{w}</div>
            ))}
          </div>
        </div>
        {/* Grid with select letters */}
        <div className="flex flex-col items-center w-full max-w-xl">
          <div className="bg-[#232a32] rounded-2xl p-6 flex flex-col items-center shadow-lg w-full">
            <div className="font-bold text-lg text-gray-200">Select letters</div>
            <div className="flex flex-col gap-1 mb-2 select-none">
              {grid.map((row, i) => (
                <div key={i} className="grid grid-cols-12 gap-1">
                  {row.map((cell, j) => {
                    const isSelected = selectedCells.some(([si, sj]) => si === i && sj === j);
                    const isFound = Object.values(foundPaths).some((path) => path.some(([fi, fj]) => fi === i && fj === j));
                    return (
                      <div
                        key={i + '-' + j}
                        className={`w-8 h-8 flex items-center justify-center rounded text-lg font-mono border border-[#2d3640] cursor-pointer
                          ${isSelected ? 'bg-blue-700 text-white' : isFound ? 'bg-green-600 text-white' : 'bg-[#181e24] text-white'}`}
                        onMouseDown={() => handleCellMouseDown(i, j)}
                        onMouseEnter={() => handleCellMouseEnter(i, j)}
                        style={{ userSelect: 'none' }}
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
        </div>
        {/* CPU Panel */}
        <div className="bg-[#232a32] rounded-2xl p-6 w-full md:w-64 flex flex-col items-center shadow-lg">
          <span className="text-3xl mb-2">🤖</span>
          <span className="font-bold text-lg mb-2">CPU</span>
          <span className="text-pink-400 text-3xl font-mono mb-2">{cpuScore}</span>
          {/* Found words list only */}
          <div className="flex flex-col gap-1 w-full mb-2">
            {cpuWordsToFind.filter((w) => cpuWords.includes(w)).map((w) => (
              <div key={w} className="bg-red-600 text-white border border-red-800 rounded px-2 py-1 text-center text-xs">{w}</div>
            ))}
          </div>
        </div>
      </div>
      {/* Post-Match Summary Modal */}
      {showSummary && xpResult && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-[#232a32] rounded-2xl shadow-2xl p-8 w-full max-w-lg flex flex-col items-center gap-6 border border-blue-900">
            <h2 className="text-3xl font-bold text-blue-300 mb-2">Match Summary</h2>
            <div className="text-lg font-semibold mb-2">
              {playerScore > cpuScore ? (
                <span className="text-green-400">Victory!</span>
              ) : playerScore < cpuScore ? (
                <span className="text-red-400">Defeat</span>
              ) : (
                <span className="text-yellow-300">Draw</span>
              )}
            </div>
            <div className="flex flex-col items-center gap-1 mb-2">
              <span className="text-base text-white font-bold">You {playerScore} – {cpuScore} CPU</span>
              <span className="text-xs text-blue-200 font-semibold uppercase tracking-wide">{difficulty} Difficulty</span>
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
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-2 rounded-xl" onClick={() => window.location.reload()}>Play Again</button>
              <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold px-6 py-2 rounded-xl" onClick={() => window.location.href = '/'}>Back to Menu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlayCpuPage() {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  useEffect(() => {
    if (router.query.difficulty === 'easy' || router.query.difficulty === 'medium' || router.query.difficulty === 'hard') {
      setDifficulty(router.query.difficulty as 'easy' | 'medium' | 'hard');
    }
  }, [router.query.difficulty]);

  return <GameBoard difficulty={difficulty} />;
} 