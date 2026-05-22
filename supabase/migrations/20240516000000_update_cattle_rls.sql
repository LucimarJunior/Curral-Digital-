-- Update cattle RLS to be farm-aware and ensure all columns exist
DO $$
BEGIN
    -- Ensure columns in cattle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cattle' AND column_name='farm_id') THEN
        ALTER TABLE cattle ADD COLUMN farm_id UUID REFERENCES farms(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cattle' AND column_name='electronic_id') THEN
        ALTER TABLE cattle ADD COLUMN electronic_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cattle' AND column_name='category') THEN
        ALTER TABLE cattle ADD COLUMN category TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cattle' AND column_name='pasture') THEN
        ALTER TABLE cattle ADD COLUMN pasture TEXT;
    END IF;

    -- Ensure columns in weighings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='weighings' AND column_name='classification') THEN
        ALTER TABLE weighings ADD COLUMN classification TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='weighings' AND column_name='gmd') THEN
        ALTER TABLE weighings ADD COLUMN gmd DECIMAL(10,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='weighings' AND column_name='gpv') THEN
        ALTER TABLE weighings ADD COLUMN gpv DECIMAL(10,2);
    END IF;
END $$;

-- Update cattle policies
DROP POLICY IF EXISTS "Users can view their own cattle" ON cattle;
CREATE POLICY "Users can view cattle of their farms" ON cattle
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = cattle.farm_id AND farms.owner_id = auth.uid())
    OR owner_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can insert their own cattle" ON cattle;
CREATE POLICY "Users can insert cattle to their farms" ON cattle
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = farm_id AND farms.owner_id = auth.uid())
    OR owner_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can update their own cattle" ON cattle;
CREATE POLICY "Users can update cattle of their farms" ON cattle
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = cattle.farm_id AND farms.owner_id = auth.uid())
    OR owner_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can delete their own cattle" ON cattle;
CREATE POLICY "Users can delete cattle of their farms" ON cattle
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = cattle.farm_id AND farms.owner_id = auth.uid())
    OR owner_id = auth.uid()
  );
