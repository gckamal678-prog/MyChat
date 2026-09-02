import React, { useEffect, useRef, useState } from 'react';
import { Phone, Video, PhoneOutgoing, Mic, MicOff, Camera, VideoOff, PhoneOff, Volume2, Search, Plus, PhoneCall, Users } from 'lucide-react';
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
  const [contacts, setContacts] = useState([]);
  const [contactPickerOpen, setContactPickerOpen] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [groupCall, setGroupCall] = useState(false);
  const [incomingInvite, setIncomingInvite] = useState(null);
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

  useEffect(() => {
    let active = true;
    const loadContacts = async () => {
      const [{ data: links, error: linksError }, { data: acceptedRequests, error: requestsError }] = await Promise.all([
        supabase
        .from('friendships')
        .select('friend_id, user_id')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`),
        supabase
          .from('friend_requests')
          .select('sender_id, receiver_id')
          .eq('status', 'accepted')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`),
      ]);
      if (linksError && requestsError) {
        if (active) setCameraError(linksError.message);
        return;
      }
      const ids = new Set([
        ...(links || []).map((link) => link.user_id === user.id ? link.friend_id : link.user_id),
        ...(acceptedRequests || []).map((request) => request.sender_id === user.id ? request.receiver_id : request.sender_id),
      ]);
      if (!ids.length) {
        if (active) setContacts([]);
        return;
      }
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', [...ids]);
      if (active) {
        if (profilesError) setCameraError(profilesError.message);
        else setContacts((profiles || []).map((profile) => ({
          ...profile,
          display_name: profile.display_name || 'MyChat User',
        })));
      }
    };
    loadContacts();
    return () => { active = false; };
  }, [user.id]);

  useEffect(() => {
    const channel = supabase.channel(`call-invites-${user.id}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'call_invites', filter: `receiver_id=eq.${user.id}` }, (payload) => {
      if (payload.new.status === 'ringing') setIncomingInvite(payload.new);
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user.id]);

  const updateInvite = async (status) => {
    if (!incomingInvite) return;
    await supabase.from('call_invites').update({ status, answered_at: status === 'accepted' ? new Date().toISOString() : null }).eq('id', incomingInvite.id);
    if (status === 'accepted') {
      setSelectedContact({ id: incomingInvite.caller_id, display_name: 'Caller' });
      startCall(incomingInvite.mode, incomingInvite.channel);
    }
    setIncomingInvite(null);
  };

  useEffect(() => () => {
    localTracksRef.current.forEach((track) => track.close());
    clientRef.current?.leave();
  }, []);

  const startCall = async (mode, channel = 'mychat-general') => {
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
      await client.join(agoraAppId, channel, user.id, null);
      const tracks = mode === 'video'
        ? await AgoraRTC.createMicrophoneAndCameraTracks()
        : [await AgoraRTC.createMicrophoneAudioTrack()];
      localTracksRef.current = tracks;
      await client.publish(tracks);
      await supabase.from('call_logs').insert({ caller_id: user.id, channel, mode });
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

  const inviteContact = async (contact, mode) => {
    setContactLoading(true);
    setCameraError('');
    const channel = `call-${crypto.randomUUID()}`;
    const { error: inviteError } = await supabase.from('call_invites').insert({
      caller_id: user.id,
      receiver_id: contact.id,
      channel,
      mode,
      status: 'ringing',
    });
    setContactLoading(false);
    if (inviteError) {
      setCameraError(inviteError.message);
      return;
    }
    setSelectedContact(contact);
    setContactPickerOpen(false);
    await startCall(mode, channel);
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
  const filteredContacts = contacts.filter((contact) => (contact.display_name || 'MyChat User').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 max-w-2xl mx-auto text-white space-y-5 relative min-h-[520px]">
      <header className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Calls</h1><p className="text-xs text-slate-400 mt-1">Your recent voice and video calls</p></div>
      </header>
      {cameraError && <p className="text-xs text-red-400">{cameraError}</p>}
      {incomingInvite && <div className="rounded-2xl border border-indigo-400/40 bg-indigo-950/60 p-4"><p className="text-sm font-semibold">Incoming {incomingInvite.mode} call</p><div className="mt-3 flex gap-2"><button onClick={() => updateInvite('accepted')} className="rounded-xl bg-emerald-600 px-4 py-2 text-xs">Accept</button><button onClick={() => updateInvite('declined')} className="rounded-xl bg-red-600 px-4 py-2 text-xs">Decline</button></div></div>}

      <div className="relative"><Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search contacts or call history" className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500" /></div>
      {filteredContacts.length > 0 && <section className="space-y-2"><p className="text-xs text-slate-400">Contacts</p>{filteredContacts.map((contact) => <div key={contact.id} className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-3"><img src={contact.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.display_name)}`} alt="" className="h-10 w-10 rounded-full" /><span className="flex-1 text-sm font-semibold">{contact.display_name}</span><button onClick={() => inviteContact(contact, 'audio')} aria-label={`Call ${contact.display_name}`} className="rounded-xl bg-indigo-600 p-2"><Phone className="h-4 w-4" /></button><button onClick={() => inviteContact(contact, 'video')} aria-label={`Video call ${contact.display_name}`} className="rounded-xl bg-slate-800 p-2"><Video className="h-4 w-4" /></button></div>)}</section>}

      <section className="space-y-2">
        {filteredLogs.map((log) => <div key={log.id} className="flex items-center gap-3 p-3.5 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700"><div className="p-3 bg-slate-800 rounded-xl text-indigo-400">{log.mode === 'video' ? <Video className="w-5 h-5" /> : <Phone className="w-5 h-5" />}</div><div className="flex-1 min-w-0"><h4 className="font-semibold text-sm truncate">MyChat call</h4><p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1"><PhoneOutgoing className="w-3.5 h-3.5 text-indigo-400" />{new Date(log.started_at).toLocaleString()} <span>•</span><span className={log.ended_at ? 'text-slate-500' : 'text-emerald-400'}>{log.ended_at ? 'Ended' : 'Active'}</span></p></div><button onClick={() => startCall(log.mode)} aria-label={`Call again by ${log.mode}`} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-indigo-400">{log.mode === 'video' ? <Video className="w-5 h-5" /> : <Phone className="w-5 h-5" />}</button></div>)}
        {!filteredLogs.length && <div className="min-h-[300px] rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 flex flex-col items-center justify-center text-center p-8"><div className="p-4 rounded-full bg-indigo-600/15 text-indigo-300 mb-4"><PhoneCall className="w-10 h-10" /></div><h2 className="font-semibold text-lg">No recent calls</h2><p className="text-sm text-slate-400 mt-2 max-w-xs">Start a voice or video call and your history will appear here.</p><button onClick={() => startCall('audio')} className="mt-5 bg-indigo-600 hover:bg-indigo-500 rounded-xl px-4 py-2.5 text-sm font-semibold">Start a new call</button></div>}
      </section>
      <div className="fixed bottom-24 right-5 md:bottom-8 md:right-8 flex flex-col gap-2 items-end"><button onClick={() => { setGroupCall(true); startCall('audio'); }} aria-label="Start group call" className="p-3 bg-slate-800 border border-slate-700 rounded-full text-indigo-300 shadow-xl"><Users className="w-5 h-5" /></button><button onClick={() => setContactPickerOpen(true)} aria-label="Select contact for video call" className="p-3 bg-slate-800 border border-slate-700 rounded-full text-indigo-300 shadow-xl"><Video className="w-5 h-5" /></button><button onClick={() => setContactPickerOpen(true)} aria-label="Select contact for audio call" className="p-4 bg-indigo-600 hover:bg-indigo-500 rounded-full text-white shadow-xl shadow-indigo-600/30"><Plus className="w-6 h-6" /></button></div>

      {contactPickerOpen && <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4"><div className="w-full max-w-md space-y-4 rounded-2xl border border-slate-700 bg-slate-900 p-5"><div className="flex items-center justify-between"><h2 className="font-bold">Choose a contact</h2><button onClick={() => setContactPickerOpen(false)} aria-label="Close contact picker">×</button></div>{contactLoading && <p className="text-xs text-slate-400">Sending invite...</p>}{!contacts.length && !contactLoading && <p className="text-sm text-slate-400">Add a friend before starting a call.</p>}{contacts.map((contact) => <div key={contact.id} className="flex items-center gap-2"><span className="flex-1 text-sm">{contact.display_name}</span><button disabled={contactLoading} onClick={() => inviteContact(contact, 'audio')} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs disabled:opacity-50">Audio</button><button disabled={contactLoading} onClick={() => inviteContact(contact, 'video')} className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs disabled:opacity-50">Video</button></div>)}</div></div>}

      {/* Active Call Modal / Overlay */}
      {activeCall && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col items-center justify-between p-8 text-white">
          <div className="text-center space-y-2 mt-4">
            <h3 className="text-xl font-bold">{selectedContact?.display_name || 'MyChat call'}</h3>
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
