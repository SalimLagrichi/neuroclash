import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../../lib/supabaseClients';

// XP table for levels 1–50
const xpTable = [
  300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200,
  1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200,
  2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000, 3100, 3200,
  3300, 3400, 3500, 3600, 3700, 3800, 3900, 4000, 4100, 4200,
  4300, 4400, 4500, 4600, 4700, 4800, 4900, 5000, 5100
];

function getLevel(totalXp: number) {
  let level = 1;
  let xpSum = 0;
  for (let i = 0; i < xpTable.length; i++) {
    if (totalXp < xpSum + xpTable[i]) {
      break;
    }
    xpSum += xpTable[i];
    level = i + 2;
  }
  return level;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');
  const { userId, xpToAdd } = req.body;
  if (!userId || typeof xpToAdd !== 'number') {
    return res.status(400).json({ error: 'Missing userId or xpToAdd' });
  }

  // Fetch current XP
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('xp')
    .eq('userId', userId)
    .single();
  if (fetchError || !profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  const newXp = (profile.xp || 0) + xpToAdd;
  const newLevel = getLevel(newXp);

  // Update XP and level
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ xp: newXp, level: newLevel })
    .eq('userId', userId);
  if (updateError) {
    return res.status(500).json({ error: updateError.message });
  }

  return res.status(200).json({ xp: newXp, level: newLevel });
} 