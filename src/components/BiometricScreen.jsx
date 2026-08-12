import React, { useState } from 'react';
import { Fingerprint } from 'lucide-react';

export default function BiometricScreen({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBiometricAuth = async () => {
    setLoading(true);
    setError('');
    try {
      if (window.PublicKeyCredential) {
        // WebAuthn Simulation Check
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        if (available) {
          // Simulated successful biometric trigger
          setTimeout(() => {
            setLoading(false);
            onSuccess();
          }, 1500);
          return;
        }
      }
      // Fallback simulation if hardware not present
      setTimeout(() => {
        setLoading(false);
        onSuccess();
      }, 1500);
    } catch (err) {
      setLoading(false);
      setError('Biometric authentication failed. Try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl">
        <div 
          onClick={handleBiometricAuth}
          className={`mx-auto w-24 h-24 bg-indigo-600/20 border-2 border-indigo-500 rounded-full flex items-center justify-center cursor-pointer mb-6 transition-transform ${loading ? 'animate-pulse scale-105' : 'hover:scale-105'}`}
        >
          <Fingerprint className="w-12 h-12 text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold mb-2">Biometric Unlock</h2>
        <p className="text-xs text-slate-400 mb-6">Touch the fingerprint sensor or use Face ID to unlock MyChat</p>
        
        {error && <p className="text-xs text-red-400 mb-4">{error}</p>}

        <button
          onClick={handleBiometricAuth}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition text-sm"
        >
          {loading ? 'Authenticating...' : 'Verify Identity'}
        </button>
      </div>
    </div>
  );
}
