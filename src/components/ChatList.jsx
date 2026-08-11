import React, { useState } from 'react';
import { Search, Plus, Camera, Moon, Sun } from 'lucide-react';

export default function ChatList({ onSelectChat }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDark, setIsDark] = useState(true);

  // Input Sanitization for Security (Module 5)
  const sanitizeInput = (str) => str.replace(/[<>]/g, '');

  const chats = [
    { id: 1, name: 'Kamal GC', message: 'Hey, are we meeting today?', time: '10:45 AM', unread: 2, online: true, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
    { id: 2, name: 'Tech Group', message: 'New update released!', time: 'Yesterday', unread: 0, online: false, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
    { id: 3, name: 'Sushila', message: 'Ok sounds good 👍', time: 'Monday', unread: 1, online: true, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
  ];

  const filteredChats = chats.filter(c => c.name.toLowerCase().includes(sanitizeInput(searchTerm).toLowerCase()));

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-indigo-400">Chats</h2>
        <div className="flex items-center gap-2">
          <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300"><Camera size={18} /></button>
          <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300"><Plus size={18} /></button>
          <button onClick={() => setIsDark(!isDark)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search chats or contacts..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="space-y-2">
        {filteredChats.map((chat) => (
          <div 
            key={chat.id} 
            onClick={() => onSelectChat(chat)}
            className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
          >
            <div className="relative">
              <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full object-cover" />
              {chat.online && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-semibold text-sm truncate">{chat.name}</h4>
                <span className="text-xs text-slate-400">{chat.time}</span>
              </div>
              <p className="text-xs text-slate-400 truncate">{chat.message}</p>
            </div>
            {chat.unread > 0 && (
              <span className="bg-indigo-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                {chat.unread}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
