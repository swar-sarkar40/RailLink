-- Insert sample cargo availability slots for testing
-- Delhi to various cities
INSERT INTO cargo_availability (from_station_id, to_station_id, commodity_category_id, available_date, total_capacity_kg, booked_capacity_kg, price_per_kg) VALUES
-- New Delhi to Mumbai - Food Items
('f4138de4-303e-410b-8355-be3392a2f559', '5edb7efd-3266-44d2-8c90-757593cffe57', '7b5bec98-0056-4e61-9596-2d7706c753b7', CURRENT_DATE, 10000, 0, 3.5),
('f4138de4-303e-410b-8355-be3392a2f559', '5edb7efd-3266-44d2-8c90-757593cffe57', '7b5bec98-0056-4e61-9596-2d7706c753b7', CURRENT_DATE + 1, 8000, 2000, 3.8),
('f4138de4-303e-410b-8355-be3392a2f559', '5edb7efd-3266-44d2-8c90-757593cffe57', '7b5bec98-0056-4e61-9596-2d7706c753b7', CURRENT_DATE + 2, 10000, 5000, 3.5),
('f4138de4-303e-410b-8355-be3392a2f559', '5edb7efd-3266-44d2-8c90-757593cffe57', '7b5bec98-0056-4e61-9596-2d7706c753b7', CURRENT_DATE + 3, 7000, 0, 4.0),
('f4138de4-303e-410b-8355-be3392a2f559', '5edb7efd-3266-44d2-8c90-757593cffe57', '7b5bec98-0056-4e61-9596-2d7706c753b7', CURRENT_DATE + 5, 10000, 9500, 4.2),

-- New Delhi to Chennai - Agricultural Products
('f4138de4-303e-410b-8355-be3392a2f559', '613b0b3b-0251-4c70-a966-ef76fb6e5337', '8f0c8ecf-4d01-41dd-b64f-1b4d89b563fb', CURRENT_DATE, 12000, 3000, 2.7),
('f4138de4-303e-410b-8355-be3392a2f559', '613b0b3b-0251-4c70-a966-ef76fb6e5337', '8f0c8ecf-4d01-41dd-b64f-1b4d89b563fb', CURRENT_DATE + 2, 10000, 0, 2.9),
('f4138de4-303e-410b-8355-be3392a2f559', '613b0b3b-0251-4c70-a966-ef76fb6e5337', '8f0c8ecf-4d01-41dd-b64f-1b4d89b563fb', CURRENT_DATE + 4, 8000, 7500, 3.2),

-- New Delhi to Bangalore - Textiles
('f4138de4-303e-410b-8355-be3392a2f559', 'c8abb430-bddb-4558-a10d-ce017f028f01', '15ddb188-0b4e-45c8-b937-44a6faf1cca1', CURRENT_DATE, 9000, 1000, 4.0),
('f4138de4-303e-410b-8355-be3392a2f559', 'c8abb430-bddb-4558-a10d-ce017f028f01', '15ddb188-0b4e-45c8-b937-44a6faf1cca1', CURRENT_DATE + 1, 10000, 0, 4.2),
('f4138de4-303e-410b-8355-be3392a2f559', 'c8abb430-bddb-4558-a10d-ce017f028f01', '15ddb188-0b4e-45c8-b937-44a6faf1cca1', CURRENT_DATE + 3, 7000, 6000, 4.5),

-- Mumbai to Delhi - Industrial Goods
('5edb7efd-3266-44d2-8c90-757593cffe57', 'f4138de4-303e-410b-8355-be3392a2f559', 'b6654f75-ee2e-4f19-b558-df1174e771bf', CURRENT_DATE, 15000, 5000, 5.0),
('5edb7efd-3266-44d2-8c90-757593cffe57', 'f4138de4-303e-410b-8355-be3392a2f559', 'b6654f75-ee2e-4f19-b558-df1174e771bf', CURRENT_DATE + 2, 12000, 0, 5.5),

-- Bangalore to Chennai - Raw Materials
('c8abb430-bddb-4558-a10d-ce017f028f01', '613b0b3b-0251-4c70-a966-ef76fb6e5337', 'c4fadcd6-7dbf-4096-85bb-838d6b0670a7', CURRENT_DATE, 20000, 10000, 3.0),
('c8abb430-bddb-4558-a10d-ce017f028f01', '613b0b3b-0251-4c70-a966-ef76fb6e5337', 'c4fadcd6-7dbf-4096-85bb-838d6b0670a7', CURRENT_DATE + 1, 18000, 0, 3.2),
('c8abb430-bddb-4558-a10d-ce017f028f01', '613b0b3b-0251-4c70-a966-ef76fb6e5337', 'c4fadcd6-7dbf-4096-85bb-838d6b0670a7', CURRENT_DATE + 4, 15000, 14500, 3.5),

-- Kolkata to Mumbai - Food Items
('812cce7d-ace7-4cc2-86f8-a2ad18093005', '5edb7efd-3266-44d2-8c90-757593cffe57', '7b5bec98-0056-4e61-9596-2d7706c753b7', CURRENT_DATE, 11000, 2000, 3.8),
('812cce7d-ace7-4cc2-86f8-a2ad18093005', '5edb7efd-3266-44d2-8c90-757593cffe57', '7b5bec98-0056-4e61-9596-2d7706c753b7', CURRENT_DATE + 3, 10000, 0, 4.0)
ON CONFLICT DO NOTHING;