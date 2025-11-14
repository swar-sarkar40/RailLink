-- Add foreign key constraints to cargo_availability table
ALTER TABLE cargo_availability
  ADD CONSTRAINT cargo_availability_from_station_id_fkey 
  FOREIGN KEY (from_station_id) 
  REFERENCES railway_stations(id) 
  ON DELETE CASCADE;

ALTER TABLE cargo_availability
  ADD CONSTRAINT cargo_availability_to_station_id_fkey 
  FOREIGN KEY (to_station_id) 
  REFERENCES railway_stations(id) 
  ON DELETE CASCADE;

ALTER TABLE cargo_availability
  ADD CONSTRAINT cargo_availability_commodity_category_id_fkey 
  FOREIGN KEY (commodity_category_id) 
  REFERENCES commodity_categories(id) 
  ON DELETE CASCADE;