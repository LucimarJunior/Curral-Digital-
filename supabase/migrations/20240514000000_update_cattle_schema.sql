-- Update cattle table with missing columns
ALTER TABLE cattle ADD COLUMN IF NOT EXISTS farm_id UUID REFERENCES farms(id) ON DELETE CASCADE;
ALTER TABLE cattle ADD COLUMN IF NOT EXISTS electronic_id TEXT UNIQUE;
ALTER TABLE cattle ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE cattle ADD COLUMN IF NOT EXISTS pasture TEXT;
ALTER TABLE cattle ADD COLUMN IF NOT EXISTS mother_id TEXT;
ALTER TABLE cattle ADD COLUMN IF NOT EXISTS father_id TEXT;

-- If farm_id was added after create, we might need to set it for existing records if possible, 
-- but usually initial data is fine. For safety, let's keep it nullable if existing data exists,
-- or the user can wipe and restart as per the UI instructions.

-- Add index for performance on farm_id
CREATE INDEX IF NOT EXISTS idx_cattle_farm_id ON cattle(farm_id);
