-- Airports table (approved airports that are served via API)
CREATE TABLE IF NOT EXISTS airports (
  id SERIAL PRIMARY KEY,
  icao_code VARCHAR(4) UNIQUE NOT NULL,
  iata_code VARCHAR(3),
  name VARCHAR(255) NOT NULL,
  city VARCHAR(255),
  country VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  elevation INTEGER,
  timezone VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Airport suggestions table (pending review)
CREATE TABLE IF NOT EXISTS airport_suggestions (
  id SERIAL PRIMARY KEY,
  icao_code VARCHAR(4) NOT NULL,
  iata_code VARCHAR(3),
  name VARCHAR(255) NOT NULL,
  city VARCHAR(255),
  country VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  elevation INTEGER,
  timezone VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP,
  reviewed_by VARCHAR(255)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_airports_icao ON airports(icao_code);
CREATE INDEX IF NOT EXISTS idx_airports_iata ON airports(iata_code);
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON airport_suggestions(status);
