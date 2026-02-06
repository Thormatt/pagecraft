-- Pages table
CREATE TABLE pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  html_content text NOT NULL,
  prompt_history jsonb DEFAULT '[]'::jsonb,
  view_count integer DEFAULT 0,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Page views table
CREATE TABLE page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  viewed_at timestamptz DEFAULT now(),
  referrer text,
  user_agent text
);

-- Indexes
CREATE INDEX idx_pages_user_id ON pages(user_id);
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_is_published ON pages(is_published);
CREATE INDEX idx_page_views_page_id ON page_views(page_id);
CREATE INDEX idx_page_views_viewed_at ON page_views(viewed_at);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Atomic view count increment
CREATE OR REPLACE FUNCTION increment_view_count(p_page_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE pages SET view_count = view_count + 1 WHERE id = p_page_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Daily views aggregation
CREATE OR REPLACE FUNCTION get_page_views_by_day(p_page_id uuid, p_days integer DEFAULT 30)
RETURNS TABLE(day date, count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(pv.viewed_at) AS day,
    COUNT(*)::bigint AS count
  FROM page_views pv
  WHERE pv.page_id = p_page_id
    AND pv.viewed_at >= now() - (p_days || ' days')::interval
  GROUP BY DATE(pv.viewed_at)
  ORDER BY day;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Pages: owners can do everything
CREATE POLICY "Users can select own pages"
  ON pages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pages"
  ON pages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pages"
  ON pages FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pages"
  ON pages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Pages: anyone can read published pages (for public serving)
CREATE POLICY "Anyone can read published pages"
  ON pages FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

-- Page views: anyone can insert
CREATE POLICY "Anyone can insert page views"
  ON page_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Page views: owners can read views for their pages
CREATE POLICY "Owners can read page views"
  ON page_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pages
      WHERE pages.id = page_views.page_id
        AND pages.user_id = auth.uid()
    )
  );
