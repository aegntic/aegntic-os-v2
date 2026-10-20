-- Additive: no application/legacy signups tables are changed or copied.
CREATE TABLE IF NOT EXISTS pavilion_waitlist_signups (
  email TEXT PRIMARY KEY,
  interest TEXT NOT NULL CHECK (interest IN ('follow', 'build', 'both')),
  consent_at TEXT NOT NULL,
  removal_hash TEXT UNIQUE NOT NULL
);
CREATE TABLE IF NOT EXISTS pavilion_waitlist_rates (
  ip_hash TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS pavilion_waitlist_rates_expiry
  ON pavilion_waitlist_rates(expires_at);
