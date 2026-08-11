import React from 'react';
import { PhoneIncoming, PhoneOutgoing, PhoneMissed, Video, Phone } from 'lucide-react';

export default function CallsScreen({ onStartCall }) {
  const callLogs = [
    { id: 1, name: 'Kamal GC', type: 'incoming', mode: 'video', time: 'Today, 2:15 PM', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
    { id: 2, name: 'Sushila', type: 'missed', mode: 'audio', time: 'Yesterday, 8:40 PM', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
  ];

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h2 className="text-xl font-bold text-indigo-400">Calls</h2>
        <button onClick={() => onStartCall('video')} className="bg-indigo-600 hover:bg-indigo-500 p-2 rounded-xl text-white">
          <Video size={18} />
        </button>
      </div>

      <div className="space-y-2">
        {callLogs.map((log) => (
          <div key={log.id} className="flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl">
            <div className="flex items-center gap-3">
              <img src={log.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
              <div>
                <h4 className="font-semibold text-sm">{log.name}</h4>
                <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                  {log.type === 'incoming' && <PhoneIncoming size={12} className="text-emerald-400" />}
                  {log.type === 'missed' && <PhoneMissed size={12} className="text-rose-400" />}
                  <span>{log.time}</span>
                </div>
              </div>
            </div>
            <button onClick={() => onStartCall(log.mode)} className="p-2.5 bg-slate-800 hover:bg-indigo-600 rounded-xl text-slate-300 hover:text-white transition-colors">
              {log.mode === 'video' ? <Video size={18} /> : <Phone size={18} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
