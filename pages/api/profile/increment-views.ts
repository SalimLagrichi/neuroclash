import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../../lib/supabaseClients';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');
  const { userId } = req.body;
  console.log('Incrementing profile views for:', userId);
  if (!userId) {
    console.log('Missing userId');
    return res.status(400).json({ error: 'Missing userId' });
  }

  const { error } = await supabase.rpc('increment_profile_views', { profile_user_id: userId });
  if (error) {
    console.log('Supabase error:', error);
    return res.status(400).json({ error: error.message });
  }
  return res.status(200).json({ success: true });
} 