import React, { useState } from 'react';
import { ArrowLeft, Send, Mic, Paperclip, Play, Pause, Lock, Smile } from 'lucide-react';

export default function ChatWindow({ chat, onBack }) {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'them', text: 'नमस्कार! PWA एप कस्तो चलिरहेको छ?', time: '10:30 AM', type: 'text' },
    { id: 2, sender: 'me', text: 'एकदम राम्रो र फास्ट चलिरहेको छ दाइ।', time: '10:32 AM', type: 'text' },
    { id: 3, sender: 'them', text: 'Voice note सुन्नुहोस्:', time: '10:35 AM', type: 'audio', duration: '0:15' },
  ]);
  const [inputText, setInputText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  const handleSend = () => {
    if (!inputText.trim()) return;
    setMessages((current) => [...current, { id: Date.now(), sender: 'me', text: inputText.trim(), time: 'Just now', type: 'text' }]);
    setInputText('');
  };

  const handleAttachment = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*,application/pdf';
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) setMessages((current) => [...current, { id: Date.now(), sender: 'me', text: `Attached: ${file.name}`, time: 'Just now', type: 'text' }]);
    };
    input.click();
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-1.5 bg-slate-800 rounded-xl hover:bg-slate-700 transition">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <img src={chat.avatar} alt={chat.name} className="w-10 h-10 rounded-full object-cover" />
          <div>
            <h3 className="font-semibold text-sm">{chat.name}</h3>
            <span className="text-[10px] text-emerald-400 flex items-center">● Online</span>
          </div>
        </div>
      </div>

      {/* E2EE Security Badge Banner */}
      <div className="bg-indigo-950/40 border-b border-indigo-900/50 py-1.5 px-4 text-center">
        <p className="text-[11px] text-indigo-300 flex items-center justify-center space-x-1">
          <Lock className="w-3 h-3" />
          <span>Messages are End-to-End Encrypted. No one outside of this chat can read them.</span>
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md p-3.5 rounded-2xl text-sm relative ${
              msg.sender === 'me' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
            }`}>
              {msg.type === 'text' && <p>{msg.text}</p>}
              {msg.type === 'audio' && (
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 bg-indigo-500/30 rounded-full hover:bg-indigo-500/50 transition"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <div className="space-y-1">
                    <div className="flex space-x-0.5 items-end h-4">
                      {[12, 20, 8, 16, 24, 14, 18, 10, 22, 12].map((h, i) => (
                        <div key={i} style={{ height: `${h}px` }} className="w-1 bg-indigo-300 rounded-full" />
                      ))}
                    </div>
                    <span className="text-[10px] text-indigo-200">{msg.duration}</span>
                  </div>
                </div>
              )}
              <span className={`text-[9px] block mt-1 text-right ${msg.sender === 'me' ? 'text-indigo-200' : 'text-slate-500'}`}>
                {msg.time}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
          <button type="button" onClick={handleAttachment} aria-label="Attach file" className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition text-slate-400">
          <Paperclip className="w-5 h-5" />
        </button>
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a secure message..."
            className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-white"
          />
          {showEmoji && <div className="absolute bottom-14 left-0 bg-slate-800 border border-slate-700 rounded-xl p-2 text-lg">😀 😂 ❤️ 👍 🎉</div>}
        </div>
        <button type="button" onClick={() => setShowEmoji(!showEmoji)} aria-label="Add emoji" className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition text-slate-400">
          <Smile className="w-5 h-5" />
        </button>
        <button 
          onClick={handleSend}
          className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition shadow-lg shadow-indigo-600/30"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
