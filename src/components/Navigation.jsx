import React from 'react';
import { MessageSquare, Users, Video, PhoneCall, Settings } from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'chats', label: 'Chats', icon: MessageSquare },
    { id: 'communities', label: 'Communities', icon: Users },
    { id: 'reels', label: 'Reels', icon: Video },
    { id: 'calls', label: 'Calls', icon: PhoneCall },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col w-64 p-4 fixed h-full z-40 ${activeTab === 'reels' ? 'bg-slate-950/40 border-r border-white/10 backdrop-blur-sm' : 'bg-slate-900 border-r border-slate-800'}`}>
        <div className="flex items-center space-x-3 px-3 py-4 mb-6">
          <div className="bg-indigo-600 p-2 rounded-xl text-white font-bold">MC</div>
          <span className="text-lg font-bold text-white tracking-wider">MyChat</span>
        </div>
        <nav className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 flex justify-around p-3 z-40 ${activeTab === 'reels' ? 'bg-black/30 border-t border-white/10 backdrop-blur-sm' : 'bg-slate-900 border-t border-slate-800'}`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center space-y-1 p-2 rounded-xl transition ${
                isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
