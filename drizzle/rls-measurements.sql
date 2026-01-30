-- Enable Row Level Security on measurements table
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Stylistes can view their own measurements" ON measurements;
DROP POLICY IF EXISTS "Stylistes can insert their own measurements" ON measurements;
DROP POLICY IF EXISTS "Stylistes can update their own measurements" ON measurements;
DROP POLICY IF EXISTS "Stylistes can delete their own measurements" ON measurements;
