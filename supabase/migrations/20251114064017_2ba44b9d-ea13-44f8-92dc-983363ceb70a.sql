-- Insert cargo availability slots for various routes
-- Note: available_capacity_kg is a generated column, so we don't insert it directly

-- NDLS (New Delhi) to CSMT (Mumbai) routes
INSERT INTO public.cargo_availability (
  from_station_id,
  to_station_id,
  commodity_category_id,
  available_date,
  total_capacity_kg,
  booked_capacity_kg,
  price_per_kg
) VALUES
  -- Agricultural Products
  ('f4138de4-303e-410b-8355-be3392a2f559', '5edb7efd-3266-44d2-8c90-757593cffe57', '8f0c8ecf-4d01-41dd-b64f-1b4d89b563fb', CURRENT_DATE, 5000, 1200, 12.50),
  ('f4138de4-303e-410b-8355-be3392a2f559', '5edb7efd-3266-44d2-8c90-757593cffe57', '8f0c8ecf-4d01-41dd-b64f-1b4d89b563fb', CURRENT_DATE + INTERVAL '1 day', 5000, 800, 12.50),
  
  -- Industrial Goods
  ('f4138de4-303e-410b-8355-be3392a2f559', '5edb7efd-3266-44d2-8c90-757593cffe57', 'b6654f75-ee2e-4f19-b558-df1174e771bf', CURRENT_DATE, 8000, 3500, 18.75),
  ('f4138de4-303e-410b-8355-be3392a2f559', '5edb7efd-3266-44d2-8c90-757593cffe57', 'b6654f75-ee2e-4f19-b558-df1174e771bf', CURRENT_DATE + INTERVAL '1 day', 8000, 2000, 18.75),

-- HWH (Howrah) to MAS (Chennai) routes
  -- Textiles
  ('812cce7d-ace7-4cc2-86f8-a2ad18093005', '613b0b3b-0251-4c70-a966-ef76fb6e5337', '15ddb188-0b4e-45c8-b937-44a6faf1cca1', CURRENT_DATE, 6000, 2500, 15.00),
  ('812cce7d-ace7-4cc2-86f8-a2ad18093005', '613b0b3b-0251-4c70-a966-ef76fb6e5337', '15ddb188-0b4e-45c8-b937-44a6faf1cca1', CURRENT_DATE + INTERVAL '2 days', 6000, 1000, 15.00),
  
  -- Food Items
  ('812cce7d-ace7-4cc2-86f8-a2ad18093005', '613b0b3b-0251-4c70-a966-ef76fb6e5337', '7b5bec98-0056-4e61-9596-2d7706c753b7', CURRENT_DATE, 4000, 500, 20.00),

-- BLR (Bangalore) to PUNE (Pune) routes
  -- Raw Materials
  ('c8abb430-bddb-4558-a10d-ce017f028f01', 'ab6b6960-4963-41ba-aa39-01103740e1ba', 'c4fadcd6-7dbf-4096-85bb-838d6b0670a7', CURRENT_DATE, 7000, 4000, 16.50),
  ('c8abb430-bddb-4558-a10d-ce017f028f01', 'ab6b6960-4963-41ba-aa39-01103740e1ba', 'c4fadcd6-7dbf-4096-85bb-838d6b0670a7', CURRENT_DATE + INTERVAL '1 day', 7000, 1500, 16.50),
  
  -- Industrial Goods
  ('c8abb430-bddb-4558-a10d-ce017f028f01', 'ab6b6960-4963-41ba-aa39-01103740e1ba', 'b6654f75-ee2e-4f19-b558-df1174e771bf', CURRENT_DATE, 5000, 500, 17.25),

-- JP (Jaipur) to LKO (Lucknow) routes
  -- Agricultural Products
  ('81f9f8b2-f6c2-41ee-a4c1-80c43e5b68fe', '6d504c40-4421-4b84-8099-d21f7db626af', '8f0c8ecf-4d01-41dd-b64f-1b4d89b563fb', CURRENT_DATE, 4500, 3000, 11.00),
  ('81f9f8b2-f6c2-41ee-a4c1-80c43e5b68fe', '6d504c40-4421-4b84-8099-d21f7db626af', '8f0c8ecf-4d01-41dd-b64f-1b4d89b563fb', CURRENT_DATE + INTERVAL '3 days', 4500, 500, 11.00),

-- Routes with NO availability (fully booked)
  -- CSMT to HWH - No capacity available
  ('5edb7efd-3266-44d2-8c90-757593cffe57', '812cce7d-ace7-4cc2-86f8-a2ad18093005', '8f0c8ecf-4d01-41dd-b64f-1b4d89b563fb', CURRENT_DATE, 3000, 3000, 14.00),
  
  -- MAS to BLR - No capacity available
  ('613b0b3b-0251-4c70-a966-ef76fb6e5337', 'c8abb430-bddb-4558-a10d-ce017f028f01', 'b6654f75-ee2e-4f19-b558-df1174e771bf', CURRENT_DATE, 5000, 5000, 19.00);
