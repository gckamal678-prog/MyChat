import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Send, Plus, X, FastForward } from 'lucide-react';

export default function Reels() {
  const [reels, setReels] = useState([
    {
      id: 1,
      author: 'Kamal GC',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
      caption: 'Building a high-performance PWA with Vite and React! 🚀 #PWA #React',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-coder-working-on-his-laptop-in-a-office-43088-large.mp4',
      likes: 1240,
      comments: 89,
      isLiked: false,
      speed: 1,
      commentsList: [],
    },
    {
      id: 2,
      author: 'PWA Tech',
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop&crop=faces',
      caption: 'Smooth vertical scrolling and offline support using Service Workers.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-woman-working-on-a-laptop-43086-large.mp4',
      likes: 850,
      comments: 42,
      isLiked: false,
      speed: 1,
      commentsList: [],
    },
  ]);
  const [showComposer, setShowComposer] = useState(false);
  const [caption, setCaption] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [commentFor, setCommentFor] = useState(null);
  const [commentText, setCommentText] = useState('');

  const handleLike = (id) => {
    setReels(reels.map(reel => {
      if (reel.id === id) {
        return {
          ...reel,
          likes: reel.isLiked ? reel.likes - 1 : reel.likes + 1,
          isLiked: !reel.isLiked
        };
      }
      return reel;
    }));
  };

  const handleNotInterested = (id) => {
    setReels(reels.filter(reel => reel.id !== id));
  };

  const toggleSpeed = (id) => {
    setReels(reels.map(reel => {
      if (reel.id === id) {
        const nextSpeed = reel.speed === 1 ? 1.5 : reel.speed === 1.5 ? 2 : 1;
        return { ...reel, speed: nextSpeed };
      }
      return reel;
    }));
  };

  const handlePost = (event) => {
    event.preventDefault();
    if (!caption.trim() || !videoFile) return;
    setReels((current) => [{ id: Date.now(), author: 'Kamal GC', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces', caption: caption.trim(), videoUrl: URL.createObjectURL(videoFile), likes: 0, comments: 0, isLiked: false, speed: 1, commentsList: [] }, ...current]);
    setCaption('');
    setVideoFile(null);
    setShowComposer(false);
  };

  const handleComment = (event) => {
    event.preventDefault();
    if (!commentText.trim()) return;
    setReels((current) => current.map((reel) => reel.id === commentFor ? { ...reel, comments: reel.comments + 1, commentsList: [...reel.commentsList, commentText.trim()] } : reel));
    setCommentText('');
    setCommentFor(null);
  };

  const handleShare = async (reel) => {
    if (navigator.share) await navigator.share({ title: reel.author, text: reel.caption, url: reel.videoUrl });
    else await navigator.clipboard?.writeText(reel.caption);
  };

  if (reels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-slate-400 space-y-3">
        <p>No more reels left in your feed.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-semibold"
        >
          Refresh Feed
        </button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-5rem)] md:h-[90vh] max-w-md mx-auto overflow-y-scroll snap-y snap-mandatory rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl relative no-scrollbar">
      <button onClick={() => setShowComposer(true)} aria-label="Post a reel" className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-indigo-600 text-white shadow-lg"><Plus className="w-5 h-5" /></button>
      {reels.map((reel) => (
        <div key={reel.id} className="w-full h-full snap-start relative flex items-center justify-center bg-slate-900">
          {/* Video Element */}
          <video
            src={reel.videoUrl}
            className="w-full h-full object-cover"
            loop
            autoPlay
            muted
            playsInline
          />

          {/* Semi-transparent Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none" />

          {/* Top Controls: Not Interested & Speed */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
            <button
              onClick={() => handleNotInterested(reel.id)}
              className="bg-black/40 backdrop-blur-md border border-white/10 text-white text-[10px] px-3 py-1.5 rounded-full hover:bg-black/60 transition"
            >
              Not Interested
            </button>
            <button
              onClick={() => toggleSpeed(reel.id)}
              className="bg-black/40 backdrop-blur-md border border-white/10 text-white text-[10px] px-3 py-1.5 rounded-full flex items-center space-x-1 hover:bg-black/60 transition"
            >
              <FastForward className="w-3 h-3" />
              <span>{reel.speed}x</span>
            </button>
          </div>

          {/* Right Floating Interaction Buttons */}
          <div className="absolute right-4 bottom-20 flex flex-col items-center space-y-4 z-20">
            <button
              onClick={() => handleLike(reel.id)}
              className="p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white hover:scale-110 transition"
            >
              <Heart className={`w-6 h-6 ${reel.isLiked ? 'text-red-500 fill-red-500' : 'text-white'}`} />
            </button>
            <span className="text-xs text-white font-bold">{reel.likes}</span>

            <button onClick={() => setCommentFor(reel.id)} aria-label="Comment" className="p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white hover:scale-110 transition">
              <MessageCircle className="w-6 h-6" />
            </button>
            <span className="text-xs text-white font-bold">{reel.comments}</span>

            <button onClick={() => handleShare(reel)} aria-label="Share" className="p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white hover:scale-110 transition">
              <Share2 className="w-6 h-6" />
            </button>

            <button className="p-3 bg-indigo-600 rounded-full text-white hover:scale-110 transition shadow-lg shadow-indigo-600/50">
              <Send className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Details / Author Info */}
          <div className="absolute bottom-6 left-4 right-16 z-20 space-y-2">
            <div className="flex items-center space-x-3">
              <img src={reel.avatar} alt={reel.author} className="w-10 h-10 rounded-full object-cover border border-white/20" />
              <h4 className="font-semibold text-sm text-white">{reel.author}</h4>
            </div>
            <p className="text-xs text-slate-200 line-clamp-2">{reel.caption}</p>
          </div>
        </div>
      ))}
      {showComposer && <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"><form onSubmit={handlePost} className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-3"><div className="flex justify-between"><h2 className="font-bold">Post a Reel</h2><button type="button" onClick={() => setShowComposer(false)}><X /></button></div><textarea value={caption} onChange={(event) => setCaption(event.target.value)} required placeholder="Write a caption" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm" /><input type="file" accept="video/*" required onChange={(event) => setVideoFile(event.target.files?.[0] || null)} className="w-full text-sm" /><button className="w-full bg-indigo-600 rounded-xl py-3 font-semibold">Post Reel</button></form></div>}
      {commentFor && <div className="fixed inset-0 z-50 bg-black/70 flex items-end justify-center p-4"><form onSubmit={handleComment} className="w-full max-w-md bg-slate-900 rounded-2xl p-4 flex gap-2"><input autoFocus value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="Write a comment" className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 text-sm" /><button className="bg-indigo-600 rounded-xl px-4"><Send className="w-4 h-4" /></button><button type="button" onClick={() => setCommentFor(null)}><X /></button></form></div>}
    </div>
  );
}
