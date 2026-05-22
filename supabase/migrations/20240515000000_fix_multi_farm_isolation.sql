-- Fix multi-farm isolation by ensuring all tables have farm_id and proper RLS

-- 1. Create weighings table if it doesn't exist
CREATE TABLE IF NOT EXISTS weighings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cattle_id UUID REFERENCES cattle(id) ON DELETE CASCADE NOT NULL,
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE NOT NULL,
  weight_kg DECIMAL(10,2) NOT NULL,
  classification TEXT,
  gmd DECIMAL(10,2),
  gpv DECIMAL(10,2),
  notes TEXT,
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Ensure columns exist in weighings if table already existed
DO $$
BEGIN
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

-- 2. Create reproduction_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS reproduction_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cattle_id UUID REFERENCES cattle(id) ON DELETE CASCADE NOT NULL,
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL, -- e.g., 'insemination', 'mating', 'diagnosis'
  status TEXT,
  semen_bull TEXT,
  male_bull_tag TEXT,
  notes TEXT,
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create semen_tank table if it doesn't exist
CREATE TABLE IF NOT EXISTS semen_tank (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE NOT NULL,
  bull_name TEXT NOT NULL,
  bull_breed TEXT,
  dose_count INTEGER DEFAULT 0 NOT NULL,
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Add farm_id to health_records if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='health_records' AND column_name='farm_id') THEN
        ALTER TABLE health_records ADD COLUMN farm_id UUID REFERENCES farms(id) ON DELETE CASCADE;
        -- Try to populate farm_id from cattle table
        UPDATE health_records h SET farm_id = c.farm_id FROM cattle c WHERE h.cattle_id = c.id;
        ALTER TABLE health_records ALTER COLUMN farm_id SET NOT NULL;
    END IF;
END $$;

-- 4. Add electronic_id to cattle table if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cattle' AND column_name='electronic_id') THEN
        ALTER TABLE cattle ADD COLUMN electronic_id TEXT;
        CREATE INDEX IF NOT EXISTS idx_cattle_electronic_id ON cattle(electronic_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cattle' AND column_name='category') THEN
        ALTER TABLE cattle ADD COLUMN category TEXT;
    END IF;
    
    -- Relax gender constraint to allow M/F
    ALTER TABLE cattle DROP CONSTRAINT IF EXISTS cattle_gender_check;
    ALTER TABLE cattle ADD CONSTRAINT cattle_gender_check CHECK (gender IN ('Male', 'Female', 'M', 'F', 'Macho', 'Fêmea'));
END $$;

-- 5. Enable RLS
ALTER TABLE weighings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reproduction_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE semen_tank ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies (Isolation by Farm)
-- Policies for weighings
DROP POLICY IF EXISTS "Users can view weighings of their farms" ON weighings;
CREATE POLICY "Users can view weighings of their farms" ON weighings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = weighings.farm_id AND farms.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert weighings to their farms" ON weighings;
CREATE POLICY "Users can insert weighings to their farms" ON weighings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = farm_id AND farms.owner_id = auth.uid())
  );

-- Policies for reproduction_events
DROP POLICY IF EXISTS "Users can view repro events of their farms" ON reproduction_events;
CREATE POLICY "Users can view repro events of their farms" ON reproduction_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = reproduction_events.farm_id AND farms.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert repro events to their farms" ON reproduction_events;
CREATE POLICY "Users can insert repro events to their farms" ON reproduction_events
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = farm_id AND farms.owner_id = auth.uid())
  );

-- Policies for semen_tank
DROP POLICY IF EXISTS "Users can view semen of their farms" ON semen_tank;
CREATE POLICY "Users can view semen of their farms" ON semen_tank
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = semen_tank.farm_id AND farms.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can managed semen of their farms" ON semen_tank;
CREATE POLICY "Users can managed semen of their farms" ON semen_tank
  FOR ALL USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = farm_id AND farms.owner_id = auth.uid())
  );

-- Update health_records policies for farm isolation
DROP POLICY IF EXISTS "Users can view health records of their farms" ON health_records;
CREATE POLICY "Users can view health records of their farms" ON health_records
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = health_records.farm_id AND farms.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert health records to their farms" ON health_records;
CREATE POLICY "Users can insert health records to their farms" ON health_records
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = farm_id AND farms.owner_id = auth.uid())
  );

-- 7. Add Indexes
CREATE INDEX IF NOT EXISTS idx_weighings_farm_id ON weighings(farm_id);
CREATE INDEX IF NOT EXISTS idx_repro_farm_id ON reproduction_events(farm_id);
CREATE INDEX IF NOT EXISTS idx_semen_farm_id ON semen_tank(farm_id);
CREATE INDEX IF NOT EXISTS idx_health_farm_id ON health_records(farm_id);
