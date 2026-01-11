-- Supabase SQL Schema for PWV Patrols
-- Run this in your Supabase SQL Editor to create the trailPatrols table

-- Create the trailPatrols table
CREATE TABLE IF NOT EXISTS "trailPatrols" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  trail TEXT NOT NULL,
  partners TEXT,
  trees_cleared TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on date for faster queries
CREATE INDEX IF NOT EXISTS idx_trail_patrols_date ON "trailPatrols"(date);

-- Create an index on trail name for faster lookups
CREATE INDEX IF NOT EXISTS idx_trail_patrols_trail ON "trailPatrols"(trail);

-- Enable Row Level Security (RLS)
ALTER TABLE "trailPatrols" ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows authenticated users to read all patrols
-- Adjust this based on your authentication needs
CREATE POLICY "Allow authenticated users to read patrols"
  ON "trailPatrols" FOR SELECT
  TO authenticated
  USING (true);

-- Create a policy that allows authenticated users to insert patrols
CREATE POLICY "Allow authenticated users to insert patrols"
  ON "trailPatrols" FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create a policy that allows authenticated users to update patrols
CREATE POLICY "Allow authenticated users to update patrols"
  ON "trailPatrols" FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create a policy that allows authenticated users to delete patrols
CREATE POLICY "Allow authenticated users to delete patrols"
  ON "trailPatrols" FOR DELETE
  TO authenticated
  USING (true);

-- Optional: If you want public read access (no auth required)
-- CREATE POLICY "Allow public read access"
--   ON "trailPatrols" FOR SELECT
--   TO public
--   USING (true);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on row update
CREATE TRIGGER update_trail_patrols_updated_at
  BEFORE UPDATE ON "trailPatrols"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Optional: Add a comment to the table
COMMENT ON TABLE "trailPatrols" IS 'PWV (Poudre Wilderness Volunteers) patrol records';
