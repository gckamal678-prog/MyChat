import React, { useState } from 'react';
import { Database, Trash2, HardDrive } from 'lucide-react';

export default function StorageSettings() {
  const [cleared, setCleared] = useState(false);

  const handleClearCache = () => {
    localStorage.clear();
    setCleared(true);
    setTimeout(() => setCleared(false), 3000);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto text-white space-y-6">
      <h1 className="text-2xl font-bold flex items-center space-x-2">
        <HardDrive className="w-6 h-6 text-indigo-400" />
        <span>Storage and Data</span>
      </h1>

      {/* Storage Breakdown Card */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400">Offline PWA Cache Usage</span>
          <span className="font-bold text-indigo-400">45.2 MB / 500 MB</span>
        </div>

        {/* Visual Storage Breakdown Bar */}
        <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex">
          <div className="bg-indigo-500 w-2/5" title="Photos (18 MB)" />
          <div className="bg-emerald-500 w-1/3" title="Videos (15 MB)" />
          <div className="bg-yellow-500 w-1/6" title="Audio (7.2 MB)" />
          <div className="bg-purple-500 w-1/10" title="Documents (5 MB)" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs text-slate-400">
          <div className="flex items-center space-x-2"><span className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></span><span>Photos (18 MB)</span></div>
          <div className="flex items-center space-x-2"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span><span>Videos (15 MB)</span></div>
          <div className="flex items-center space-x-2"><span className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></span><span>Audio (7.2 MB)</span></div>
          <div className="flex items-center space-x-2"><span className="w-2.5 h-2.5 bg-purple-500 rounded-full"></span><span>Docs (5 MB)</span></div>
        </div>
      </div>

      {/* Clear Cache Action */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-sm">Clear Local Chat Cache</h4>
          <p className="text-xs text-slate-400 mt-0.5">Free up space by removing cached offline media and messages.</p>
        </div>
        <button
          onClick={handleClearCache}
          className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 text-xs font-semibold px-4 py-2.5 rounded-xl transition"
        >
          <Trash2 className="w-4 h-4 inline mr-1.5" />
          Clear Cache
        </button>
      </div>

      {cleared && (
        <div className="bg-emerald-950/40 border border-emerald-900/50 p-3 rounded-xl text-center text-xs text-emerald-300">
          Local cache successfully cleared!
        </div>
      )}
    </div>
  );
}
