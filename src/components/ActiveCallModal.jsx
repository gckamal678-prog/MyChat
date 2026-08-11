import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Volume2 } from 'lucide-react';

export default function ActiveCallModal({ mode = 'video', onClose }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-between p-6 z-50">
      <div className="text-center space-y-1">
        <h3 className="text-lg font-bold">Kamal GC</h3>
        <p className="text-xs text-emerald-400 font-mono">{formatTime(timer)}</p>
      </div>

      <div className="w-full max-w-sm h-96 bg-slate-900 border border-slate-800 rounded-3xl relative overflow-hidden flex items-center justify-center shadow-2xl">
        {mode === 'video' && !isVideoOff ? (
          <div className="absolute inset-0 bg-slate-800 flex items-center justify-center text-slate-500 text-sm">
            Remote Video Stream
          </div>
        ) : (
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300" alt="" className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500/50" />
        )}
      </div>

      <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-800 px-6 py-4 rounded-full shadow-xl">
        <button onClick={() => setIsMuted(!isMuted)} className={`p-3 rounded-full ${isMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        {mode === 'video' && (
          <button onClick={() => setIsVideoOff(!isVideoOff)} className={`p-3 rounded-full ${isVideoOff ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
            {isVideoOff ? <VideoOff size={20} /> : <VideoIcon size={20} />}
          </button>
        )}
        <button className="p-3 bg-slate-800 text-slate-300 rounded-full"><Volume2 size={20} /></button>
        <button onClick={onClose} className="p-4 bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow-lg">
          <PhoneOff size={22} />
        </button>
      </div>
    </div>
  );
}
