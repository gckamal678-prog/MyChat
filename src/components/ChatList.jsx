import React, { useEffect, useState } from 'react';
import { Search, Plus, Camera, Moon, Sun, UserPlus, X, Trash2 } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

export default function ChatList({ onSelectChat, darkMode, setDarkMode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState([]);
  const [error, setError] = useState('');
  const [showFriends, setShowFriends] = useState(false);
  const [people, setPeople] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendSearch, setFriendSearch] = useState('');
  const [incoming, setIncoming] = useState([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const { user } = useAuth();

  const loadFriends = async () => {
    const { data: requests } = await supabase.from('friend_requests').select('id, sender_id, receiver_id, status').or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
    const { data: links } = await supabase.from('friendships').select('friend_id, user_id').or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);
    const ids = (links || []).map((link) => link.user_id === user.id ? link.friend_id : link.user_id);
    const { data: profiles } = ids.length ? await supabase.from('profiles').select('id, display_name, avatar_url').in('id', ids) : { data: [] };
    setFriends(profiles || []);
    setIncoming((requests || []).filter((request) => request.receiver_id === user.id && request.status === 'pending'));
  };

  const openFriends = async () => { setShowFriends(true); await loadFriends(); };
  const openCamera = async () => {
    try { setCameraStream(await navigator.mediaDevices.getUserMedia({ video: true })); setCameraOpen(true); }
    catch { setError('Camera permission was denied or unavailable.'); }
  };
  const searchPeople = async () => {
    if (!friendSearch.trim()) { setPeople([]); return; }
    const { data } = await supabase.from('profiles').select('id, display_name, avatar_url').ilike('display_name', `%${friendSearch.trim()}%`).neq('id', user.id).limit(10);
    setPeople(data || []);
  };
  const sendRequest = async (receiverId) => {
    const { error: requestError } = await supabase.from('friend_requests').insert({ sender_id: user.id, receiver_id: receiverId });
    if (requestError) setError(requestError.code === '23505' ? 'Friend request already sent.' : requestError.message); else setPeople((current) => current.filter((person) => person.id !== receiverId));
  };
  const acceptRequest = async (request) => {
    const { error: updateError } = await supabase.from('friend_requests').update({ status: 'accepted' }).eq('id', request.id);
    if (updateError) { setError(updateError.message); return; }
    await supabase.from('friendships').upsert([{ user_id: user.id, friend_id: request.sender_id }, { user_id: request.sender_id, friend_id: user.id }]);
    await loadFriends();
  };

  const deleteChat = async (chat) => {
    if (!window.confirm(`Delete ${chat.name}? This removes the shared room and its messages.`)) return;
    const { error: deleteError } = await supabase.from('rooms').delete().eq('id', chat.id);
    if (deleteError) setError(deleteError.message); else setChats((current) => current.filter((item) => item.id !== chat.id));
  };

  useEffect(() => {
    let active = true;
    const loadRooms = async () => {
      const { data, error: roomsError } = await supabase
        .from('rooms')
        .select('id, name, created_at')
        .order('created_at', { ascending: true });
      if (!active) return;
      if (roomsError) {
        setError(roomsError.message);
        return;
      }
      setChats((data ?? []).map((room) => ({
        ...room,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(room.name)}&background=4f46e5&color=fff`,
        lastMessage: 'Open room to load messages',
        time: '',
        unread: 0,
        online: true,
      })));
    };
    if (user && supabase) loadRooms();
    return () => { active = false; };
  }, [user]);

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white p-4">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Chats</h1>
        <div className="flex items-center space-x-2">
          <button onClick={openCamera} aria-label="Open camera" className="p-2 bg-slate-900 rounded-xl hover:bg-slate-800 transition">
            <Camera className="w-5 h-5 text-indigo-400" />
          </button>
          <button onClick={openFriends} aria-label="Add friend" className="p-2 bg-slate-900 rounded-xl hover:bg-slate-800 transition">
            <UserPlus className="w-5 h-5 text-indigo-400" />
          </button>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 bg-slate-900 rounded-xl hover:bg-slate-800 transition"
          >
            {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search chats or contacts..."
          className="w-full bg-slate-900 border border-slate-800 pl-10 pr-4 py-3 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 text-white"
        />
      </div>

      {/* Chat List Items */}
      <div className="space-y-2 overflow-y-auto flex-1">
        {error && <p className="text-xs text-red-400">{error}. Run supabase/schema.sql first.</p>}
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            className="flex items-center justify-between p-3 bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60 rounded-2xl cursor-pointer transition"
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full object-cover" />
                {chat.online && (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full"></span>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-sm">{chat.name}</h4>
                <p className="text-xs text-slate-400 truncate max-w-[180px]">{chat.lastMessage}</p>
              </div>
            </div>
            <div className="text-right flex flex-col items-end space-y-1">
              <span className="text-[10px] text-slate-500">{chat.time}</span>
              <button onClick={(event) => { event.stopPropagation(); deleteChat(chat); }} aria-label={`Delete ${chat.name}`} className="text-slate-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              {chat.unread > 0 && (
                <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {chat.unread}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      {showFriends && <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"><div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4"><div className="flex justify-between items-center"><h2 className="font-bold">Friends</h2><button onClick={() => setShowFriends(false)}><X /></button></div><div className="flex gap-2"><input value={friendSearch} onChange={(event) => setFriendSearch(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && searchPeople()} placeholder="Search by name" className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm" /><button onClick={searchPeople} className="bg-indigo-600 rounded-xl px-3 text-xs">Search</button></div>{incoming.length > 0 && <div><p className="text-xs text-slate-400 mb-2">Friend requests</p>{incoming.map((request) => <div key={request.id} className="flex justify-between items-center py-2"><span className="text-sm">New request</span><button onClick={() => acceptRequest(request)} className="bg-emerald-600 rounded-lg px-3 py-1 text-xs">Accept</button></div>)}</div>}<div>{friends.length > 0 && <p className="text-xs text-slate-400 mb-2">Your friends</p>}{friends.map((friend) => <div key={friend.id} className="flex items-center gap-2 py-2"><img src={friend.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.display_name)}`} className="w-8 h-8 rounded-full" /><span className="text-sm">{friend.display_name}</span></div>)}</div>{people.map((person) => <div key={person.id} className="flex items-center justify-between py-2"><span className="text-sm">{person.display_name}</span><button onClick={() => sendRequest(person.id)} className="bg-indigo-600 rounded-lg px-3 py-1 text-xs">Add</button></div>)}</div></div>}
      {cameraOpen && <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"><div className="bg-slate-900 p-4 rounded-2xl"><video autoPlay playsInline ref={(element) => { if (element) element.srcObject = cameraStream; }} className="w-full max-w-md rounded-xl" /><button onClick={() => { cameraStream?.getTracks().forEach((track) => track.stop()); setCameraStream(null); setCameraOpen(false); }} className="w-full mt-3 bg-red-600 rounded-xl py-2 text-sm">Close Camera</button></div></div>}
    </div>
  );
}
