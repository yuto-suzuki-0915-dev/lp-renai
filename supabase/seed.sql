-- Local development only: create three one-hour slots for tomorrow in JST.
WITH base AS (
  SELECT date_trunc('day', now() AT TIME ZONE 'Asia/Tokyo')
    + interval '1 day'
    + interval '10 hours' AS local_start
), starts AS (
  SELECT local_start + offset_value AS starts_at_jst
  FROM base
  CROSS JOIN unnest(ARRAY[interval '0 hours', interval '2 hours', interval '4 hours']) AS offset_value
)
INSERT INTO public.availability_slots (starts_at, ends_at)
SELECT
  starts_at_jst AT TIME ZONE 'Asia/Tokyo',
  (starts_at_jst + interval '1 hour') AT TIME ZONE 'Asia/Tokyo'
FROM starts
ON CONFLICT (starts_at) DO NOTHING;
