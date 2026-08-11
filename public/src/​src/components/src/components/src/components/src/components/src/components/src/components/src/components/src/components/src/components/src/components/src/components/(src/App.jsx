import React, { useState } from 'react';
import Navigation from './components/Navigation';
import InstallPrompt from './components/InstallPrompt';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import CommunitiesScreen from './components/CommunitiesScreen';
import CallsScreen from './components/CallsScreen';
import ActiveCallModal from './components/ActiveCallModal';
import ReelsScreen from './components/ReelsScreen';
import SettingsScreen from './components/SettingsScreen';
import StorageScreen from './components/StorageScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState('chats');
  const [selectedChat, setSelectedChat] = useState(null);
  const [activeCallMode, setActiveCallMode] = useState(null);
  const [showStorage, setShowStorage] = useState(false);

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pl-64 flex flex-col justify-center items-center p-4">
      <Navigation activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setSelectedChat(null); setShowStorage(false); }} />
      <InstallPrompt />

      {activeCallMode && <ActiveCallModal mode={activeCallMode} onClose={() => setActiveCallMode(null)} />}

      <div className="w-full max-w-xl flex justify-center">
        {activeTab === 'chats' && !selectedChat && <ChatList onSelectChat={(chat) => setSelectedChat(chat)} />}
        {activeTab === 'chats' && selectedChat && <ChatWindow chat={selectedChat} onBack={() => setSelectedChat(null)} />}
        {activeTab === 'communities' && <CommunitiesScreen />}
        {activeTab === 'reels' && <ReelsScreen />}
        {activeTab === 'calls' && <CallsScreen onStartCall={(mode) => setActiveCallMode(mode)} />}
        {activeTab === 'settings' && (
          showStorage ? <StorageScreen /> : <SettingsScreen onOpenStorage={() => setShowStorage(true)} />
        )}
      </div>
    </div>
  );
}
