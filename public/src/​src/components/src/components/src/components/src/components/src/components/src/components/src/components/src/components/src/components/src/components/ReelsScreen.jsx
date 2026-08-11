import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, ThumbsDown } from 'lucide-react';

export default function ReelsScreen() {
  const [reels, setReels] = useState([
    { 
      id: 1, 
      author: 'Kamal GC', 
      caption: 'Building amazing PWA apps with React & Tailwind! 🚀', 
      likes: 1240, 
      comments: 85, 
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-coding-on-a-computer-screen-4309-large.mp4',
      isLiked: false,
      speed: 1
    },
  ]);

  const handleLike = (id) => {
    setReels(reels.map(reel => reel.id === id ? { ...reel, likes: reel.isLiked ? reel.likes - 1 : reel.likes + 1, isLiked: !reel.isLiked } : reel));
  };

  const handleNotInterested = (id) => {
    setReels(reels.filter(reel => reel.id !== id));
  };

  const toggleSpeed = (id) => {
    setReels(reels.map(reel => reel.id === id ? { ...reel, speed: reel.speed === 1 ? 1.5 : reel.speed === 1.5 ? 2 : 1 } : reel));
  };

  if (reels.length === 0) {
    return (
      <div className="w-full max-w-md h-[550px] bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center p-6 text-center shadow-xl">
        <h3 className="text-lg font-bold text-indigo-400 mb-2">Feed Cleaned</h3>
        <p className="text-xs text-slate-400">No more reels to show based on your preferences.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md h-[580px] bg-slate-950 border border-slate-800 rounded-2xl relative overflow-y-scroll snap-y snap-mandatory shadow-xl no-scrollbar">
      {reels.map((reel) => (
        <div key={reel.id} className="w-full h-full snap-start relative flex items-center justify-center bg-slate-900">
          <video 
            src={reel.videoUrl} 
            className="w-full h-full object-cover" 
            loop 
            autoPlay 
            muted 
            playsInline
            onLoadedMetadata={(e) => { e.target.playbackRate = reel.speed; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent pointer-events-none" />

          <div className="absolute bottom-4 left-4 right-16 z-10 space-y-2 pointer-events-auto">
            <h4 className="font-bold text-sm text-white">{reel.author}</h4>
            <p className="text-xs text-slate-200 line-clamp-2">{reel.caption}</p>
          </div>

          <div className="absolute bottom-16 right-4 z-10 flex flex-col items-center gap-4">
            <button onClick={() => handleLike(reel.id)} className="flex flex-col items-center text-white">
              <div className={`p-3 rounded-full backdrop-blur-md ${reel.isLiked ? 'bg-rose-600/80 text-white' : 'bg-slate-900/60 text-slate-200'}`}>
                <Heart size={20} className={reel.isLiked ? 'fill-white' : ''} />
              </div>
              <span className="text-[10px] mt-1 font-semibold">{reel.likes}</span>
            </button>

            <button className="flex flex-col items-center text-white">
              <div className="p-3 bg-slate-900/60 backdrop-blur-md rounded-full text-slate-200">
                <MessageCircle size={20} />
              </div>
              <span className="text-[10px] mt-1 font-semibold">{reel.comments}</span>
            </button>

            <button className="flex flex-col items-center text-white">
              <div className="p-3 bg-slate-900/60 backdrop-blur-md rounded-full text-slate-200">
                <Share2 size={20} />
              </div>
            </button>

            <button onClick={() => toggleSpeed(reel.id)} className="flex flex-col items-center text-white">
              <div className="px-2.5 py-1.5 bg-indigo-600/80 backdrop-blur-md rounded-full text-[10px] font-bold text-white">
                {reel.speed}x
              </div>
            </button>

            <button onClick={() => handleNotInterested(reel.id)} className="flex flex-col items-center text-white">
              <div className="p-3 bg-slate-900/60 backdrop-blur-md rounded-full text-rose-400">
                <ThumbsDown size={18} />
              </div>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
