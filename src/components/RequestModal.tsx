import { useState } from 'react';
import { Send, X } from 'lucide-react';
import { submitAppRequest } from '../services/firebase';
import { CATEGORIES } from './CategoryPills';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function RequestModal({ open, onClose }: Props) {
  const [appName, setAppName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [note, setNote] = useState('');
  const [name, setName] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const ok = await submitAppRequest({
      appName,
      category,
      note: note || undefined,
      requesterName: name || undefined,
    });
    if (ok) {
      setSent(true);
      setAppName('');
      setNote('');
    } else {
      setError('Request save nahi hui — app ka naam bhar kar dobara try karo.');
    }
  };

  const close = () => {
    setSent(false);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Request an app">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-white/10 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold">Request an App</h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {sent ? (
          <div className="py-6 text-center">
            <p className="font-bold text-emerald-400">Request bhej di!</p>
            <p className="text-sm text-slate-400 mt-1">App jald add karne ki koshish karenge.</p>
            <button
              type="button"
              onClick={close}
              className="mt-4 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold hover:bg-violet-500"
            >
              Theek hai
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3 mt-4">
            <input
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              required
              maxLength={80}
              placeholder="App ka naam *"
              className="w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2.5 text-sm placeholder:text-slate-500 focus:outline-none focus:border-violet-400"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Category"
              className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              placeholder="Aapka naam (optional)"
              className="w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2.5 text-sm placeholder:text-slate-500 focus:outline-none focus:border-violet-400"
            />
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={300}
              rows={3}
              placeholder="Kuch khaas chahiye? Jaise version, mod features… (optional)"
              className="w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2.5 text-sm placeholder:text-slate-500 focus:outline-none focus:border-violet-400"
            />
            {error ? <p className="text-sm font-bold text-red-400">{error}</p> : null}
            <button
              type="submit"
              className="inline-flex items-center gap-2 w-full justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-sm font-extrabold hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            >
              <Send className="w-4 h-4" /> Request bhejo
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
