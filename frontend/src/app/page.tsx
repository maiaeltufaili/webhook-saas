'use client';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [endpoints, setEndpoints] = useState<any[]>([]);
  const [url, setUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [event, setEvent] = useState('user.signup');
  const [testPayload, setTestPayload] = useState('{"userId": "123", "email": "test@example.com"}');

  const fetchEndpoints = async () => {
    const res = await fetch('http://localhost:3000/api/endpoints');
    const data = await res.json();
    setEndpoints(data);
  };

  useEffect(() => {
    fetchEndpoints();
    const interval = setInterval(fetchEndpoints, 3000); // Poll for live logs
    return () => clearInterval(interval);
  }, []);

  const createEndpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('http://localhost:3000/api/endpoints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, secret, events: ['user.signup', 'payment.success'] }),
    });
    setUrl('');
    setSecret('');
    fetchEndpoints();
  };

  const triggerEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('http://localhost:3000/api/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, payload: JSON.parse(testPayload) }),
    });
    alert('Event triggered and queued!');
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="border-b border-slate-800 pb-4">
          <h1 className="text-3xl font-bold tracking-tight">⚡ Webhook Hookdeck Engine</h1>
          <p className="text-slate-400 text-sm mt-1">High-throughput event delivery system with retry queues & HMAC signatures.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Register Endpoint Form */}
          <section className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
            <h2 className="text-xl font-semibold">Register Endpoint</h2>
            <form onSubmit={createEndpoint} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Target URL</label>
                <input className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://my-receiver.com/webhook" required />
              </div>
              <div>
                <label className="text-xs text-slate-400">HMAC Secret</label>
                <input className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm" value={secret} onChange={e => setSecret(e.target.value)} placeholder="whsec_..." required />
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 font-medium py-2 rounded text-sm transition">Add Endpoint</button>
            </form>
          </section>

          {/* Trigger Event Form */}
          <section className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
            <h2 className="text-xl font-semibold">Trigger Event</h2>
            <form onSubmit={triggerEvent} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Event Name</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm" value={event} onChange={e => setEvent(e.target.value)}>
                  <option value="user.signup">user.signup</option>
                  <option value="payment.success">payment.success</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400">Payload (JSON)</label>
                <textarea className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm font-mono h-20" value={testPayload} onChange={e => setTestPayload(e.target.value)} />
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 font-medium py-2 rounded text-sm transition">Dispatch Event</button>
            </form>
          </section>
        </div>

        {/* Live Logs & Endpoints Table */}
        <section className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
          <h2 className="text-xl font-semibold">Subscribed Endpoints & Delivery Audit Logs</h2>
          <div className="space-y-4">
            {endpoints.map(ep => (
              <div key={ep.id} className="border border-slate-800 rounded-lg p-4 bg-slate-950/50 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-mono text-indigo-400">{ep.url}</span>
                  <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">Events: {ep.events.join(', ')}</span>
                </div>
                <div className="text-xs text-slate-400 font-mono">Recent Deliveries:</div>
                <div className="space-y-1">
                  {ep.logs.map((log: any) => (
                    <div key={log.id} className="flex justify-between text-xs font-mono bg-slate-900 p-2 rounded">
                      <span>Event: {log.event}</span>
                      <span className={log.status === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'}>
                        {log.status} (HTTP {log.statusCode || 'ERR'}) — Attempt #{log.attempt}
                      </span>
                    </div>
                  ))}
                  {ep.logs.length === 0 && <div className="text-xs text-slate-600 italic">No delivery attempts yet.</div>}
                </div>
              </div>
            ))}
            {endpoints.length === 0 && <p className="text-sm text-slate-500">No endpoints registered yet.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}