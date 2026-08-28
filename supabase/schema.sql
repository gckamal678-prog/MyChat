create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

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

create policy "Authenticated users can view rooms"
  on public.rooms for select to authenticated using (true);

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
  created_at timestamptz not null default now()
);

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

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

create policy "Authenticated users can view posts" on public.posts for select to authenticated using (true);
create policy "Users can create their own posts" on public.posts for insert to authenticated with check (auth.uid() = user_id);
create policy "Authenticated users can view post comments" on public.post_comments for select to authenticated using (true);
create policy "Users can create their own post comments" on public.post_comments for insert to authenticated with check (auth.uid() = user_id);
create policy "Authenticated users can view post likes" on public.post_likes for select to authenticated using (true);
create policy "Users can manage their post likes" on public.post_likes for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Authenticated users can view reels" on public.reels for select to authenticated using (true);
create policy "Users can create their own reels" on public.reels for insert to authenticated with check (auth.uid() = user_id);
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
