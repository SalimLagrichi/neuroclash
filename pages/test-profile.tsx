import { useState } from 'react';

export default function TestProfile() {
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [response, setResponse] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  const handleGet = async () => {
    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch(`/api/profile?userId=${userId}`);
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setResponse({ error: err?.toString() });
    }
    setLoading(false);
  };

  const handlePost = async () => {
    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, username, xp, level }),
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setResponse({ error: err?.toString() });
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: 24, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Test /api/profile</h2>
      <div style={{ marginBottom: 12 }}>
        <label>User ID: <input value={userId} onChange={e => setUserId(e.target.value)} style={{ width: '100%' }} /></label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Username: <input value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%' }} /></label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>XP: <input type="number" value={xp} onChange={e => setXp(Number(e.target.value))} style={{ width: '100%' }} /></label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Level: <input type="number" value={level} onChange={e => setLevel(Number(e.target.value))} style={{ width: '100%' }} /></label>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={handleGet} disabled={loading || !userId}>GET Profile</button>
        <button onClick={handlePost} disabled={loading || !userId || !username}>POST Profile</button>
      </div>
      <div>
        <strong>Response:</strong>
        <pre style={{ background: '#f6f6f6', padding: 12, borderRadius: 4, minHeight: 60 }}>
          {loading ? 'Loading...' : JSON.stringify(response, null, 2)}
        </pre>
      </div>
    </div>
  );
} 