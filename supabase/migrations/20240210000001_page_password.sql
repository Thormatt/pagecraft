-- Add optional password protection for published pages
-- NULL = public page, non-null = SHA-256 hash of password
alter table pages add column page_password text;
