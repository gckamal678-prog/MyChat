import React, { useState } from 'react';
import { Users, Heart, MessageCircle, Share2, Plus, Image as ImageIcon } from 'lucide-react';

export default function Communities() {
  const [posts, setPosts] = useState([
    {
      id: 1,
      community: 'React & Vite PWA Developers',
      author: 'Kamal GC',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
      time: '2h ago',
      content: 'हामीले MyChat PWA मा भर्खरै अडियो/भिडियो कल र कम्युनिटी फिचर थपेका छौं! एकदम फास्ट र स्मूथ चलिरहेको छ। 🚀',
      likes: 24,
      comments: 5,
    }
  ]);
  const [newPostText, setNewPostText] = useState('');

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    setPosts([
      {
        id: Date.now(),
        community: 'React & Vite PWA Developers',
        author: 'Kamal GC',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
        time: 'Just now',
        content: newPostText,
        likes: 0,
        comments: 0,
      },
      ...posts
    ]);
    setNewPostText('');
  };

  return (
    <div className="p-4 max-w-2xl mx-auto text-white space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center space-x-2">
          <Users className="w-6 h-6 text-indigo-400" />
          <span>Communities</span>
        </h1>
      </div>

      {/* Create Post Box */}
      <form onSubmit={handleCreatePost} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
        <textarea
          value={newPostText}
          onChange={(e) => setNewPostText(e.target.value)}
          placeholder="What's happening in your community?"
          className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-white resize-none h-20"
        />
        <div className="flex justify-between items-center">
          <button type="button" className="p-2 text-slate-400 hover:text-indigo-400 transition">
            <ImageIcon className="w-5 h-5" />
          </button>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/30"
          >
            Post Update
          </button>
        </div>
      </form>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img src={post.avatar} alt={post.author} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h4 className="font-semibold text-sm">{post.author}</h4>
                  <span className="text-[10px] text-indigo-400 bg-indigo-600/20 px-2 py-0.5 rounded-full">{post.community}</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-500">{post.time}</span>
            </div>

            <p className="text-sm text-slate-200">{post.content}</p>

            <div className="flex items-center space-x-6 pt-2 border-t border-slate-800/60 text-slate-400 text-xs">
              <button className="flex items-center space-x-1.5 hover:text-indigo-400 transition">
                <Heart className="w-4 h-4" />
                <span>{post.likes}</span>
              </button>
              <button className="flex items-center space-x-1.5 hover:text-indigo-400 transition">
                <MessageCircle className="w-4 h-4" />
                <span>{post.comments}</span>
              </button>
              <button className="flex items-center space-x-1.5 hover:text-indigo-400 transition">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
