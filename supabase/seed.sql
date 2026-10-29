-- ====================================================================
-- SMARTPARK CAMPUS - SEED DATA
-- Default campus seed data for IITM Campus (Pune / Asia/Kolkata)
-- ====================================================================

-- 1. CAMPUS SETTINGS
INSERT INTO public.campus_settings (id, campus_name, campus_code, timezone, max_booking_hours, advance_booking_days, cancellation_cutoff_minutes, grace_period_minutes, require_vehicle_verification)
VALUES ('default', 'Indian Institute of Technology & Management (IITM)', 'IITM-CAMPUS', 'Asia/Kolkata', 8, 3, 15, 20, false)
ON CONFLICT (id) DO UPDATE SET campus_name = EXCLUDED.campus_name;

-- 2. PARKING ZONES
INSERT INTO public.parking_zones (id, code, name, description, location, latitude, longitude, opening_time, closing_time, total_capacity, usable_capacity, allowed_vehicle_types, is_active, hourly_rate)
VALUES 
  ('11111111-1111-1111-1111-111111111101', 'ZONE-A', 'North Academic Quad', 'Closest to Computer Science, AI Labs & Central Auditorium', 'North Gate, Sector 1', 18.5204, 73.8567, '06:00:00', '23:00:00', 40, 38, ARRAY['four_wheeler', 'electric_vehicle', 'accessible'], true, 0.00),
  ('11111111-1111-1111-1111-111111111102', 'ZONE-B', 'Tech Park & Research Hub', 'Dedicated 4W and EV Fast Charging Bays near Incubation Center', 'East Avenue, Sector 3', 18.5218, 73.8592, '06:00:00', '23:59:00', 35, 35, ARRAY['four_wheeler', 'electric_vehicle'], true, 0.00),
  ('11111111-1111-1111-1111-111111111103', 'ZONE-C', 'Main Library Plaza', 'Mixed zone for 2-wheelers and 4-wheelers with shaded solar canopy', 'Central Spine, Sector 2', 18.5195, 73.8540, '07:00:00', '22:30:00', 60, 58, ARRAY['two_wheeler', 'four_wheeler', 'accessible'], true, 0.00),
  ('11111111-1111-1111-1111-111111111104', 'ZONE-D', 'Faculty & Staff Enclave', 'Reserved zone for Senior Faculty, Department Heads & Guest Lecturers', 'Admin Block, West Gate', 18.5180, 73.8520, '06:30:00', '22:00:00', 30, 30, ARRAY['four_wheeler', 'accessible'], true, 0.00),
  ('11111111-1111-1111-1111-111111111105', 'ZONE-E', 'Sports Complex & Arena', 'Large 2-wheeler and open capacity zone for student events and gym', 'South Campus Gate 4', 18.5165, 73.8580, '05:30:00', '22:00:00', 80, 80, ARRAY['two_wheeler'], true, 0.00)
ON CONFLICT (id) DO NOTHING;

-- 3. PARKING SPACES FOR ZONE A (North Academic Quad)
INSERT INTO public.parking_spaces (zone_id, space_number, space_type, is_active, is_out_of_service, map_x, map_y) VALUES
  ('11111111-1111-1111-1111-111111111101', 'A-01', 'accessible', true, false, 1, 1),
  ('11111111-1111-1111-1111-111111111101', 'A-02', 'accessible', true, false, 2, 1),
  ('11111111-1111-1111-1111-111111111101', 'A-03', 'electric_vehicle', true, false, 3, 1),
  ('11111111-1111-1111-1111-111111111101', 'A-04', 'electric_vehicle', true, false, 4, 1),
  ('11111111-1111-1111-1111-111111111101', 'A-05', 'four_wheeler', true, false, 5, 1),
  ('11111111-1111-1111-1111-111111111101', 'A-06', 'four_wheeler', true, false, 6, 1),
  ('11111111-1111-1111-1111-111111111101', 'A-07', 'four_wheeler', true, false, 7, 1),
  ('11111111-1111-1111-1111-111111111101', 'A-08', 'four_wheeler', true, false, 8, 1),
  ('11111111-1111-1111-1111-111111111101', 'A-09', 'four_wheeler', true, false, 9, 1),
  ('11111111-1111-1111-1111-111111111101', 'A-10', 'four_wheeler', true, false, 10, 1),
  ('11111111-1111-1111-1111-111111111101', 'A-11', 'four_wheeler', true, true, 1, 2), -- out of service example
  ('11111111-1111-1111-1111-111111111101', 'A-12', 'four_wheeler', true, true, 2, 2), -- out of service example
  ('11111111-1111-1111-1111-111111111101', 'A-13', 'four_wheeler', true, false, 3, 2),
  ('11111111-1111-1111-1111-111111111101', 'A-14', 'four_wheeler', true, false, 4, 2),
  ('11111111-1111-1111-1111-111111111101', 'A-15', 'four_wheeler', true, false, 5, 2)
ON CONFLICT (zone_id, space_number) DO NOTHING;

-- 4. PARKING SPACES FOR ZONE B (Tech Park)
INSERT INTO public.parking_spaces (zone_id, space_number, space_type, is_active, is_out_of_service, map_x, map_y) VALUES
  ('11111111-1111-1111-1111-111111111102', 'B-EV-01', 'electric_vehicle', true, false, 1, 1),
  ('11111111-1111-1111-1111-111111111102', 'B-EV-02', 'electric_vehicle', true, false, 2, 1),
  ('11111111-1111-1111-1111-111111111102', 'B-EV-03', 'electric_vehicle', true, false, 3, 1),
  ('11111111-1111-1111-1111-111111111102', 'B-04', 'four_wheeler', true, false, 4, 1),
  ('11111111-1111-1111-1111-111111111102', 'B-05', 'four_wheeler', true, false, 5, 1),
  ('11111111-1111-1111-1111-111111111102', 'B-06', 'four_wheeler', true, false, 6, 1),
  ('11111111-1111-1111-1111-111111111102', 'B-07', 'four_wheeler', true, false, 7, 1),
  ('11111111-1111-1111-1111-111111111102', 'B-08', 'four_wheeler', true, false, 8, 1)
ON CONFLICT (zone_id, space_number) DO NOTHING;
