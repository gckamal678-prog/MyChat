import React from 'react';
import { Lock, X } from 'lucide-react';

export default function SecurityKeysModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={18} /></button>
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2">
            <Lock size={24} />
          </div>
          <h3 className="font-bold text-lg">End-to-End Encryption</h3>
          <p className="text-xs text-slate-400">Verify security key fingerprint</p>
        </div>
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-indigo-300 break-all text-center mb-4">
          48921 73820 19283 55647 89201 34827 91029
        </div>
        <button onClick={onClose} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-sm font-semibold">
          Done
        </button>
      </div>
    </div>
  );
}
