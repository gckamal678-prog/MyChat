import React, { useEffect, useState, Suspense, lazy } from 'react';
import AuthScreen from './components/Signup';
import Navigation from './components/Navigation';
import InstallPrompt from './components/InstallPrompt';
import ChatWindow from './components/ChatWindow';
import BiometricScreen from './components/BiometricScreen';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from './context/AuthContext';

// Lazy loading for performance optimization
const ChatList = lazy(() => import('./components/ChatList'));
const Communities = lazy(() => import('./components/CommunitiesScreen'));
const CallsScreen = lazy(() => import('./components/CallsScreen'));
const Reels = lazy(() => import('./components/ReelsScreen'));
const SettingsScreen = lazy(() => import('./components/SettingsScreen'));

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [isBiometricVerified, setIsBiometricVerified] = useState(false);
  const [activeTab, setActiveTab] = useState('chats');
  const [selectedChat, setSelectedChat] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const { user, loading } = useAuth();

  useEffect(() => {
    const welcomeTimer = window.setTimeout(() => setShowWelcome(false), 1500);
    return () => window.clearTimeout(welcomeTimer);
  }, []);

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center animate-pulse">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-600 shadow-xl shadow-indigo-600/30">
            <ShieldCheck className="h-11 w-11" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">MyChat</h1>
          <p className="mt-2 text-sm text-slate-400">Private conversations, beautifully simple</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Checking session...</div>;
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (!isBiometricVerified) {
    return <BiometricScreen onSuccess={() => setIsBiometricVerified(true)} />;
  }

  // Render active tab content dynamically
  const renderContent = () => {
    switch (activeTab) {
      case 'chats':
        return selectedChat ? (
          <ChatWindow chat={selectedChat} onBack={() => setSelectedChat(null)} />
        ) : (
          <ChatList onSelectChat={setSelectedChat} darkMode={darkMode} setDarkMode={setDarkMode} />
        );
      case 'communities':
        return <Communities />;
      case 'calls':
        return <CallsScreen />;
      case 'reels':
        return <Reels />;
      case 'settings':
        return <SettingsScreen darkMode={darkMode} setDarkMode={setDarkMode} />;
      default:
        return <ChatList />;
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-900'} flex`}>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Content Area */}
      <main className={`flex-1 pb-20 md:pb-0 ${activeTab === 'reels' ? 'md:ml-0 p-0' : 'md:ml-64 p-4 md:p-6'}`}>
        <div className="max-w-4xl mx-auto">
          <header className={`${activeTab === 'reels' ? 'hidden' : 'flex'} justify-between items-center mb-6 pb-4 border-b border-slate-800`}>
            <h1 className="text-xl font-bold capitalize">{activeTab}</h1>
            <span className="text-xs bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/30">MyChat</span>
          </header>

          {/* Suspense handles loading state when switching tabs */}
          <Suspense fallback={
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center min-h-[400px] flex flex-col items-center justify-center shadow-xl">
              <p className="text-indigo-400 text-sm animate-pulse">Loading module...</p>
            </div>
          }>
            <div className={`${activeTab === 'reels' ? '' : 'bg-slate-900 border border-slate-800 rounded-3xl p-4 md:p-6 min-h-[400px] shadow-xl'}`}>
              {renderContent()}
            </div>
          </Suspense>
        </div>
      </main>

      <InstallPrompt />
    </div>
  );
}
