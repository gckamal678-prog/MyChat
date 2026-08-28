import React, { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { supabase } from '../services/supabase';

export default function MfaScreen({ factor, onVerified }) {
  const [code, setCode] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.mfa.challenge({ factorId: factor.id }).then(({ data, error: challengeError }) => {
      if (challengeError) setError(challengeError.message);
      else setChallengeId(data.id);
    });
  }, [factor.id]);

  const verify = async (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(code) || !challengeId) return;
    setBusy(true);
    const { error: verifyError } = await supabase.auth.mfa.verify({ factorId: factor.id, challengeId, code });
    setBusy(false);
    if (verifyError) setError(verifyError.message);
    else onVerified();
  };

  return <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white"><form onSubmit={verify} className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl"><ShieldCheck className="mx-auto mb-4 h-12 w-12 text-indigo-400" /><h2 className="text-xl font-bold">Two-factor verification</h2><p className="mt-2 text-sm text-slate-400">Enter the 6-digit code from your authenticator app.</p><input autoFocus inputMode="numeric" maxLength="6" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))} className="mt-6 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-center text-xl tracking-[0.4em]" placeholder="000000" /><button disabled={busy || code.length !== 6} className="mt-4 w-full rounded-xl bg-indigo-600 py-3 font-semibold">{busy ? 'Verifying...' : 'Verify'}</button>{error && <p className="mt-3 text-xs text-red-400">{error}</p>}</form></div>;
}
