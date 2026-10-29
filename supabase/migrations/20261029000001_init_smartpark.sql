-- ====================================================================
-- SMARTPARK CAMPUS - DATABASE MIGRATION
-- Database: PostgreSQL 15+ / Supabase
-- Timezone: Asia/Kolkata (IST)
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CUSTOM TYPES & DOMAINS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'faculty', 'staff', 'security_guard', 'parking_manager', 'super_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE account_status AS ENUM ('active', 'pending_approval', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE vehicle_type AS ENUM ('two_wheeler', 'four_wheeler', 'electric_vehicle', 'accessible');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE space_category AS ENUM ('two_wheeler', 'four_wheeler', 'electric_vehicle', 'accessible', 'faculty_reserved', 'staff_reserved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'expired', 'no_show');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE session_status AS ENUM ('active', 'completed', 'overstayed', 'discrepancy_resolved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE gate_event_type AS ENUM ('entry_scan', 'exit_scan', 'manual_entry', 'manual_exit', 'rejection');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE validation_result_type AS ENUM ('success', 'denied', 'warning');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    campus_id TEXT UNIQUE NOT NULL,
    department TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    phone_number TEXT,
    account_status account_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

-- 4. VEHICLES TABLE
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    registration_number TEXT NOT NULL UNIQUE,
    vehicle_type vehicle_type NOT NULL DEFAULT 'four_wheeler',
    make_model TEXT,
    color TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

-- 5. PARKING ZONES TABLE
CREATE TABLE IF NOT EXISTS public.parking_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    opening_time TIME NOT NULL DEFAULT '06:00:00',
    closing_time TIME NOT NULL DEFAULT '23:00:00',
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    total_capacity INTEGER NOT NULL DEFAULT 50 CHECK (total_capacity >= 0),
    usable_capacity INTEGER NOT NULL DEFAULT 50 CHECK (usable_capacity >= 0 AND usable_capacity <= total_capacity),
    allowed_vehicle_types TEXT[] NOT NULL DEFAULT ARRAY['two_wheeler', 'four_wheeler', 'electric_vehicle', 'accessible'],
    is_active BOOLEAN NOT NULL DEFAULT true,
    hourly_rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

-- 6. PARKING SPACES TABLE
CREATE TABLE IF NOT EXISTS public.parking_spaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id UUID NOT NULL REFERENCES public.parking_zones(id) ON DELETE CASCADE,
    space_number TEXT NOT NULL,
    space_type space_category NOT NULL DEFAULT 'four_wheeler',
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_out_of_service BOOLEAN NOT NULL DEFAULT false,
    map_x INTEGER NOT NULL DEFAULT 0,
    map_y INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    CONSTRAINT uq_zone_space UNIQUE (zone_id, space_number)
);

-- 7. RESERVATIONS TABLE
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_code TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
    zone_id UUID NOT NULL REFERENCES public.parking_zones(id) ON DELETE RESTRICT,
    space_id UUID REFERENCES public.parking_spaces(id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status reservation_status NOT NULL DEFAULT 'confirmed',
    qr_token_hash TEXT NOT NULL,
    checked_in_at TIMESTAMPTZ,
    checked_out_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    CONSTRAINT chk_time_window CHECK (end_time > start_time)
);

-- 8. PARKING SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.parking_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
    zone_id UUID NOT NULL REFERENCES public.parking_zones(id) ON DELETE RESTRICT,
    space_id UUID REFERENCES public.parking_spaces(id) ON DELETE SET NULL,
    entry_time TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    exit_time TIMESTAMPTZ,
    entry_guard_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    exit_guard_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    entry_gate TEXT NOT NULL DEFAULT 'Gate 1 (North)',
    exit_gate TEXT,
    status session_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

-- 9. GATE EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.gate_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gate_identifier TEXT NOT NULL,
    zone_id UUID REFERENCES public.parking_zones(id) ON DELETE SET NULL,
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
    vehicle_registration TEXT NOT NULL,
    guard_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    event_type gate_event_type NOT NULL,
    validation_result validation_result_type NOT NULL,
    rejection_reason TEXT,
    event_time TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    raw_payload JSONB DEFAULT '{}'::jsonb
);

-- 10. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'urgent')),
    link TEXT,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

-- 11. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

-- 12. CAMPUS SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.campus_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    campus_name TEXT NOT NULL DEFAULT 'Indian Institute of Technology & Management Campus',
    campus_code TEXT NOT NULL DEFAULT 'IITM-CAMPUS',
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    max_booking_hours INTEGER NOT NULL DEFAULT 8,
    advance_booking_days INTEGER NOT NULL DEFAULT 3,
    cancellation_cutoff_minutes INTEGER NOT NULL DEFAULT 15,
    grace_period_minutes INTEGER NOT NULL DEFAULT 20,
    require_vehicle_verification BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

