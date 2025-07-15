import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Swords, Clock, UserRound, Trophy as TrophyIcon, ArrowLeft, Bot } from "lucide-react";
import '../app/globals.css';
import React, { useRef } from 'react';
import { wordBank } from '../data/wordbank';
import Image from 'next/image';

const cpuProfiles = {
  easy: {
    name: 'WordBot',
    avatar: <Bot className="w-16 h-16 text-green-400 mx-auto" />,
    difficulty: 'Easy',
    skill: 'Beginner',
    wordSpeed: '36s/word',
    flavor: 'Just learning!',
    color: 'bg-green-100 text-green-700',
  },
  medium: {
    name: 'Lexi',
    avatar: <Bot className="w-16 h-16 text-yellow-400 mx-auto" />,
    difficulty: 'Medium',
    skill: 'Intermediate',
    wordSpeed: '22s/word',
    flavor: 'A worthy challenger.',
    color: 'bg-yellow-100 text-yellow-700',
  },
  hard: {
    name: 'AlphaCPU',
    avatar: <Bot className="w-16 h-16 text-pink-400 mx-auto" />,
    difficulty: 'Hard',
    skill: 'Expert',
    wordSpeed: '16s/word',
    flavor: 'Blitzes through words!',
    color: 'bg-pink-100 text-pink-700',
  },
};

function CpuPreMatch({ difficulty, onCountdownEnd }: { difficulty: 'easy' | 'medium' | 'hard'; onCountdownEnd: () => void }) {
  const [countdown, setCountdown] = useState(5);
  const cpu = cpuProfiles[difficulty];

  useEffect(() => {
    if (countdown === 0) {
      onCountdownEnd();
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, onCountdownEnd]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#181e24] text-white">
      <Swords className="w-16 h-16 mb-4 text-white drop-shadow-lg" />
      <h1 className="text-4xl font-extrabold mb-2">Match Found!</h1>
      <p className="text-lg mb-8 text-gray-300">Prepare for battle</p>
      <div className="bg-[#232a32] rounded-2xl shadow-xl px-10 py-8 flex flex-col items-center w-full max-w-sm">
        {cpu.avatar}
        <div className="text-2xl font-bold text-white mt-2 mb-1">{cpu.name}</div>
        <span className={`text-sm font-semibold px-3 py-1 rounded-full mb-4 ${cpu.color}`}>{cpu.difficulty} • {cpu.skill}</span>
        <div className="flex justify-center gap-8 mb-4 w-full">
          <div className="flex flex-col items-center">
            <Clock className="w-5 h-5 text-blue-400 mb-1" />
            <span className="text-sm text-white font-semibold">{cpu.wordSpeed}</span>
            <span className="text-xs text-gray-400">Word Speed</span>
          </div>
        </div>
        <div className="text-center text-gray-400 italic mb-4">{cpu.flavor}</div>
        <div className="text-5xl font-extrabold text-purple-400 mb-2">{countdown}</div>
        <div className="text-gray-400 text-sm mb-2">Starting in...</div>
      </div>
      <div className="mt-8 text-gray-300 text-center">Get ready to find words faster than your opponent!</div>
    </div>
  );
}

function getRandomWordSet(category: string = 'mixed') {
  const sets = wordBank[category] || wordBank['mixed'];
  const idx = Math.floor(Math.random() * sets.length);
  return sets[idx];
}

const GRID_SIZE = 12;

function generateGrid(words: string[], size: number): string[][] {
  // For MVP: fill grid with random letters (no real word placement)
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => letters[Math.floor(Math.random() * letters.length)])
  );
}

