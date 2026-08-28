import React, { useEffect, useRef, useState } from 'react';
import { Phone, Video, PhoneOutgoing, Mic, MicOff, Camera, VideoOff, PhoneOff, Volume2, Search, Plus, PhoneCall } from 'lucide-react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { agoraAppId, createAgoraClient, isAgoraConfigured } from '../services/agora';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

export default function CallsScreen() {
  const [activeCall, setActiveCall] = useState(null); // 'audio' or 'video'
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [callLogs, setCallLogs] = useState([]);
  const [search, setSearch] = useState('');
  const clientRef = useRef(null);
  const localTracksRef = useRef([]);
  const localVideoRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    supabase.from('call_logs').select('id, mode, channel, started_at, ended_at').order('started_at', { ascending: false }).then(({ data, error }) => {
      if (error) setCameraError(error.message);
      else setCallLogs(data || []);
    });
  }, []);

  useEffect(() => () => {
    localTracksRef.current.forEach((track) => track.close());
    clientRef.current?.leave();
  }, []);

  const startCall = async (mode) => {
    setCameraError('');
    if (!isAgoraConfigured) {
      setCameraError('Agora is not configured. Add VITE_AGORA_APP_ID in Vercel.');
      return;
    }
    try {
      const client = createAgoraClient();
      clientRef.current = client;
      client.on('user-published', async (remoteUser, mediaType) => {
        await client.subscribe(remoteUser, mediaType);
        setRemoteUsers((current) => current.some((item) => item.uid === remoteUser.uid) ? current : [...current, remoteUser]);
        if (mediaType === 'audio') remoteUser.audioTrack?.play();
      });
      client.on('user-unpublished', (remoteUser) => {
        setRemoteUsers((current) => current.filter((item) => item.uid !== remoteUser.uid));
      });
      await client.join(agoraAppId, 'mychat-general', user.id, null);
      const tracks = mode === 'video'
        ? await AgoraRTC.createMicrophoneAndCameraTracks()
        : [await AgoraRTC.createMicrophoneAudioTrack()];
      localTracksRef.current = tracks;
      await client.publish(tracks);
      await supabase.from('call_logs').insert({ caller_id: user.id, channel: 'mychat-general', mode });
      if (mode === 'video' && localVideoRef.current) tracks[1].play(localVideoRef.current);
      setActiveCall(mode);
    } catch (error) {
      setCameraError(error.message || 'Could not join the Agora call.');
      clientRef.current?.leave();
      localTracksRef.current.forEach((track) => track.close());
      clientRef.current = null;
      localTracksRef.current = [];
    }
  };

  const endCall = async () => {
    localTracksRef.current.forEach((track) => track.close());
    await clientRef.current?.leave();
    const { data } = await supabase.from('call_logs').select('id').eq('caller_id', user.id).is('ended_at', null).order('started_at', { ascending: false }).limit(1);
    if (data?.[0]) await supabase.from('call_logs').update({ ended_at: new Date().toISOString() }).eq('id', data[0].id);
    clientRef.current = null;
    localTracksRef.current = [];
    setRemoteUsers([]);
    setActiveCall(null);
  };

  const filteredLogs = callLogs.filter((log) => log.channel.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 max-w-2xl mx-auto text-white space-y-5 relative min-h-[520px]">
      <header className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Calls</h1><p className="text-xs text-slate-400 mt-1">Your recent voice and video calls</p></div>
      </header>
      {cameraError && <p className="text-xs text-red-400">{cameraError}</p>}

      <div className="relative"><Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search call history" className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500" /></div>

      <section className="space-y-2">
        {filteredLogs.map((log) => <div key={log.id} className="flex items-center gap-3 p-3.5 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700"><div className="p-3 bg-slate-800 rounded-xl text-indigo-400">{log.mode === 'video' ? <Video className="w-5 h-5" /> : <Phone className="w-5 h-5" />}</div><div className="flex-1 min-w-0"><h4 className="font-semibold text-sm truncate">MyChat call</h4><p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1"><PhoneOutgoing className="w-3.5 h-3.5 text-indigo-400" />{new Date(log.started_at).toLocaleString()} <span>•</span><span className={log.ended_at ? 'text-slate-500' : 'text-emerald-400'}>{log.ended_at ? 'Ended' : 'Active'}</span></p></div><button onClick={() => startCall(log.mode)} aria-label={`Call again by ${log.mode}`} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-indigo-400">{log.mode === 'video' ? <Video className="w-5 h-5" /> : <Phone className="w-5 h-5" />}</button></div>)}
        {!filteredLogs.length && <div className="min-h-[300px] rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 flex flex-col items-center justify-center text-center p-8"><div className="p-4 rounded-full bg-indigo-600/15 text-indigo-300 mb-4"><PhoneCall className="w-10 h-10" /></div><h2 className="font-semibold text-lg">No recent calls</h2><p className="text-sm text-slate-400 mt-2 max-w-xs">Start a voice or video call and your history will appear here.</p><button onClick={() => startCall('audio')} className="mt-5 bg-indigo-600 hover:bg-indigo-500 rounded-xl px-4 py-2.5 text-sm font-semibold">Start a new call</button></div>}
      </section>
      <div className="fixed bottom-24 right-5 md:bottom-8 md:right-8 flex flex-col gap-2 items-end"><button onClick={() => startCall('video')} aria-label="Start video call" className="p-3 bg-slate-800 border border-slate-700 rounded-full text-indigo-300 shadow-xl"><Video className="w-5 h-5" /></button><button onClick={() => startCall('audio')} aria-label="Start audio call" className="p-4 bg-indigo-600 hover:bg-indigo-500 rounded-full text-white shadow-xl shadow-indigo-600/30"><Plus className="w-6 h-6" /></button></div>

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
                <div ref={localVideoRef} className="absolute inset-0 w-full h-full" />
                {remoteUsers[0]?.videoTrack && <div ref={(element) => { if (element) remoteUsers[0].videoTrack.play(element); }} className="absolute inset-0 w-full h-full" />}
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
              onClick={endCall}
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
