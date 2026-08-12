import React, { useState } from 'react';
import AuthScreen from './components/Login';
import Navigation from './components/Navigation';
import InstallPrompt from './components/InstallPrompt';
import { MessageSquare, Users, Video, PhoneCall, Settings } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('chats');

  if (!isAuthenticated) {
    return <AuthScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0 p-6">
        <div className="max-w-4xl mx-auto">
          <header className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
            <h1 className="text-xl font-bold capitalize">{activeTab}</h1>
            <span className="text-xs bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/30">Online PWA</span>
          </header>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center min-h-[400px] flex flex-col items-center justify-center shadow-xl">
            <p className="text-slate-400 text-sm">Clean slate design ready for upcoming **{activeTab}** module.</p>
          </div>
        </div>
      </main>

      <InstallPrompt />
    </div>
  );
}
