CREATE TABLE public.booking_schedule_settings (
  id smallint PRIMARY KEY DEFAULT 1,
  start_hour smallint NOT NULL DEFAULT 10,
  end_hour smallint NOT NULL DEFAULT 20,
  active_weekdays smallint[] NOT NULL DEFAULT ARRAY[1, 2, 3, 4, 5, 6]::smallint[],
  horizon_weeks smallint NOT NULL DEFAULT 8,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT booking_schedule_settings_singleton CHECK (id = 1),
  CONSTRAINT booking_schedule_settings_start_hour CHECK (start_hour BETWEEN 0 AND 23),
  CONSTRAINT booking_schedule_settings_end_hour CHECK (end_hour BETWEEN 1 AND 24),
  CONSTRAINT booking_schedule_settings_hour_range CHECK (
    end_hour > start_hour AND end_hour - start_hour <= 16
  ),
  CONSTRAINT booking_schedule_settings_weekdays CHECK (
    cardinality(active_weekdays) BETWEEN 1 AND 7
    AND active_weekdays <@ ARRAY[0, 1, 2, 3, 4, 5, 6]::smallint[]
  ),
  CONSTRAINT booking_schedule_settings_horizon CHECK (horizon_weeks IN (4, 8))
);

CREATE TRIGGER booking_schedule_settings_set_updated_at
BEFORE UPDATE ON public.booking_schedule_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.booking_schedule_settings ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.booking_schedule_settings FROM anon, authenticated;
