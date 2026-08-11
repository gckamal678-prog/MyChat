import React from 'react';
import { MessageSquare, Users, Video, Phone, Settings } from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'chats', label: 'Chats', icon: MessageSquare },
    { id: 'communities', label: 'Communities', icon: Users },
    { id: 'reels', label: 'Reels', icon: Video },
    { id: 'calls', label: 'Calls', icon: Phone },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 bg-slate-950 border-r border-slate-800 p-4 h-screen fixed left-0 top-0 z-40">
        <h1 className="text-xl font-bold text-indigo-400 mb-8 px-2">MyChat PWA</h1>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon size={20} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800 flex justify-around p-2 z-40">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center p-2 rounded-lg text-xs ${
                isActive ? 'text-indigo-400' : 'text-slate-400'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
