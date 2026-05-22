-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  username TEXT UNIQUE,
  farm_name TEXT,
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create cattle table
CREATE TABLE cattle (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tag_number TEXT NOT NULL,
  name TEXT,
  breed TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('Male', 'Female')),
  weight_kg DECIMAL(10,2),
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Sold', 'Deceased', 'Quarantine')),
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(owner_id, tag_number)
);

-- Create health records table
CREATE TABLE health_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cattle_id UUID REFERENCES cattle(id) ON DELETE CASCADE NOT NULL,
  record_date DATE DEFAULT CURRENT_DATE NOT NULL,
  record_type TEXT NOT NULL, -- e.g., 'Vaccination', 'Checkup', 'Treament'
  description TEXT,
  medication TEXT,
  cost DECIMAL(10,2),
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cattle ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policies for cattle
CREATE POLICY "Users can view their own cattle" ON cattle
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own cattle" ON cattle
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own cattle" ON cattle
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own cattle" ON cattle
  FOR DELETE USING (auth.uid() = owner_id);

-- Policies for health_records
CREATE POLICY "Users can view health records of their cattle" ON health_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cattle 
      WHERE cattle.id = health_records.cattle_id 
      AND cattle.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert health records for their cattle" ON health_records
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cattle 
      WHERE cattle.id = health_records.cattle_id 
      AND cattle.owner_id = auth.uid()
    )
  );
