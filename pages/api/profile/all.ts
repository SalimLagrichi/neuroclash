import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../../lib/supabaseClients';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed');
  const { data, error } = await supabase
    .from('profiles')
    .select('userId, username, xp, level, elo')
    .order('xp', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ profiles: data });
} 