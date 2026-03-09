-- PostGIS Extension (falls noch nicht aktiviert)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Campingplätze
CREATE TABLE campgrounds (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('camp_site', 'caravan_site')),
  location GEOGRAPHY(Point, 4326) NOT NULL,
  address TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  rating NUMERIC(2,1),
  features TEXT[] DEFAULT '{}',
  coverage_level TEXT DEFAULT 'none' CHECK (coverage_level IN ('5g', '4g', '3g', 'none')),
  opening_hours TEXT,
  fee BOOLEAN,
  capacity INTEGER,
  source TEXT DEFAULT 'osm',
  osm_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial Index
CREATE INDEX idx_campgrounds_location ON campgrounds USING GIST (location);
CREATE INDEX idx_campgrounds_type ON campgrounds(type);
CREATE INDEX idx_campgrounds_coverage ON campgrounds(coverage_level);

-- Bilder (bis zu 5 pro Campingplatz)
CREATE TABLE campground_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campground_id TEXT NOT NULL REFERENCES campgrounds(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('og_image', 'wikimedia', 'osm', 'google_places', 'manual')),
  alt_text TEXT,
  sort_order INTEGER DEFAULT 0,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_images_campground ON campground_images(campground_id);
CREATE INDEX idx_images_sort ON campground_images(campground_id, sort_order);

-- RPC: Campingplätze im Viewport
CREATE OR REPLACE FUNCTION campgrounds_in_viewport(
  min_lng DOUBLE PRECISION,
  min_lat DOUBLE PRECISION, 
  max_lng DOUBLE PRECISION,
  max_lat DOUBLE PRECISION
)
RETURNS SETOF campgrounds
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM campgrounds
  WHERE ST_Intersects(
    location,
    ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)::geography
  );
$$;

-- RPC: Campingplätze im Umkreis
CREATE OR REPLACE FUNCTION campgrounds_nearby(
  lng DOUBLE PRECISION,
  lat DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 50
)
RETURNS TABLE (
  id TEXT,
  name TEXT,
  type TEXT,
  location GEOGRAPHY,
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
  distance_km DOUBLE PRECISION
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    c.*,
    ST_Distance(c.location, ST_Point(lng, lat)::geography) / 1000 AS distance_km
  FROM campgrounds c
  WHERE ST_DWithin(c.location, ST_Point(lng, lat)::geography, radius_km * 1000)
  ORDER BY distance_km;
$$;

-- Row Level Security (alles public lesbar)
ALTER TABLE campgrounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE campground_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Campgrounds sind öffentlich lesbar" ON campgrounds
  FOR SELECT USING (true);

CREATE POLICY "Images sind öffentlich lesbar" ON campground_images
  FOR SELECT USING (true);