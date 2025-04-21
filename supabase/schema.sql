-- Drop existing tables if they exist
DROP TABLE IF EXISTS event_registrations CASCADE;
DROP TABLE IF EXISTS events CASCADE;

-- Create events table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  organizer TEXT NOT NULL,
  image_url TEXT,
  capacity INTEGER NOT NULL,
  registered_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CHECK (end_time > start_time)
);

-- Create event_registrations table
CREATE TABLE event_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(event_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to events" ON events;
DROP POLICY IF EXISTS "Allow authenticated users to create events" ON events;
DROP POLICY IF EXISTS "Allow authenticated users to update events" ON events;
DROP POLICY IF EXISTS "Allow authenticated users to delete events" ON events;
DROP POLICY IF EXISTS "Allow users to read their own registrations" ON event_registrations;
DROP POLICY IF EXISTS "Allow users to create their own registrations" ON event_registrations;
DROP POLICY IF EXISTS "Allow users to delete their own registrations" ON event_registrations;

-- Create policies for events table
CREATE POLICY "Enable read access for all users" ON events
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON events
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON events
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for event_registrations table
CREATE POLICY "Enable read access for all users" ON event_registrations
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON event_registrations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON event_registrations
  FOR DELETE USING (auth.role() = 'authenticated');

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS update_registered_count() CASCADE;

-- Create function to update registered_count
CREATE OR REPLACE FUNCTION update_registered_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE events
    SET registered_count = registered_count + 1
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE events
    SET registered_count = registered_count - 1
    WHERE id = OLD.event_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for event_registrations
CREATE TRIGGER update_registered_count_trigger
  AFTER INSERT OR DELETE ON event_registrations
  FOR EACH ROW EXECUTE FUNCTION update_registered_count(); 