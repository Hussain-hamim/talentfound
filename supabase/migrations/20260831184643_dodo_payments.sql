-- Provider-agnostic payment columns (Dodo replaces Stripe)

alter table public.profiles
  add column if not exists dodo_customer_id text;

alter table public.profiles
  drop column if exists stripe_customer_id;

alter table public.profiles
  drop column if exists stripe_connect_id;

alter table public.bids
  rename column stripe_session_id to payment_session_id;

alter table public.bids
  rename column stripe_payment_intent_id to payment_id;

alter table public.ledger
  rename column stripe_transfer_id to payout_transfer_id;

alter table public.processed_stripe_events
  rename to processed_payment_events;;
