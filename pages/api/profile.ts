import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../lib/supabaseClients';

// GET: /api/profile?userId=...
// POST: /api/profile { userId, username, xp, level }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userId } = req.query;
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid userId' });
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('userId', userId)
      .single();
    if (error) return res.status(404).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { userId, username, xp, level } = req.body;
    if (!userId || !username) {
      return res.status(400).json({ error: 'Missing userId or username' });
    }
    // Upsert profile (insert or update)
    const { data, error } = await supabase
      .from('profiles')
      .upsert([{ userId, username, xp, level }], { onConflict: 'userId' })
      .select()
      .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 