-- Brand profiles table for storing extracted brand aesthetics
CREATE TABLE brand_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  source_url text NOT NULL,
  logo_url text,
  colors jsonb DEFAULT '[]'::jsonb,     -- ["#1a1a2e", "#ffffff"]
  fonts jsonb DEFAULT '[]'::jsonb,      -- ["Inter", "Georgia"]
  styles jsonb DEFAULT '{}'::jsonb,     -- spacing, border-radius, etc.
  screenshot text,                       -- base64 preview
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Documents table for uploaded content files
CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename text NOT NULL,
  mime_type text NOT NULL,
  file_size integer NOT NULL,
  content text NOT NULL,                 -- extracted plain text
  content_type text NOT NULL,            -- "pdf" | "docx" | "xlsx" | "csv" | "txt"
  created_at timestamptz DEFAULT now()
);

-- Add brand_id reference to pages table
ALTER TABLE pages ADD COLUMN brand_id uuid REFERENCES brand_profiles(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX idx_brand_profiles_user_id ON brand_profiles(user_id);
CREATE INDEX idx_brand_profiles_is_default ON brand_profiles(is_default);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_pages_brand_id ON pages(brand_id);

-- Updated_at trigger for brand_profiles
CREATE TRIGGER brand_profiles_updated_at
  BEFORE UPDATE ON brand_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS Policies for brand_profiles
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own brand profiles"
  ON brand_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own brand profiles"
  ON brand_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brand profiles"
  ON brand_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own brand profiles"
  ON brand_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own documents"
  ON documents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Ensure only one default brand per user
CREATE OR REPLACE FUNCTION ensure_single_default_brand()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE brand_profiles
    SET is_default = false
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_default_brand_trigger
  BEFORE INSERT OR UPDATE ON brand_profiles
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_brand();
