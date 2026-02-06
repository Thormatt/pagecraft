-- User profiles table with username
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  display_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Username constraints
ALTER TABLE profiles
  ADD CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  ADD CONSTRAINT username_format CHECK (username ~ '^[a-z0-9][a-z0-9_-]*[a-z0-9]$');

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Updated_at trigger for profiles
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Anyone can view profiles (needed for username lookup in URLs)
CREATE POLICY "Anyone can view profiles by username"
  ON profiles FOR SELECT
  TO anon, authenticated
  USING (username IS NOT NULL);

-- Modify pages table: make slug unique per user instead of globally unique
-- First drop the existing unique constraint
ALTER TABLE pages DROP CONSTRAINT IF EXISTS pages_slug_key;

-- Add composite unique constraint (user_id + slug)
ALTER TABLE pages ADD CONSTRAINT pages_user_slug_unique UNIQUE (user_id, slug);

-- Index for username lookups
CREATE INDEX idx_profiles_username ON profiles(username);

-- Function to get profile by username
CREATE OR REPLACE FUNCTION get_profile_by_username(p_username text)
RETURNS TABLE(id uuid, username text, display_name text) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.username, p.display_name
  FROM profiles p
  WHERE p.username = p_username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get page by username and slug
CREATE OR REPLACE FUNCTION get_page_by_username_slug(p_username text, p_slug text)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  title text,
  slug text,
  description text,
  html_content text,
  view_count integer,
  is_published boolean,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pg.id,
    pg.user_id,
    pg.title,
    pg.slug,
    pg.description,
    pg.html_content,
    pg.view_count,
    pg.is_published,
    pg.created_at,
    pg.updated_at
  FROM pages pg
  JOIN profiles pr ON pg.user_id = pr.id
  WHERE pr.username = p_username
    AND pg.slug = p_slug
    AND pg.is_published = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create profiles for existing users
INSERT INTO profiles (id)
SELECT id FROM auth.users
ON CONFLICT (id) DO NOTHING;
