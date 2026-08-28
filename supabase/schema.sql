create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'MyChat User',
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  receiver_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  unique (sender_id, receiver_id)
);

create table if not exists public.friendships (
  user_id uuid not null references auth.users(id) on delete cascade,
  friend_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id),
  check (user_id <> friend_id)
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email, 'MyChat User')) on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

insert into public.rooms (name)
select 'MyChat General'
where not exists (select 1 from public.rooms);

alter table public.rooms enable row level security;
alter table public.messages enable row level security;
alter table public.profiles enable row level security;
alter table public.friend_requests enable row level security;
alter table public.friendships enable row level security;

drop policy if exists "Authenticated users can view rooms" on public.rooms;
drop policy if exists "Authenticated users can view profiles" on public.profiles;
drop policy if exists "Users can view their friend requests" on public.friend_requests;
drop policy if exists "Users can send friend requests" on public.friend_requests;
drop policy if exists "Users can update received requests" on public.friend_requests;
drop policy if exists "Users can view their friendships" on public.friendships;
drop policy if exists "Users can create friendships" on public.friendships;
drop policy if exists "Authenticated users can view messages" on public.messages;
drop policy if exists "Users can send their own messages" on public.messages;
drop policy if exists "Authenticated users can delete rooms" on public.rooms;
create policy "Authenticated users can view rooms"
  on public.rooms for select to authenticated using (true);

create policy "Authenticated users can delete rooms" on public.rooms for delete to authenticated using (true);

create policy "Authenticated users can view profiles" on public.profiles for select to authenticated using (true);
create policy "Users can view their friend requests" on public.friend_requests for select to authenticated using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Users can send friend requests" on public.friend_requests for insert to authenticated with check (auth.uid() = sender_id and sender_id <> receiver_id);
create policy "Users can update received requests" on public.friend_requests for update to authenticated using (auth.uid() = receiver_id) with check (auth.uid() = receiver_id);
create policy "Users can view their friendships" on public.friendships for select to authenticated using (auth.uid() = user_id or auth.uid() = friend_id);
create policy "Users can create friendships" on public.friendships for insert to authenticated with check (auth.uid() = user_id);

create policy "Authenticated users can view messages"
  on public.messages for select to authenticated using (true);

create policy "Users can send their own messages"
  on public.messages for insert to authenticated with check (auth.uid() = user_id);

alter table public.messages replica identity full;

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages') then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  community text not null default 'MyChat Developers',
  content text not null,
  media_url text,
  media_type text check (media_type in ('image', 'video', 'gif')),
  created_at timestamptz not null default now()
);

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  parent_id uuid references public.post_comments(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.posts add column if not exists media_url text;
alter table public.posts add column if not exists media_type text;
alter table public.post_comments add column if not exists parent_id uuid references public.post_comments(id) on delete cascade;

create table if not exists public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.reels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  caption text not null,
  video_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.reel_comments (
  id uuid primary key default gen_random_uuid(),
  reel_id uuid not null references public.reels(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.reel_likes (
  reel_id uuid not null references public.reels(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (reel_id, user_id)
);

create table if not exists public.call_logs (
  id uuid primary key default gen_random_uuid(),
  caller_id uuid not null references auth.users(id) on delete cascade,
  channel text not null,
  mode text not null check (mode in ('audio', 'video')),
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

alter table public.posts enable row level security;
alter table public.post_comments enable row level security;
alter table public.post_likes enable row level security;
alter table public.reels enable row level security;
alter table public.reel_comments enable row level security;
alter table public.reel_likes enable row level security;
alter table public.call_logs enable row level security;

drop policy if exists "Authenticated users can view posts" on public.posts;
drop policy if exists "Users can create their own posts" on public.posts;
drop policy if exists "Users can delete their own posts" on public.posts;
drop policy if exists "Authenticated users can view post comments" on public.post_comments;
drop policy if exists "Users can create their own post comments" on public.post_comments;
drop policy if exists "Authenticated users can view post likes" on public.post_likes;
drop policy if exists "Users can manage their post likes" on public.post_likes;
drop policy if exists "Authenticated users can view reels" on public.reels;
drop policy if exists "Users can create their own reels" on public.reels;
drop policy if exists "Users can delete their own reels" on public.reels;
drop policy if exists "Authenticated users can view reel comments" on public.reel_comments;
drop policy if exists "Users can create their own reel comments" on public.reel_comments;
drop policy if exists "Authenticated users can view reel likes" on public.reel_likes;
drop policy if exists "Users can manage their reel likes" on public.reel_likes;
drop policy if exists "Users can view their call logs" on public.call_logs;
drop policy if exists "Users can create their call logs" on public.call_logs;
create policy "Authenticated users can view posts" on public.posts for select to authenticated using (true);
create policy "Users can create their own posts" on public.posts for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can delete their own posts" on public.posts for delete to authenticated using (auth.uid() = user_id);
create policy "Authenticated users can view post comments" on public.post_comments for select to authenticated using (true);
create policy "Users can create their own post comments" on public.post_comments for insert to authenticated with check (auth.uid() = user_id);
create policy "Authenticated users can view post likes" on public.post_likes for select to authenticated using (true);
create policy "Users can manage their post likes" on public.post_likes for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Authenticated users can view reels" on public.reels for select to authenticated using (true);
create policy "Users can create their own reels" on public.reels for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can delete their own reels" on public.reels for delete to authenticated using (auth.uid() = user_id);
create policy "Authenticated users can view reel comments" on public.reel_comments for select to authenticated using (true);
create policy "Users can create their own reel comments" on public.reel_comments for insert to authenticated with check (auth.uid() = user_id);
create policy "Authenticated users can view reel likes" on public.reel_likes for select to authenticated using (true);
create policy "Users can manage their reel likes" on public.reel_likes for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can view their call logs" on public.call_logs for select to authenticated using (auth.uid() = caller_id);
create policy "Users can create their call logs" on public.call_logs for insert to authenticated with check (auth.uid() = caller_id);

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'posts') then
    alter publication supabase_realtime add table public.posts;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'post_comments') then
    alter publication supabase_realtime add table public.post_comments;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'post_likes') then
    alter publication supabase_realtime add table public.post_likes;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'reels') then
    alter publication supabase_realtime add table public.reels;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'reel_comments') then
    alter publication supabase_realtime add table public.reel_comments;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'reel_likes') then
    alter publication supabase_realtime add table public.reel_likes;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'call_logs') then
    alter publication supabase_realtime add table public.call_logs;
  end if;
end $$;
