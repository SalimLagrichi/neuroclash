import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../../lib/supabaseClients';

const eloRanks = [
  { tier: 'Iron', sub: 'III', min: 0 },
  { tier: 'Iron', sub: 'II', min: 80 },
  { tier: 'Iron', sub: 'I', min: 160 },
  { tier: 'Bronze', sub: 'III', min: 240 },
  { tier: 'Bronze', sub: 'II', min: 320 },
  { tier: 'Bronze', sub: 'I', min: 400 },
  { tier: 'Silver', sub: 'III', min: 480 },
  { tier: 'Silver', sub: 'II', min: 560 },
  { tier: 'Silver', sub: 'I', min: 640 },
  { tier: 'Gold', sub: 'III', min: 720 },
  { tier: 'Gold', sub: 'II', min: 800 },
  { tier: 'Gold', sub: 'I', min: 880 },
  { tier: 'Platinum', sub: 'III', min: 960 },
  { tier: 'Platinum', sub: 'II', min: 1040 },
  { tier: 'Platinum', sub: 'I', min: 1120 },
  { tier: 'Sapphire', sub: 'III', min: 1200 },
  { tier: 'Sapphire', sub: 'II', min: 1280 },
  { tier: 'Sapphire', sub: 'I', min: 1360 },
  { tier: 'Emerald', sub: 'III', min: 1440 },
  { tier: 'Emerald', sub: 'II', min: 1520 },
  { tier: 'Emerald', sub: 'I', min: 1600 },
  { tier: 'Ruby', sub: 'III', min: 1680 },
  { tier: 'Ruby', sub: 'II', min: 1760 },
  { tier: 'Ruby', sub: 'I', min: 1840 },
  { tier: 'Onyx', sub: 'III', min: 1920 },
  { tier: 'Onyx', sub: 'II', min: 2000 },
  { tier: 'Onyx', sub: 'I', min: 2080 },
  { tier: 'Diamond', sub: 'III', min: 2160 },
  { tier: 'Diamond', sub: 'II', min: 2240 },
  { tier: 'Diamond', sub: 'I', min: 2320 },
];
function eloToRank(elo: number) {
  for (let i = eloRanks.length - 1; i >= 0; i--) {
    if (elo >= eloRanks[i].min) {
      return `${eloRanks[i].tier} ${eloRanks[i].sub}`;
    }
  }
  return 'Iron III';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');
  const { userId, newElo } = req.body;
  if (!userId || typeof newElo !== 'number') {
    return res.status(400).json({ error: 'Missing userId or newElo' });
  }
  const { error } = await supabase
    .from('profiles')
    .update({ elo: newElo })
    .eq('userId', userId);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ elo: newElo, rank: eloToRank(newElo) });
} 