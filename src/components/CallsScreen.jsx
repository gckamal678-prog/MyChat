import React, { useState } from 'react';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, Mic, MicOff, Camera, VideoOff, PhoneOff, Volume2 } from 'lucide-react';

export default function CallsScreen() {
  const [activeCall, setActiveCall] = useState(null); // 'audio' or 'video'
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const callLogs = [
    { id: 1, name: 'Kamal GC', type: 'incoming', mode: 'video', time: 'Today, 09:15 AM', duration: '4 min 12 sec' },
    { id: 2, name: 'PWA Support Team', type: 'missed', mode: 'audio', time: 'Yesterday, 04:30 PM', duration: '' },
    { id: 3, name: 'Dipendra', type: 'outgoing', mode: 'audio', time: 'May 10, 11:00 AM', duration: '12 min 45 sec' },
  ];

  return (
    <div className="p-4 max-w-2xl mx-auto text-white space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Calls</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => setActiveCall('audio')}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-lg shadow-indigo-600/30"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setActiveCall('video')}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-lg shadow-indigo-600/30"
          >
            <Video className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Call Logs List */}
      <div className="space-y-2">
        {callLogs.map((log) => (
          <div key={log.id} className="flex items-center justify-between p-3.5 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-slate-800 rounded-xl text-indigo-400">
                {log.mode === 'video' ? <Video className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="font-semibold text-sm">{log.name}</h4>
                <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-0.5">
                  {log.type === 'incoming' && <PhoneIncoming className="w-3.5 h-3.5 text-emerald-400" />}
                  {log.type === 'outgoing' && <PhoneOutgoing className="w-3.5 h-3.5 text-indigo-400" />}
                  {log.type === 'missed' && <PhoneMissed className="w-3.5 h-3.5 text-red-400" />}
                  <span>{log.time} {log.duration && `• ${log.duration}`}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setActiveCall(log.mode)}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition text-indigo-400"
            >
              {log.mode === 'video' ? <Video className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
            </button>
          </div>
        ))}
      </div>

      {/* Active Call Modal / Overlay */}
      {activeCall && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col items-center justify-between p-8 text-white">
          <div className="text-center space-y-2 mt-4">
            <h3 className="text-xl font-bold">Kamal GC</h3>
            <p className="text-xs text-emerald-400 animate-pulse">Connected • 02:45</p>
          </div>

          {/* Video Preview or Avatar */}
          <div className="relative w-full max-w-md h-96 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex items-center justify-center shadow-2xl">
            {activeCall === 'video' && !isVideoOff ? (
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 to-indigo-950 flex items-center justify-center">
                <p className="text-xs text-slate-400">Remote Video Feed (Simulated)</p>
                {/* Local PiP Video */}
                <div className="absolute bottom-4 right-4 w-28 h-36 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center text-[10px] text-slate-400">
                  Your Camera
                </div>
              </div>
            ) : (
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces" 
                alt="Caller" 
                className="w-28 h-28 rounded-full object-cover border-4 border-indigo-500 shadow-xl" 
              />
            )}
          </div>

          {/* Call Control Buttons */}
          <div className="flex items-center space-x-4 mb-4">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-2xl transition ${isMuted ? 'bg-red-600 text-white' : 'bg-slate-900 border border-slate-800 text-white'}`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {activeCall === 'video' && (
              <button 
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-4 rounded-2xl transition ${isVideoOff ? 'bg-red-600 text-white' : 'bg-slate-900 border border-slate-800 text-white'}`}
              >
                {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Camera className="w-6 h-6" />}
              </button>
            )}

            <button className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-white transition">
              <Volume2 className="w-6 h-6" />
            </button>

            <button 
              onClick={() => setActiveCall(null)}
              className="p-4 bg-red-600 hover:bg-red-500 rounded-2xl text-white transition shadow-lg shadow-red-600/30"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
