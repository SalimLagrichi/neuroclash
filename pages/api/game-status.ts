import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../lib/supabaseClients';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed');
  const { gameId } = req.query;
  if (!gameId || typeof gameId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid gameId' });
  }
  const { data: game, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single();
  if (error || !game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  return res.status(200).json({ game });
} 