-- 13. INDEXES FOR HIGH-PERFORMANCE QUERIES
CREATE INDEX IF NOT EXISTS idx_reservations_user ON public.reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_zone ON public.reservations(zone_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_window ON public.reservations(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON public.parking_sessions(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_sessions_zone_active ON public.parking_sessions(zone_id, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_sessions_vehicle ON public.parking_sessions(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_spaces_zone ON public.parking_spaces(zone_id);
CREATE INDEX IF NOT EXISTS idx_gate_events_time ON public.gate_events(event_time DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_time ON public.audit_logs(created_at DESC);

-- 14. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gate_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin/manager
CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('security_guard', 'parking_manager', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_manager_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('parking_manager', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users can read their own, managers/guards can read all
CREATE POLICY "Profiles read" ON public.profiles FOR SELECT
    USING (id = auth.uid() OR public.is_staff_or_admin());

CREATE POLICY "Profiles update own" ON public.profiles FOR UPDATE
    USING (id = auth.uid() OR public.is_manager_or_admin());

-- Vehicles: Users read/write their own; staff read all
CREATE POLICY "Vehicles select" ON public.vehicles FOR SELECT
    USING (owner_id = auth.uid() OR public.is_staff_or_admin());

CREATE POLICY "Vehicles insert own" ON public.vehicles FOR INSERT
    WITH CHECK (owner_id = auth.uid() OR public.is_manager_or_admin());

CREATE POLICY "Vehicles update own" ON public.vehicles FOR UPDATE
    USING (owner_id = auth.uid() OR public.is_manager_or_admin());

CREATE POLICY "Vehicles delete own" ON public.vehicles FOR DELETE
    USING (owner_id = auth.uid() OR public.is_manager_or_admin());

-- Parking zones & spaces: Publicly readable for active ones, editable by managers
CREATE POLICY "Zones select" ON public.parking_zones FOR SELECT
    USING (true);

CREATE POLICY "Zones manage" ON public.parking_zones FOR ALL
    USING (public.is_manager_or_admin());

CREATE POLICY "Spaces select" ON public.parking_spaces FOR SELECT
    USING (true);

CREATE POLICY "Spaces manage" ON public.parking_spaces FOR ALL
    USING (public.is_manager_or_admin());

-- Reservations: Users see own; staff see all
CREATE POLICY "Reservations select" ON public.reservations FOR SELECT
    USING (user_id = auth.uid() OR public.is_staff_or_admin());

CREATE POLICY "Reservations insert" ON public.reservations FOR INSERT
    WITH CHECK (user_id = auth.uid() OR public.is_staff_or_admin());

CREATE POLICY "Reservations update" ON public.reservations FOR UPDATE
    USING (user_id = auth.uid() OR public.is_staff_or_admin());

-- Sessions: User sees their vehicle sessions, staff sees all
CREATE POLICY "Sessions select" ON public.parking_sessions FOR SELECT
    USING (
        public.is_staff_or_admin() OR
        EXISTS (SELECT 1 FROM public.vehicles WHERE id = parking_sessions.vehicle_id AND owner_id = auth.uid())
    );

CREATE POLICY "Sessions staff manage" ON public.parking_sessions FOR ALL
    USING (public.is_staff_or_admin());

-- Gate events: Staff only
CREATE POLICY "Gate events staff" ON public.gate_events FOR ALL
    USING (public.is_staff_or_admin());

-- Notifications: User only
CREATE POLICY "Notifications own" ON public.notifications FOR ALL
    USING (user_id = auth.uid());

-- Audit logs: Managers/Admins only
CREATE POLICY "Audit logs admin" ON public.audit_logs FOR SELECT
    USING (public.is_manager_or_admin());

-- Settings: Readable by all, writable by managers
CREATE POLICY "Settings select" ON public.campus_settings FOR SELECT
    USING (true);

CREATE POLICY "Settings manage" ON public.campus_settings FOR ALL
    USING (public.is_manager_or_admin());

-- 15. CONCURRENCY-SAFE STORED PROCEDURES

-- Concurrency safe reservation creation with Row Locking
CREATE OR REPLACE FUNCTION public.create_safe_reservation(
    p_user_id UUID,
    p_vehicle_id UUID,
    p_zone_id UUID,
    p_space_id UUID,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_reservation_code TEXT,
    p_qr_hash TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_zone public.parking_zones%ROWTYPE;
    v_usable_cap INTEGER;
    v_overlapping_count INTEGER;
    v_active_sessions_count INTEGER;
    v_new_reservation_id UUID;
    v_space_conflict INTEGER;
BEGIN
    -- 1. Lock the zone row to serialize concurrent reservations for this zone
    SELECT * INTO v_zone FROM public.parking_zones WHERE id = p_zone_id FOR UPDATE;
    IF NOT FOUND OR NOT v_zone.is_active THEN
        RETURN jsonb_build_object('success', false, 'error', 'Zone is not available or inactive');
    END IF;

    -- 2. If specific space is requested, check space conflict
    IF p_space_id IS NOT NULL THEN
        SELECT COUNT(*) INTO v_space_conflict
        FROM public.reservations
        WHERE space_id = p_space_id
          AND status IN ('confirmed', 'checked_in')
          AND (start_time, end_time) OVERLAPS (p_start_time, p_end_time);

        IF v_space_conflict > 0 THEN
            RETURN jsonb_build_object('success', false, 'error', 'Selected parking bay is already reserved for this time window');
        END IF;
    END IF;

    -- 3. Calculate overlapping reservations during the window
    SELECT COUNT(*) INTO v_overlapping_count
    FROM public.reservations
    WHERE zone_id = p_zone_id
      AND status IN ('confirmed', 'checked_in')
      AND (start_time, end_time) OVERLAPS (p_start_time, p_end_time);

    -- 4. Calculate currently active sessions (if window is starting now)
    SELECT COUNT(*) INTO v_active_sessions_count
    FROM public.parking_sessions
    WHERE zone_id = p_zone_id
      AND status = 'active';

    v_usable_cap := v_zone.usable_capacity;

    -- Prevent overselling capacity
    IF v_overlapping_count >= v_usable_cap THEN
        RETURN jsonb_build_object('success', false, 'error', 'Capacity full: No available slots for the selected time window');
    END IF;

    -- 5. Insert reservation safely
    INSERT INTO public.reservations (
        reservation_code,
        user_id,
        vehicle_id,
        zone_id,
        space_id,
        start_time,
        end_time,
        status,
        qr_token_hash
    ) VALUES (
        p_reservation_code,
        p_user_id,
        p_vehicle_id,
        p_zone_id,
        p_space_id,
        p_start_time,
        p_end_time,
        'confirmed',
        p_qr_hash
    ) RETURNING id INTO v_new_reservation_id;

    -- 6. Insert audit log
    INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, details)
    VALUES (
        p_user_id,
        'CREATE_RESERVATION',
        'reservation',
        v_new_reservation_id::text,
        jsonb_build_object('code', p_reservation_code, 'zone', v_zone.name, 'start', p_start_time, 'end', p_end_time)
    );

    RETURN jsonb_build_object('success', true, 'reservation_id', v_new_reservation_id, 'code', p_reservation_code);
END;
$$;

-- Atomic Gate Check-In Function
CREATE OR REPLACE FUNCTION public.process_gate_entry(
    p_guard_id UUID,
    p_gate_identifier TEXT,
    p_reservation_code TEXT,
    p_registration_number TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_res public.reservations%ROWTYPE;
    v_vehicle public.vehicles%ROWTYPE;
    v_zone public.parking_zones%ROWTYPE;
    v_active_session_id UUID;
    v_now TIMESTAMPTZ := timezone('Asia/Kolkata', now());
    v_new_session_id UUID;
BEGIN
    -- 1. Find reservation by code
    SELECT * INTO v_res FROM public.reservations WHERE reservation_code = p_reservation_code;
    IF NOT FOUND THEN
        INSERT INTO public.gate_events (gate_identifier, vehicle_registration, guard_id, event_type, validation_result, rejection_reason)
        VALUES (p_gate_identifier, COALESCE(p_registration_number, 'UNKNOWN'), p_guard_id, 'rejection', 'denied', 'Invalid reservation code');
        RETURN jsonb_build_object('success', false, 'error', 'Invalid reservation code');
    END IF;

    -- 2. Check reservation status
    IF v_res.status != 'confirmed' THEN
        INSERT INTO public.gate_events (gate_identifier, zone_id, reservation_id, vehicle_registration, guard_id, event_type, validation_result, rejection_reason)
        VALUES (p_gate_identifier, v_res.zone_id, v_res.id, COALESCE(p_registration_number, 'UNKNOWN'), p_guard_id, 'rejection', 'denied', 'Reservation is ' || v_res.status::text);
        RETURN jsonb_build_object('success', false, 'error', 'Reservation is not active (' || v_res.status::text || ')');
    END IF;

    -- 3. Check time window (allow 30 minutes early, or within booking window)
    IF v_now < (v_res.start_time - INTERVAL '30 minutes') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Too early for check-in. Entry permitted from ' || to_char(v_res.start_time - INTERVAL '30 minutes', 'HH12:MI AM'));
    END IF;

    IF v_now > v_res.end_time THEN
        RETURN jsonb_build_object('success', false, 'error', 'Reservation has expired. Booking ended at ' || to_char(v_res.end_time, 'HH12:MI AM'));
    END IF;

    -- 4. Check if vehicle is already parked inside
    SELECT id INTO v_active_session_id
    FROM public.parking_sessions
    WHERE vehicle_id = v_res.vehicle_id AND status = 'active';

    IF v_active_session_id IS NOT NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Vehicle already has an active parking session inside');
    END IF;

    -- 5. Mark reservation checked_in
    UPDATE public.reservations
    SET status = 'checked_in', checked_in_at = v_now, updated_at = v_now
    WHERE id = v_res.id;

    -- 6. Create parking session
    INSERT INTO public.parking_sessions (
        reservation_id,
        vehicle_id,
        zone_id,
        space_id,
        entry_time,
        entry_guard_id,
        entry_gate,
        status
    ) VALUES (
        v_res.id,
        v_res.vehicle_id,
        v_res.zone_id,
        v_res.space_id,
        v_now,
        p_guard_id,
        p_gate_identifier,
        'active'
    ) RETURNING id INTO v_new_session_id;

    -- 7. Log gate event
    INSERT INTO public.gate_events (
        gate_identifier,
        zone_id,
        reservation_id,
        vehicle_registration,
        guard_id,
        event_type,
        validation_result
    ) VALUES (
        p_gate_identifier,
        v_res.zone_id,
        v_res.id,
        COALESCE(p_registration_number, 'CHECKED_IN'),
        p_guard_id,
        'entry_scan',
        'success'
    );

    RETURN jsonb_build_object('success', true, 'session_id', v_new_session_id, 'message', 'Entry authorized. Welcome to Campus!');
END;
$$;

-- Atomic Gate Check-Out Function
CREATE OR REPLACE FUNCTION public.process_gate_exit(
    p_guard_id UUID,
    p_gate_identifier TEXT,
    p_registration_number TEXT,
    p_reservation_code TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_session public.parking_sessions%ROWTYPE;
    v_vehicle_id UUID;
    v_now TIMESTAMPTZ := timezone('Asia/Kolkata', now());
BEGIN
    -- 1. Find active session either by vehicle plate or reservation code
    IF p_reservation_code IS NOT NULL THEN
        SELECT s.* INTO v_session
        FROM public.parking_sessions s
        JOIN public.reservations r ON r.id = s.reservation_id
        WHERE r.reservation_code = p_reservation_code AND s.status = 'active';
    END IF;

    IF v_session.id IS NULL AND p_registration_number IS NOT NULL THEN
        SELECT s.* INTO v_session
        FROM public.parking_sessions s
        JOIN public.vehicles v ON v.id = s.vehicle_id
        WHERE v.registration_number ILIKE p_registration_number AND s.status = 'active';
    END IF;

    IF v_session.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'No active parking session found for this vehicle/pass');
    END IF;

    -- 2. Mark session completed
    UPDATE public.parking_sessions
    SET status = 'completed', exit_time = v_now, exit_guard_id = p_guard_id, exit_gate = p_gate_identifier, updated_at = v_now
    WHERE id = v_session.id;

    -- 3. If tied to reservation, mark completed
    IF v_session.reservation_id IS NOT NULL THEN
        UPDATE public.reservations
        SET status = 'completed', checked_out_at = v_now, updated_at = v_now
        WHERE id = v_session.reservation_id;
    END IF;

    -- 4. Record gate event
    INSERT INTO public.gate_events (
        gate_identifier,
        zone_id,
        reservation_id,
        vehicle_registration,
        guard_id,
        event_type,
        validation_result
    ) VALUES (
        p_gate_identifier,
        v_session.zone_id,
        v_session.reservation_id,
        COALESCE(p_registration_number, 'CHECKED_OUT'),
        p_guard_id,
        'exit_scan',
        'success'
    );

    RETURN jsonb_build_object('success', true, 'session_id', v_session.id, 'duration_minutes', ROUND(EXTRACT(EPOCH FROM (v_now - v_session.entry_time)) / 60));
END;
$$;
