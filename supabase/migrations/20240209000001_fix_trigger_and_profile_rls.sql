-- Fix trigger: only swallow duplicate-key errors (expected if profile exists),
-- re-raise everything else so signup fails visibly on unexpected errors.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, nothing to do
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add INSERT policy so the profile API recovery path can create missing profiles.
-- Without this, the fallback INSERT in GET /api/profile silently fails via RLS.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON profiles FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
END
$$;
