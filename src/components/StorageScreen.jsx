import React from 'react';
import { HardDrive, Trash2 } from 'lucide-react';

export default function StorageScreen() {
  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <h2 className="text-xl font-bold text-indigo-400">Storage and Data</h2>
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Used: 1.2 GB</span>
          <span>Total: 5.0 GB</span>
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
          <div className="bg-indigo-500 h-full w-[40%]" />
          <div className="bg-emerald-500 h-full w-[30%]" />
          <div className="bg-amber-500 h-full w-[15%]" />
        </div>
      </div>
      <div className="border-t border-slate-800 pt-4">
        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
          <div className="flex items-center gap-3">
            <HardDrive size={18} className="text-indigo-400" />
            <div>
              <h4 className="text-sm font-semibold">Local Chat Cache</h4>
              <p className="text-xs text-slate-400">Free up space</p>
            </div>
          </div>
          <button className="bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1">
            <Trash2 size={14} /> Clear
          </button>
        </div>
      </div>
    </div>
  );
}
