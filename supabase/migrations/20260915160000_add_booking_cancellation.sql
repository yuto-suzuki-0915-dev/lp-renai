CREATE OR REPLACE FUNCTION public.cancel_booking(p_booking_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_booking public.bookings%ROWTYPE;
BEGIN
  SELECT *
  INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id
  FOR UPDATE;

  IF NOT FOUND OR v_booking.status <> 'confirmed' THEN
    RETURN false;
  END IF;

  UPDATE public.bookings
  SET status = 'cancelled', cancelled_at = now()
  WHERE id = p_booking_id;

  UPDATE public.availability_slots
  SET is_open = true
  WHERE id = v_booking.slot_id;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.cancel_booking(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_booking(uuid) TO service_role;
