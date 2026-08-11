import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Plus, Image } from 'lucide-react';

export default function CommunitiesScreen() {
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState([
    { id: 1, author: 'Tech Insider', handle: '@tech_guru', text: 'Just tested the new Vite 6 build performance. Blazing fast! ⚡', likes: 42, comments: 12, time: '2h ago', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
  ]);
  const [newPostText, setNewPostText] = useState('');

  const handleCreatePost = () => {
    if (!newPostText.trim()) return;
    const cleanPost = newPostText.replace(/[<>]/g, '');
    setPosts([{
      id: Date.now(),
      author: 'Kamal GC',
      handle: '@kamalgc',
      text: cleanPost,
      likes: 0,
      comments: 0,
      time: 'Just now',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
    }, ...posts]);
    setNewPostText('');
  };

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h2 className="text-xl font-bold text-indigo-400">Communities</h2>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('feed')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === 'feed' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Feed</button>
          <button onClick={() => setActiveTab('explore')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === 'explore' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Explore</button>
        </div>
      </div>

      {activeTab === 'feed' ? (
        <div className="space-y-4">
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <textarea 
              placeholder="What's happening in your community?" 
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 resize-none focus:outline-none"
              rows="2"
            />
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-700/50">
              <button className="text-slate-400 hover:text-indigo-400"><Image size={18} /></button>
              <button onClick={handleCreatePost} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                <Plus size={14} /> Post
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-3">
                  <img src={post.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-sm">{post.author} <span className="text-xs text-slate-500 font-normal">{post.handle}</span></h4>
                    <span className="text-[10px] text-slate-400">{post.time}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-200">{post.text}</p>
                <div className="flex justify-between text-slate-400 text-xs pt-2">
                  <button className="flex items-center gap-1 hover:text-indigo-400"><Heart size={14} /> {post.likes}</button>
                  <button className="flex items-center gap-1 hover:text-indigo-400"><MessageCircle size={14} /> {post.comments}</button>
                  <button className="flex items-center gap-1 hover:text-indigo-400"><Share2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-sm text-indigo-300">React Developers Nepal</h4>
              <p className="text-xs text-slate-400">Discussing React, Vite, and PWA ecosystem.</p>
              <span className="text-[10px] text-emerald-400 mt-1 block">1.2k members</span>
            </div>
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold">Join</button>
          </div>
        </div>
      )}
    </div>
  );
}
