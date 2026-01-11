-- Fix RLS Policies to Allow Anon Key Inserts
-- Run this in your Supabase SQL Editor if you're getting "row-level security policy" errors

-- Option 1: Allow public inserts (no authentication required)
-- Use this if you want anyone with the anon key to be able to insert

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read patrols" ON "trailPatrols";
DROP POLICY IF EXISTS "Allow authenticated users to insert patrols" ON "trailPatrols";
DROP POLICY IF EXISTS "Allow authenticated users to update patrols" ON "trailPatrols";
DROP POLICY IF EXISTS "Allow authenticated users to delete patrols" ON "trailPatrols";

-- Create new policies that allow anon key access
CREATE POLICY "Allow public read access"
  ON "trailPatrols" FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access"
  ON "trailPatrols" FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access"
  ON "trailPatrols" FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access"
  ON "trailPatrols" FOR DELETE
  TO public
  USING (true);

-- Option 2: If you want to keep authentication but also allow anon key
-- (Uncomment this section and comment out Option 1 if you prefer)

-- CREATE POLICY "Allow anon key insert"
--   ON "trailPatrols" FOR INSERT
--   TO anon
--   WITH CHECK (true);
--
-- CREATE POLICY "Allow anon key read"
--   ON "trailPatrols" FOR SELECT
--   TO anon
--   USING (true);
