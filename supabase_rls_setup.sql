-- Run this entire script in the SQL Editor of your Supabase Dashboard

-- 1. Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_riders ENABLE ROW LEVEL SECURITY;

-- 2. Policies for `users` table
-- Users can only read their own data, and insert/update their own data
CREATE POLICY "Users can view own profile" 
ON users FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON users FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON users FOR UPDATE 
USING (auth.uid() = id);

-- 3. Policies for `trips` table
-- Anyone authenticated can view trips (to allow searching/joining), but only the driver can create/update/delete.
CREATE POLICY "Anyone can view active trips" 
ON trips FOR SELECT 
USING (true);

CREATE POLICY "Drivers can create trips" 
ON trips FOR INSERT 
WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Drivers can update their trips" 
ON trips FOR UPDATE 
USING (auth.uid() = driver_id);

-- 4. Policies for `trip_riders` table
-- Riders can insert themselves (check in), and view records they are part of.
-- Drivers can also view/update records for trips they own.
CREATE POLICY "Users can view trip riders" 
ON trip_riders FOR SELECT 
USING (
  rider_id = auth.uid() OR 
  trip_id IN (SELECT id FROM trips WHERE driver_id = auth.uid())
);

CREATE POLICY "Users can join trips" 
ON trip_riders FOR INSERT 
WITH CHECK (rider_id = auth.uid());

CREATE POLICY "Drivers and Riders can update status" 
ON trip_riders FOR UPDATE 
USING (
  rider_id = auth.uid() OR 
  trip_id IN (SELECT id FROM trips WHERE driver_id = auth.uid())
);
