import React, { useEffect, useState } from 'react';
import { Users, Heart, MessageCircle, Share2 } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

export default function Communities() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPostText, setNewPostText] = useState('');
  const [commentText, setCommentText] = useState({});
  const [error, setError] = useState('');

  const loadPosts = async () => {
    const { data, error: postsError } = await supabase.from('posts').select('id, user_id, community, content, created_at, post_comments(id, user_id, content), post_likes(user_id)').order('created_at', { ascending: false });
    if (postsError) { setError(postsError.message); return; }
    setPosts((data ?? []).map((post) => ({
      ...post,
      author: post.user_id === user.id ? (user.user_metadata?.full_name || user.email) : 'MyChat User',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user_id === user.id ? (user.user_metadata?.full_name || 'User') : 'MyChat User')}&background=4f46e5&color=fff`,
      likes: post.post_likes?.length ?? 0,
      comments: post.post_comments?.length ?? 0,
      isLiked: post.post_likes?.some((like) => like.user_id === user.id) ?? false,
    })));
  };

  useEffect(() => {
    loadPosts();
    const channel = supabase.channel('community-feed').on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, loadPosts).on('postgres_changes', { event: '*', schema: 'public', table: 'post_comments' }, loadPosts).on('postgres_changes', { event: '*', schema: 'public', table: 'post_likes' }, loadPosts).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user.id]);

  const handleCreatePost = async (event) => {
    event.preventDefault();
    if (!newPostText.trim()) return;
    const { error: postError } = await supabase.from('posts').insert({ user_id: user.id, content: newPostText.trim() });
    if (postError) setError(postError.message); else setNewPostText('');
  };

  const handleLike = async (post) => {
    const result = post.isLiked ? await supabase.from('post_likes').delete().match({ post_id: post.id, user_id: user.id }) : await supabase.from('post_likes').insert({ post_id: post.id, user_id: user.id });
    if (result.error) setError(result.error.message);
  };

  const handleComment = async (postId) => {
    const content = commentText[postId]?.trim();
    if (!content) return;
    const { error: commentError } = await supabase.from('post_comments').insert({ post_id: postId, user_id: user.id, content });
    if (commentError) setError(commentError.message); else setCommentText((current) => ({ ...current, [postId]: '' }));
  };

  return <div className="p-4 max-w-2xl mx-auto text-white space-y-6">
    <h1 className="text-2xl font-bold flex items-center space-x-2"><Users className="w-6 h-6 text-indigo-400" /><span>Communities</span></h1>
    {error && <p className="text-xs text-red-400">{error}</p>}
    <form onSubmit={handleCreatePost} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3"><textarea value={newPostText} onChange={(event) => setNewPostText(event.target.value)} placeholder="What's happening in your community?" className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-sm text-white resize-none h-20" /><button type="submit" className="bg-indigo-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl">Post Update</button></form>
    <div className="space-y-4">{posts.map((post) => <article key={post.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3"><div className="flex items-center space-x-3"><img src={post.avatar} alt={post.author} className="w-10 h-10 rounded-full" /><div><h4 className="font-semibold text-sm">{post.author}</h4><span className="text-[10px] text-indigo-400">{post.community}</span></div></div><p className="text-sm text-slate-200">{post.content}</p><div className="flex items-center space-x-6 text-slate-400 text-xs"><button onClick={() => handleLike(post)} className={`flex items-center space-x-1.5 ${post.isLiked ? 'text-red-400' : ''}`}><Heart className="w-4 h-4" fill={post.isLiked ? 'currentColor' : 'none'} /><span>{post.likes}</span></button><span className="flex items-center space-x-1.5"><MessageCircle className="w-4 h-4" /><span>{post.comments}</span></span><button><Share2 className="w-4 h-4" /></button></div><div className="flex gap-2"><input value={commentText[post.id] || ''} onChange={(event) => setCommentText((current) => ({ ...current, [post.id]: event.target.value }))} placeholder="Write a comment" className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs" /><button onClick={() => handleComment(post.id)} className="bg-indigo-600 rounded-xl px-3 text-xs">Send</button></div></article>)}{!posts.length && <p className="text-sm text-slate-400">No posts yet. Create the first update.</p>}</div>
  </div>;
}
