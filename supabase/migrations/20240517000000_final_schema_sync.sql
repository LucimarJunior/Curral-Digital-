-- Final Schema Sync to ensure all import fields are supported
-- Covers: IDV, IDE, Peso, GMD, GPV, Classificar, Data, Hora, Sexo, Categoria, Observações

DO $$
BEGIN
    -- 1. CATTLE TABLE (IDV, IDE, Sexo, Categoria, Pasto)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cattle' AND column_name='farm_id') THEN
        ALTER TABLE cattle ADD COLUMN farm_id UUID REFERENCES farms(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cattle' AND column_name='electronic_id') THEN
        ALTER TABLE cattle ADD COLUMN electronic_id TEXT;
        CREATE INDEX IF NOT EXISTS idx_cattle_electronic_id ON cattle(electronic_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cattle' AND column_name='category') THEN
        ALTER TABLE cattle ADD COLUMN category TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cattle' AND column_name='pasture') THEN
        ALTER TABLE cattle ADD COLUMN pasture TEXT;
    END IF;
    
    -- Ensure gender constraint is flexible
    ALTER TABLE cattle DROP CONSTRAINT IF EXISTS cattle_gender_check;
    ALTER TABLE cattle ADD CONSTRAINT cattle_gender_check CHECK (gender IN ('Male', 'Female', 'M', 'F', 'Macho', 'Fêmea'));

    -- 2. WEIGHINGS TABLE (Peso, GMD, GPV, Classificar, Data/Hora, Observações)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='weighings' AND column_name='farm_id') THEN
        ALTER TABLE weighings ADD COLUMN farm_id UUID REFERENCES farms(id) ON DELETE CASCADE;
        -- Try to populate from cattle
        UPDATE weighings w SET farm_id = c.farm_id FROM cattle c WHERE w.cattle_id = c.id;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='weighings' AND column_name='classification') THEN
        ALTER TABLE weighings ADD COLUMN classification TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='weighings' AND column_name='gmd') THEN
        ALTER TABLE weighings ADD COLUMN gmd DECIMAL(10,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='weighings' AND column_name='gpv') THEN
        ALTER TABLE weighings ADD COLUMN gpv DECIMAL(10,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='weighings' AND column_name='notes') THEN
        ALTER TABLE weighings ADD COLUMN notes TEXT;
    END IF;

    -- 3. REPRODUCTION_EVENTS
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reproduction_events' AND column_name='farm_id') THEN
        ALTER TABLE reproduction_events ADD COLUMN farm_id UUID REFERENCES farms(id) ON DELETE CASCADE;
        UPDATE reproduction_events r SET farm_id = c.farm_id FROM cattle c WHERE r.cattle_id = c.id;
    END IF;

    -- 4. HEALTH_RECORDS
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='health_records' AND column_name='farm_id') THEN
        ALTER TABLE health_records ADD COLUMN farm_id UUID REFERENCES farms(id) ON DELETE CASCADE;
        UPDATE health_records h SET farm_id = c.farm_id FROM cattle c WHERE h.cattle_id = c.id;
    END IF;

END $$;

-- Update RLS Policies to ensure farm isolation is everywhere
ALTER TABLE weighings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reproduction_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view weighings of their farms" ON weighings;
CREATE POLICY "Users can view weighings of their farms" ON weighings
  FOR SELECT USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = weighings.farm_id AND farms.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert weighings to their farms" ON weighings;
CREATE POLICY "Users can insert weighings to their farms" ON weighings
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM farms WHERE farms.id = farm_id AND farms.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update weighings of their farms" ON weighings;
CREATE POLICY "Users can update weighings of their farms" ON weighings
  FOR UPDATE USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = weighings.farm_id AND farms.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view repro events of their farms" ON reproduction_events;
CREATE POLICY "Users can view repro events of their farms" ON reproduction_events
  FOR SELECT USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = reproduction_events.farm_id AND farms.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert repro events to their farms" ON reproduction_events;
CREATE POLICY "Users can insert repro events to their farms" ON reproduction_events
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM farms WHERE farms.id = farm_id AND farms.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view health records of their farms" ON health_records;
CREATE POLICY "Users can view health records of their farms" ON health_records
  FOR SELECT USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = health_records.farm_id AND farms.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert health records to their farms" ON health_records;
CREATE POLICY "Users can insert health records to their farms" ON health_records
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM farms WHERE farms.id = farm_id AND farms.owner_id = auth.uid()));
