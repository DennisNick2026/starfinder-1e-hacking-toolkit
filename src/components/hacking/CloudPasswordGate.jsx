import React, { useState } from 'react';
import { Lock } from 'lucide-react';

// SHA-256 hash of the group password (not the plaintext).
const PASSWORD_HASH = '8bd7e25f066eb092a2affb2552e419227ecec14260c165f5534ecf35383a50e5';

async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export default function CloudPasswordGate({ isOpen, onSuccess, onClose }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setChecking(true);
    const hashed = await sha256(value);
    if (hashed === PASSWORD_HASH) {
      setValue('');
      setError(false);
      setChecking(false);
      onSuccess();
    } else {
      setError(true);
      setChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-card border border-primary/30 rounded-xl p-6 w-80 space-y-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 text-primary">
          <Lock className="w-4 h-4" />
          <h2 className="font-mono text-xs tracking-widest uppercase">Cloud Access</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            autoFocus
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(false); }}
            placeholder="Enter group password"
            className="w-full bg-input border border-border rounded px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
          />
          {error && <p className="font-mono text-xs text-destructive">Incorrect password.</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={checking || !value}
              className="flex-1 py-2 rounded font-mono text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {checking ? 'Checking...' : 'Unlock'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded font-mono text-xs border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}