-- Fix campgrounds_in_viewport to return lat/lng directly instead of WKB
CREATE OR REPLACE FUNCTION campgrounds_in_viewport(
  min_lng DOUBLE PRECISION,
  min_lat DOUBLE PRECISION, 
  max_lng DOUBLE PRECISION,
  max_lat DOUBLE PRECISION
)
RETURNS TABLE (
  id TEXT,
  name TEXT,
  type TEXT,
  lng DOUBLE PRECISION,
  lat DOUBLE PRECISION,
  address TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  rating NUMERIC,
  features TEXT[],
  coverage_level TEXT,
  opening_hours TEXT,
  fee BOOLEAN,
  capacity INTEGER,
  source TEXT,
  osm_id TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    c.id,
    c.name,
    c.type,
    ST_X(c.location::geometry) as lng,
    ST_Y(c.location::geometry) as lat,
    c.address,
    c.website,
    c.phone,
    c.email,
    c.rating,
    c.features,
    c.coverage_level,
    c.opening_hours,
    c.fee,
    c.capacity,
    c.source,
    c.osm_id,
    c.created_at,
    c.updated_at
  FROM campgrounds c
  WHERE ST_Intersects(
    c.location,
    ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)::geography
  );
$$;