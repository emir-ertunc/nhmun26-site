CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  role TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  email_normalized TEXT NOT NULL,
  phone TEXT NOT NULL,
  school TEXT NOT NULL,
  grade TEXT NOT NULL,
  city TEXT NOT NULL,
  experience TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  review_score INTEGER,
  reviewer_notes TEXT,
  consent_terms INTEGER NOT NULL,
  consent_contact INTEGER NOT NULL,
  ip_hash TEXT,
  user_agent_hash TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_email_role
  ON applications (email_normalized, role);

CREATE INDEX IF NOT EXISTS idx_applications_status
  ON applications (status);

CREATE INDEX IF NOT EXISTS idx_applications_created_at
  ON applications (created_at);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  application_id TEXT,
  event_type TEXT NOT NULL,
  actor TEXT NOT NULL DEFAULT 'system',
  metadata_json TEXT NOT NULL DEFAULT '{}',
  FOREIGN KEY (application_id) REFERENCES applications (id)
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_application_id
  ON audit_logs (application_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
  ON audit_logs (created_at);
