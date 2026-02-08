-- Add optional expiration timestamp to pages
-- NULL = no expiration (default), non-null = UTC timestamp after which page returns 410 Gone
alter table pages add column expires_at timestamptz;
