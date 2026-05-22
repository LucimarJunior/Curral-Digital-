-- Create farms table
CREATE TABLE farms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  corporate_name TEXT,
  document_number TEXT, -- CNPJ or CPF
  zip_code TEXT,
  address TEXT,
  state TEXT,
  city TEXT,
  total_area DECIMAL(10,2),
  productive_area DECIMAL(10,2),
  pasture_count INTEGER,
  static_capacity INTEGER,
  manager_name TEXT,
  phone TEXT,
  email TEXT,
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;

-- Policies for farms
CREATE POLICY "Users can view their own farms" ON farms
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own farms" ON farms
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own farms" ON farms
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own farms" ON farms
  FOR DELETE USING (auth.uid() = owner_id);
