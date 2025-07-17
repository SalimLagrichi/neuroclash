import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../lib/supabaseClients';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, username } = req.body;

  if (!userId || !username) {
    return res.status(400).json({ error: 'Missing userId or username' });
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert([{
        userId,
        username,
        xp: 0,
        level: 1,
        profileViews: 0,
        elo: 1000
      }], { onConflict: 'userId' })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, profile: data });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 