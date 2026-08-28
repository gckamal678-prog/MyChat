import { supabase } from './supabase';

export async function notifyUser(userId, title, body, url = '/') {
  if (!supabase || !userId) return;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  await fetch('/api/send-push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ userId, title, body, url }),
  });
}
