-- Optional Postgres mirror schema (kept for reference; runtime uses MongoDB).
-- Apply this only if you stand up a Postgres analytics replica.

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY,
  supabase_id   TEXT UNIQUE NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  name          TEXT,
  language      TEXT DEFAULT 'en',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
  id            UUID PRIMARY KEY,
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  title         TEXT,
  language      TEXT DEFAULT 'en',
  archived      BOOLEAN DEFAULT FALSE,
  last_stress   INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL,
  text            TEXT NOT NULL,
  language        TEXT DEFAULT 'en',
  emotion         TEXT,
  stress_score    INT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stress_entries (
  id              UUID PRIMARY KEY,
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  score           INT NOT NULL,
  level           TEXT NOT NULL,
  source          TEXT,
  triggered_sos   BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS emotion_logs (
  id              UUID PRIMARY KEY,
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  source          TEXT NOT NULL,
  emotion         TEXT NOT NULL,
  stress_score    INT,
  confidence      REAL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activities (
  id              UUID PRIMARY KEY,
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  kind            TEXT NOT NULL,
  payload         JSONB,
  duration_ms     INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS stress_entries_user_idx ON stress_entries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS emotion_logs_user_idx ON emotion_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS activities_user_idx ON activities(user_id, created_at DESC);
