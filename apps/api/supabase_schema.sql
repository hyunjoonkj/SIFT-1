-- Create the 'pages' table
create table public.pages (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  url text not null,
  platform text,
  title text of,
  summary text,
  content text,
  tags text[],
  metadata jsonb
);

-- Enable RLS (Security)
alter table public.pages enable row level security;

-- Allow public read access (so the mobile app can fetch the feed)
create policy "Allow public read access"
  on public.pages for select
  using (true);

-- Note: The Backend uses the SERVICE_ROLE_KEY, which bypasses RLS automatically.
-- So no explicit insert policy is needed for the backend.