function GameBoard({ difficulty, words }: { difficulty: 'easy' | 'medium' | 'hard', words: string[] }) {
  const [timeLeft, setTimeLeft] = useState(180);
  const [playerWords, setPlayerWords] = useState<string[]>([]);
  const [cpuWords, setCpuWords] = useState<string[]>([]);
  const [grid] = useState(() => generateGrid(words, GRID_SIZE));
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // CPU logic: schedule word finds based on difficulty
  useEffect(() => {
    let cpuSchedule: number[] = [];
    let cpuWordCount = 5;
    if (difficulty === 'medium') cpuWordCount = 8;
    if (difficulty === 'hard') cpuWordCount = 11;
    const availableWords = [...words];
    const cpuWordsToFind: string[] = [];
    for (let i = 0; i < cpuWordCount; i++) {
      const idx = Math.floor(Math.random() * availableWords.length);
      cpuWordsToFind.push(availableWords.splice(idx, 1)[0]);
    }
    // Spread CPU finds over 3 minutes
    cpuSchedule = cpuWordsToFind.map((_, i) => Math.floor((180 / cpuWordCount) * (i + 1)));
    let cpuIdx = 0;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1 && intervalRef.current) clearInterval(intervalRef.current);
        return t - 1;
      });
      if (cpuIdx < cpuSchedule.length && 180 - timeLeft >= cpuSchedule[cpuIdx]) {
        setCpuWords((prev) => [...prev, cpuWordsToFind[cpuIdx]]);
        cpuIdx++;
      }
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [difficulty, words, timeLeft]);

  // Player click-to-select (MVP: just click a word in the list)
  function handleWordClick(word: string) {
    if (!playerWords.includes(word) && !cpuWords.includes(word)) {
      setPlayerWords((prev) => [...prev, word]);
    }
  }

  // End of game
  const gameOver = timeLeft <= 0 || playerWords.length + cpuWords.length >= words.length;

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#181e24] text-white">
      {/* Clock above grid */}
      <div className="flex justify-center py-4">
        <div className="flex items-center gap-4">
          <Clock className="w-8 h-8 text-green-400" />
          <span className="text-3xl font-mono text-green-400">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
        </div>
      </div>
      {/* Main Game Area */}
      <div className="flex-1 flex flex-col md:flex-row justify-center items-center gap-8 px-2 py-8 max-w-6xl w-full mx-auto">
        {/* Player Panel */}
        <div className="bg-[#232a32] rounded-2xl p-6 w-full md:w-64 flex flex-col items-center shadow-lg mb-6 md:mb-0">
          <span className="text-3xl mb-2">🎮</span>
          <span className="font-bold text-lg mb-2">You</span>
          <span className="text-blue-400 text-3xl font-mono mb-4">{playerWords.length}</span>
          <div className="flex flex-col gap-1 w-full">
            {playerWords.map((w) => (
              <div key={w} className="bg-blue-900/60 text-blue-200 rounded px-2 py-1 text-center text-sm">{w}</div>
            ))}
          </div>
        </div>
        {/* Grid */}
        <div className="bg-[#232a32] rounded-2xl p-6 flex flex-col items-center shadow-lg w-full max-w-xl mb-6 md:mb-0">
          <div className="font-bold text-lg mb-2 text-gray-200">Select letters</div>
          <div className="flex flex-col gap-1 mb-2">
            {grid.map((row, i) => (
              <div key={i} className="grid grid-cols-12 gap-1">
                {row.map((cell, j) => (
                  <div key={i + '-' + j} className="w-8 h-8 flex items-center justify-center bg-[#181e24] rounded text-lg font-mono border border-[#2d3640] text-white select-none">
                    {cell}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-400">Drag to select words • Minimum 3 letters</div>
        </div>
        {/* CPU Panel */}
        <div className="bg-[#232a32] rounded-2xl p-6 w-full md:w-64 flex flex-col items-center shadow-lg">
          <span className="text-3xl mb-2">🤖</span>
          <span className="font-bold text-lg mb-2">CPU</span>
          <span className="text-pink-400 text-3xl font-mono mb-4">{cpuWords.length}</span>
          <div className="flex flex-col gap-1 w-full">
            {cpuWords.map((w) => (
              <div key={w} className="bg-pink-900/60 text-pink-200 rounded px-2 py-1 text-center text-sm">{w}</div>
            ))}
          </div>
        </div>
      </div>
      {/* Word List */}
      <div className="bg-[#232a32] rounded-2xl mx-auto mb-8 px-8 py-4 max-w-4xl w-full flex flex-col items-center shadow-lg">
        <div className="font-bold text-lg mb-2">Words to Find ({words.length})</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 w-full">
          {words.map((word) => {
            const foundByPlayer = playerWords.includes(word);
            const foundByCPU = cpuWords.includes(word);
            return (
              <button
                key={word}
                onClick={() => handleWordClick(word)}
                disabled={foundByPlayer || foundByCPU || gameOver}
                className={`px-3 py-2 rounded text-base font-mono transition border border-[#232a32] shadow-sm
                  ${foundByPlayer ? 'bg-blue-500/80 text-white line-through' : foundByCPU ? 'bg-pink-500/80 text-white line-through' : 'bg-[#181e24] text-gray-200 hover:bg-blue-900/40'}
                  ${gameOver ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {word}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function GameSetupCpuPage() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [showPreMatch, setShowPreMatch] = useState(false);
  const [words, setWords] = useState<string[]>([]);

  useEffect(() => {
    // Pick a new word set on mount
    setWords(getRandomWordSet('mixed'));
  }, []);

  useEffect(() => {
    if (!isSignedIn) {
      router.replace('/sign-in');
    }
  }, [isSignedIn, router]);

  if (!isSignedIn) return null;

  if (showPreMatch) {
    return <CpuPreMatch difficulty={difficulty} onCountdownEnd={() => router.push(`/play/cpu?difficulty=${difficulty}`)} />;
  }

  return (
    <div className="min-h-screen bg-[#181e24] text-white flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <button
          onClick={() => router.push('/gamesetupcpumode')}
          className="flex items-center gap-2 text-gray-300 hover:text-white bg-[#232a32] rounded-full px-4 py-2 shadow border border-gray-600 transition mb-6 cursor-pointer"
          aria-label="Back to CPU Mode Choose"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        {/* Difficulty Selection */}
        {!showPreMatch && (
          <div className="flex flex-col items-center justify-center min-h-[500px]">
            <div className="bg-[#232a32] rounded-3xl shadow-2xl border border-gray-600/40 px-8 py-10 max-w-md w-full flex flex-col items-center">
              {/* Personalization */}
              <div className="flex flex-col items-center mb-4">
                {user?.imageUrl && (
                  <Image
                    src={user.imageUrl}
                    alt="avatar"
                    width={56}
                    height={56}
                    className="w-14 h-14 rounded-full mb-2 border-2 border-blue-400 shadow"
                  />
                )}
                <span className="text-lg font-semibold text-white">Welcome{user?.firstName ? `, ${user.firstName}` : ''}!</span>
              </div>
              <Swords className="w-12 h-12 text-blue-400 mb-2 mx-auto" />
              <h2 className="text-2xl font-bold text-white mb-4 text-center">Neuro Clash</h2>
              <div className="flex justify-between w-full mb-8 mt-2">
                <div className="flex flex-col items-center flex-1">
                  <Clock className="w-6 h-6 text-blue-300 mb-1" />
                  <span className="text-xs text-gray-200">3 Minutes</span>
                </div>
                <div className="flex flex-col items-center flex-1">
                  <UserRound className="w-6 h-6 text-green-300 mb-1" />
                  <span className="text-xs text-gray-200">VS CPU</span>
                </div>
                <div className="flex flex-col items-center flex-1">
                  <TrophyIcon className="w-6 h-6 text-yellow-300 mb-1" />
                  <span className="text-xs text-gray-200">Best Score</span>
                </div>
              </div>
              <div className="w-full flex flex-col gap-4 mt-2 mb-8">
                {['easy', 'medium', 'hard'].map((d) => {
                  const selected = difficulty === d;
                  const profile = cpuProfiles[d as 'easy' | 'medium' | 'hard'];
                  const borderColor = d === 'easy' ? 'border-green-400' : d === 'medium' ? 'border-yellow-300' : 'border-pink-400';
                  const iconColor = d === 'easy' ? 'text-green-400' : d === 'medium' ? 'text-yellow-300' : 'text-pink-400';
                  return (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d as 'easy' | 'medium' | 'hard')}
                      className={`flex items-center w-full px-6 py-5 rounded-2xl transition font-semibold text-left gap-4 shadow-md border bg-[#181e24] ${borderColor} ${selected ? 'ring-2 ring-yellow-200/60 scale-[1.03]' : 'hover:ring-2 hover:ring-white/20'} focus:outline-none cursor-pointer`}
                      style={{ minHeight: 64 }}
                    >
                      <Bot className={`w-8 h-8 ${iconColor}`} />
                      <span className="flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className={`text-lg font-bold ${selected ? 'text-white' : 'text-gray-100'}`}>{profile.difficulty}</span>
                        <span className={`text-sm ${selected ? 'text-white/80' : 'text-gray-400'}`}>{profile.flavor}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <button
                className="w-full bg-gradient-to-r from-purple-500 to-blue-400 hover:from-purple-400 hover:to-blue-300 text-white font-bold py-3 rounded-2xl text-lg shadow-lg transition cursor-pointer tracking-wide"
                onClick={() => {
                  setWords(getRandomWordSet('mixed'));
                  setShowPreMatch(true);
                }}
              >
                Play
              </button>
            </div>
          </div>
        )}
        {/* Pass words to GameBoard when game starts */}
        {showPreMatch && <GameBoard difficulty={difficulty} words={words} />}
      </div>
    </div>
  );
} 