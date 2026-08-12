import React, { useState } from 'react';
import { Search, Plus, Camera, Moon, Sun, CheckCheck } from 'lucide-react';

export default function ChatList({ onSelectChat, darkMode, setDarkMode }) {
  const [searchQuery, setSearchQuery] = useState('');

  const chats = [
    {
      id: 1,
      name: 'Kamal GC',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
      lastMessage: 'PWA को मोडुल २ को कोड तयार छ!',
      time: '10:45 AM',
      unread: 2,
      online: true,
    },
    {
      id: 2,
      name: 'PWA Developers Group',
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop&crop=faces',
      lastMessage: 'Service worker successfully registered.',
      time: 'Yesterday',
      unread: 0,
      online: false,
    },
  ];

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white p-4">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Chats</h1>
        <div className="flex items-center space-x-2">
          <button className="p-2 bg-slate-900 rounded-xl hover:bg-slate-800 transition">
            <Camera className="w-5 h-5 text-indigo-400" />
          </button>
          <button className="p-2 bg-slate-900 rounded-xl hover:bg-slate-800 transition">
            <Plus className="w-5 h-5 text-indigo-400" />
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
              {chat.unread > 0 && (
                <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {chat.unread}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
