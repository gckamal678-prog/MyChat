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

alter publication supabase_realtime add table public.messages;
