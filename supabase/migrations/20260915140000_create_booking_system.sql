CREATE TABLE public.availability_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  is_open boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT availability_slots_starts_on_hour
    CHECK (date_trunc('hour', starts_at AT TIME ZONE 'UTC') = starts_at AT TIME ZONE 'UTC'),
  CONSTRAINT availability_slots_exactly_one_hour
    CHECK (ends_at = starts_at + interval '1 hour'),
  CONSTRAINT availability_slots_unique_start UNIQUE (starts_at)
);

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  confirmation_code text NOT NULL DEFAULT upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)),
  slot_id uuid NOT NULL REFERENCES public.availability_slots(id) ON DELETE RESTRICT,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  status text NOT NULL DEFAULT 'confirmed',
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bookings_confirmation_code_unique UNIQUE (confirmation_code),
  CONSTRAINT bookings_customer_name_length CHECK (char_length(customer_name) BETWEEN 1 AND 80),
  CONSTRAINT bookings_customer_email_length CHECK (char_length(customer_email) BETWEEN 3 AND 254),
  CONSTRAINT bookings_status_check CHECK (status IN ('confirmed', 'cancelled')),
  CONSTRAINT bookings_cancelled_state_check CHECK (
    (status = 'confirmed' AND cancelled_at IS NULL)
    OR (status = 'cancelled' AND cancelled_at IS NOT NULL)
  )
);

CREATE UNIQUE INDEX bookings_one_confirmed_per_slot
  ON public.bookings(slot_id)
  WHERE status = 'confirmed';

CREATE INDEX availability_slots_starts_at_idx
  ON public.availability_slots(starts_at);

CREATE INDEX bookings_created_at_idx
  ON public.bookings(created_at DESC);

CREATE TABLE public.booking_rate_limits (
  key_hash text PRIMARY KEY,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  attempt_count integer NOT NULL DEFAULT 1 CHECK (attempt_count > 0),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER availability_slots_set_updated_at
BEFORE UPDATE ON public.availability_slots
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER bookings_set_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.consume_booking_rate_limit(
  p_key_hash text,
  p_limit integer DEFAULT 8,
  p_window_seconds integer DEFAULT 3600
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_count integer;
BEGIN
  IF char_length(p_key_hash) < 32 OR p_limit < 1 OR p_window_seconds < 1 THEN
    RETURN false;
  END IF;

  INSERT INTO public.booking_rate_limits AS limits (
    key_hash,
    window_started_at,
    attempt_count,
    last_seen_at
  )
  VALUES (p_key_hash, now(), 1, now())
  ON CONFLICT (key_hash) DO UPDATE
  SET
    attempt_count = CASE
      WHEN limits.window_started_at <= now() - make_interval(secs => p_window_seconds)
        THEN 1
      ELSE limits.attempt_count + 1
    END,
    window_started_at = CASE
      WHEN limits.window_started_at <= now() - make_interval(secs => p_window_seconds)
        THEN now()
      ELSE limits.window_started_at
    END,
    last_seen_at = now()
  RETURNING attempt_count INTO v_count;

  DELETE FROM public.booking_rate_limits
  WHERE last_seen_at < now() - interval '7 days';

  RETURN v_count <= p_limit;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_booking(
  p_slot_id uuid,
  p_customer_name text,
  p_customer_email text
)
RETURNS TABLE (
  booking_id uuid,
  confirmation_code text,
  slot_starts_at timestamptz,
  slot_ends_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_slot public.availability_slots%ROWTYPE;
  v_booking public.bookings%ROWTYPE;
  v_name text := btrim(p_customer_name);
  v_email text := lower(btrim(p_customer_email));
BEGIN
  IF char_length(v_name) < 1 OR char_length(v_name) > 80 THEN
    RAISE EXCEPTION 'invalid_customer_name' USING ERRCODE = '22023';
  END IF;

  IF char_length(v_email) < 3
    OR char_length(v_email) > 254
    OR v_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  THEN
    RAISE EXCEPTION 'invalid_customer_email' USING ERRCODE = '22023';
  END IF;

  SELECT *
  INTO v_slot
  FROM public.availability_slots
  WHERE id = p_slot_id
  FOR UPDATE;

  IF NOT FOUND OR NOT v_slot.is_open OR v_slot.starts_at <= now() THEN
    RAISE EXCEPTION 'slot_unavailable' USING ERRCODE = 'P0001';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.bookings
    WHERE slot_id = p_slot_id AND status = 'confirmed'
  ) THEN
    RAISE EXCEPTION 'slot_unavailable' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.bookings (slot_id, customer_name, customer_email)
  VALUES (p_slot_id, v_name, v_email)
  RETURNING * INTO v_booking;

  RETURN QUERY SELECT
    v_booking.id,
    v_booking.confirmation_code,
    v_slot.starts_at,
    v_slot.ends_at;
END;
$$;

REVOKE ALL ON TABLE public.availability_slots FROM anon, authenticated;
REVOKE ALL ON TABLE public.bookings FROM anon, authenticated;
REVOKE ALL ON TABLE public.booking_rate_limits FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.consume_booking_rate_limit(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_booking(uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_booking_rate_limit(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.create_booking(uuid, text, text) TO service_role;
