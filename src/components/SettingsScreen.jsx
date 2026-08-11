import React, { useState } from 'react';
import { User, Shield, Key, Smartphone, ToggleLeft, ToggleRight, HardDrive } from 'lucide-react';

export default function SettingsScreen({ onOpenStorage }) {
  const [biometric, setBiometric] = useState(true);

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <h2 className="text-xl font-bold text-indigo-400">Settings</h2>
      
      <div className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-xl">
        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="" className="w-14 h-14 rounded-full object-cover" />
        <div>
          <h4 className="font-bold">Kamal GC</h4>
          <p className="text-xs text-slate-400">mychat.kamalgc.com.np ✨</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Security & Privacy</h3>
        
        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
          <div className="flex items-center gap-3">
            <Shield size={18} className="text-indigo-400" />
            <span className="text-sm">Biometric Lock</span>
          </div>
          <button onClick={() => setBiometric(!biometric)} className="text-indigo-400">
            {biometric ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-slate-500" />}
          </button>
        </div>

        <div onClick={onOpenStorage} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-800">
          <div className="flex items-center gap-3">
            <HardDrive size={18} className="text-indigo-400" />
            <span className="text-sm">Storage and Data</span>
          </div>
          <span className="text-xs text-slate-400">→</span>
        </div>
      </div>
    </div>
  );
}
