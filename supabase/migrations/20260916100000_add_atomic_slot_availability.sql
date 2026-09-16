CREATE OR REPLACE FUNCTION public.set_slot_availability(
  p_slot_id uuid,
  p_is_open boolean
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_slot_id uuid;
BEGIN
  SELECT id
  INTO v_slot_id
  FROM public.availability_slots
  WHERE id = p_slot_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN 'not_found';
  END IF;

  IF NOT p_is_open AND EXISTS (
    SELECT 1
    FROM public.bookings
    WHERE slot_id = p_slot_id
      AND status = 'confirmed'
  ) THEN
    RETURN 'booked';
  END IF;

  UPDATE public.availability_slots
  SET is_open = p_is_open,
      updated_at = now()
  WHERE id = p_slot_id;

  RETURN 'updated';
END;
$$;

REVOKE ALL ON FUNCTION public.set_slot_availability(uuid, boolean)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_slot_availability(uuid, boolean)
TO service_role;
