import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });
  const token = request.headers.authorization?.replace('Bearer ', '');
  const { userId, title, body, url = '/' } = request.body || {};
  if (!token || !userId || !title || !body) return response.status(400).json({ error: 'Missing notification fields' });

  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return response.status(401).json({ error: 'Unauthorized' });

  const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: subscriptions, error: queryError } = await admin.from('push_subscriptions').select('id, endpoint, subscription').eq('user_id', userId);
  if (queryError) return response.status(500).json({ error: queryError.message });

  webpush.setVapidDetails(`mailto:${process.env.VAPID_EMAIL || 'admin@mychat.app'}`, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
  const payload = JSON.stringify({ title, body, url });
  const results = await Promise.allSettled((subscriptions || []).map((item) => webpush.sendNotification(item.subscription, payload)));
  const expired = (subscriptions || []).filter((_item, index) => results[index].status === 'rejected' && [404, 410].includes(results[index].reason?.statusCode));
  if (expired.length) await admin.from('push_subscriptions').delete().in('id', expired.map((item) => item.id));
  return response.status(200).json({ sent: results.filter((result) => result.status === 'fulfilled').length });
}
