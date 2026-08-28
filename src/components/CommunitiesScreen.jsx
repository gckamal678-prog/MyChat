import React, { useEffect, useState } from 'react';
import { Users, Heart, MessageCircle, Share2, Trash2 } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

export default function Communities() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [comments, setComments] = useState({});
  const [error, setError] = useState('');

  const loadPosts = async () => {
    const { data, error: queryError } = await supabase.from('posts').select('id, user_id, community, content, created_at, post_comments(id, user_id, content), post_likes(user_id)').order('created_at', { ascending: false });
    if (queryError) { setError(queryError.message); return; }
    const ids = [...new Set((data || []).flatMap((post) => [post.user_id, ...(post.post_comments || []).map((item) => item.user_id), ...(post.post_likes || []).map((item) => item.user_id)]))];
    const { data: profileRows } = await supabase.from('profiles').select('id, display_name, avatar_url').in('id', ids);
    const profiles = new Map((profileRows || []).map((profile) => [profile.id, profile]));
    setPosts((data || []).map((post) => ({ ...post, author: profiles.get(post.user_id)?.display_name || 'MyChat User', avatar: profiles.get(post.user_id)?.avatar_url || 'https://ui-avatars.com/api/?name=MyChat&background=4f46e5&color=fff', likeNames: (post.post_likes || []).map((like) => profiles.get(like.user_id)?.display_name || 'MyChat User'), commentRows: (post.post_comments || []).map((comment) => `${profiles.get(comment.user_id)?.display_name || 'MyChat User'}: ${comment.content}`), liked: (post.post_likes || []).some((like) => like.user_id === user.id) })));
  };

  useEffect(() => {
    loadPosts();
    const channel = supabase.channel('community-live').on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, loadPosts).on('postgres_changes', { event: '*', schema: 'public', table: 'post_comments' }, loadPosts).on('postgres_changes', { event: '*', schema: 'public', table: 'post_likes' }, loadPosts).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user.id]);

  const createPost = async (event) => { event.preventDefault(); if (!text.trim()) return; const { error: insertError } = await supabase.from('posts').insert({ user_id: user.id, content: text.trim() }); if (insertError) setError(insertError.message); else setText(''); };
  const toggleLike = async (post) => { const result = post.liked ? await supabase.from('post_likes').delete().match({ post_id: post.id, user_id: user.id }) : await supabase.from('post_likes').insert({ post_id: post.id, user_id: user.id }); if (result.error) setError(result.error.message); };
  const addComment = async (postId) => { const content = comments[postId]?.trim(); if (!content) return; const { error: insertError } = await supabase.from('post_comments').insert({ post_id: postId, user_id: user.id, content }); if (insertError) setError(insertError.message); else setComments((current) => ({ ...current, [postId]: '' })); };
  const deletePost = async (postId) => { if (!window.confirm('Delete this post? Select OK for Yes or Cancel for No.')) return; const { error: deleteError } = await supabase.from('posts').delete().eq('id', postId).eq('user_id', user.id); if (deleteError) setError(deleteError.message); else setPosts((current) => current.filter((post) => post.id !== postId)); };

  return <div className="p-4 max-w-2xl mx-auto text-white space-y-6"><h1 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6 text-indigo-400" />Communities</h1>{error && <p className="text-xs text-red-400">{error}</p>}<form onSubmit={createPost} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3"><textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="What's happening in your community?" className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-sm text-white resize-none h-20" /><button className="bg-indigo-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl">Post Update</button></form><div className="space-y-4">{posts.map((post) => <article key={post.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3"><div className="flex items-center gap-3"><img src={post.avatar} alt={post.author} className="w-10 h-10 rounded-full" /><div className="flex-1"><h4 className="font-semibold text-sm">{post.author}</h4><span className="text-[10px] text-indigo-400">{post.community}</span></div>{post.user_id === user.id && <button onClick={() => deletePost(post.id)} aria-label="Delete post" className="text-red-300"><Trash2 className="w-4 h-4" /></button>}</div><p className="text-sm text-slate-200">{post.content}</p><div className="flex gap-6 text-xs text-slate-400"><button onClick={() => toggleLike(post)} className={post.liked ? 'text-red-400' : ''}><Heart className="inline w-4 h-4 mr-1" fill={post.liked ? 'currentColor' : 'none'} />{post.post_likes?.length || 0}</button><span><MessageCircle className="inline w-4 h-4 mr-1" />{post.post_comments?.length || 0}</span><button><Share2 className="inline w-4 h-4" /></button></div><p className="text-[11px] text-slate-400">Liked by: {post.likeNames.join(', ') || 'Nobody yet'}</p>{post.commentRows.map((comment) => <p key={comment} className="text-[11px] text-slate-300">{comment}</p>)}<div className="flex gap-2"><input value={comments[post.id] || ''} onChange={(event) => setComments((current) => ({ ...current, [post.id]: event.target.value }))} placeholder="Write a comment" className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs" /><button onClick={() => addComment(post.id)} className="bg-indigo-600 rounded-xl px-3 text-xs">Send</button></div></article>)}{!posts.length && <p className="text-sm text-slate-400">No posts yet.</p>}</div></div>;
}
