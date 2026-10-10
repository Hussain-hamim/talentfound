-- Exitboard initial schema
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  stripe_customer_id text,
  stripe_connect_id text,
  withdrawable_cents bigint not null default 0 check (withdrawable_cents >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  canonical_url text not null,
  title text not null default '',
  description text not null default '',
  favicon_url text,
  category text not null,
  owner_id uuid not null references public.profiles(id),
  current_bid_cents bigint not null check (current_bid_cents >= 500),
  click_count bigint not null default 0,
  status text not null default 'active' check (status in ('active', 'sold', 'frozen')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists listings_active_canonical_unique
  on public.listings (canonical_url)
  where status = 'active';

create index if not exists listings_active_bid_idx
  on public.listings (current_bid_cents desc)
  where status = 'active';

create index if not exists listings_category_idx
  on public.listings (category)
  where status = 'active';

create table if not exists public.bids (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id),
  payer_id uuid not null references public.profiles(id),
  amount_cents bigint not null,
  type text not null check (type in ('create', 'raise', 'takeover')),
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  previous_owner_id uuid references public.profiles(id),
  seller_credit_cents bigint not null default 0,
  platform_fee_cents bigint not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ledger (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id),
  bid_id uuid references public.bids(id),
  type text not null check (type in ('platform_fee', 'seller_credit', 'withdrawal', 'chargeback_hold')),
  amount_cents bigint not null,
  note text,
  stripe_transfer_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.processed_stripe_events (
  event_id text primary key,
  processed_at timestamptz not null default now()
);

create table if not exists public.site_stats (
  id int primary key default 1 check (id = 1),
  visitor_count bigint not null default 0,
  updated_at timestamptz not null default now()
);

insert into public.site_stats (id, visitor_count) values (1, 0)
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.bids enable row level security;
alter table public.ledger enable row level security;
alter table public.site_stats enable row level security;

create policy "Public read active listings"
  on public.listings for select
  using (status = 'active' or auth.uid() = owner_id);

create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users read own bids"
  on public.bids for select
  using (auth.uid() = payer_id or auth.uid() = previous_owner_id);

create policy "Users read own ledger"
  on public.ledger for select
  using (auth.uid() = profile_id);

create policy "Public read site stats"
  on public.site_stats for select
  using (true);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email, updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();;
