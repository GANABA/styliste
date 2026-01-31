-- Enable Row Level Security on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Stylistes can view their own orders
CREATE POLICY "Stylistes can view own orders"
  ON orders FOR SELECT
  USING (
    styliste_id IN (
      SELECT id FROM stylistes WHERE user_id = auth.uid()
    )
  );

-- Policy: Stylistes can insert their own orders
CREATE POLICY "Stylistes can insert own orders"
  ON orders FOR INSERT
  WITH CHECK (
    styliste_id IN (
      SELECT id FROM stylistes WHERE user_id = auth.uid()
    )
  );

-- Policy: Stylistes can update their own orders
CREATE POLICY "Stylistes can update own orders"
  ON orders FOR UPDATE
  USING (
    styliste_id IN (
      SELECT id FROM stylistes WHERE user_id = auth.uid()
    )
  );

-- Policy: Stylistes can soft delete their own orders (via UPDATE deleted_at)
CREATE POLICY "Stylistes can soft delete own orders"
  ON orders FOR UPDATE
  USING (
    styliste_id IN (
      SELECT id FROM stylistes WHERE user_id = auth.uid()
    )
  );
