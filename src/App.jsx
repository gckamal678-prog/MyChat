import React, { useState, Suspense, lazy } from 'react';
import AuthScreen from './components/Login';
import Navigation from './components/Navigation';
import InstallPrompt from './components/InstallPrompt';

// Lazy loading for performance optimization
const ChatList = lazy(() => import('./components/ChatList'));
const Communities = lazy(() => import('./components/Communities'));
const CallsScreen = lazy(() => import('./components/Calls'));
const Reels = lazy(() => import('./components/Reels'));
const SettingsScreen = lazy(() => import('./components/Settings'));

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('chats');

  if (!isAuthenticated) {
    return <AuthScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // Render active tab content dynamically
  const renderContent = () => {
    switch (activeTab) {
      case 'chats':
        return <ChatList />;
      case 'communities':
        return <Communities />;
      case 'calls':
        return <CallsScreen />;
      case 'reels':
        return <Reels />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <ChatList />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <header className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
            <h1 className="text-xl font-bold capitalize">{activeTab}</h1>
            <span className="text-xs bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/30">Online PWA</span>
          </header>

          {/* Suspense handles loading state when switching tabs */}
          <Suspense fallback={
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center min-h-[400px] flex flex-col items-center justify-center shadow-xl">
              <p className="text-indigo-400 text-sm animate-pulse">Loading module...</p>
            </div>
          }>
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 md:p-6 min-h-[400px] shadow-xl">
              {renderContent()}
            </div>
          </Suspense>
        </div>
      </main>

      <InstallPrompt />
    </div>
  );
}
