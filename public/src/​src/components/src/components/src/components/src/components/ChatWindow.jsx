import React, { useState } from 'react';
import { Send, Image, FileText, Lock, Play, Pause } from 'lucide-react';
import SecurityKeysModal from './SecurityKeysModal';

export default function ChatWindow({ chat, onBack }) {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'them', text: 'Hello! How is the project going?', time: '10:40 AM', type: 'text' },
    { id: 2, sender: 'me', text: 'Going great! Implementing Module 2 now.', time: '10:42 AM', type: 'text' },
  ]);
  const [inputText, setInputText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showKeys, setShowKeys] = useState(false);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const cleanText = inputText.replace(/[<>]/g, ''); // Sanitization
    setMessages([...messages, { id: Date.now(), sender: 'me', text: cleanText, time: 'Just now', type: 'text' }]);
    setInputText('');
  };

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[600px] shadow-xl">
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between rounded-t-2xl">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-indigo-400 text-sm font-semibold">← Back</button>
          <img src={chat?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} alt="" className="w-10 h-10 rounded-full object-cover" />
          <div>
            <h4 className="font-bold text-sm">{chat?.name || 'Kamal GC'}</h4>
            <span className="text-xs text-emerald-400">Online</span>
          </div>
        </div>
        <button onClick={() => setShowKeys(true)} className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1 text-slate-300">
          <Lock size={12} className="text-emerald-400" /> E2EE
        </button>
      </div>

      <div className="bg-emerald-950/40 border-b border-emerald-900/50 py-1.5 px-4 text-center">
        <p className="text-[11px] text-emerald-400 flex items-center justify-center gap-1">
          <Lock size={12} /> Messages are End-to-End Encrypted
        </p>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${
              msg.sender === 'me' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-100 rounded-bl-none'
            }`}>
              <p>{msg.text}</p>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.time}</span>
          </div>
        ))}
      </div>

      <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2 rounded-b-2xl">
        <button className="text-slate-400 hover:text-white p-2"><Image size={18} /></button>
        <button className="text-slate-400 hover:text-white p-2"><FileText size={18} /></button>
        <input 
          type="text" 
          placeholder="Type a message..." 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-sm focus:outline-none"
        />
        <button onClick={handleSend} className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl"><Send size={18} /></button>
      </div>

      {showKeys && <SecurityKeysModal onClose={() => setShowKeys(false)} />}
    </div>
  );
}
