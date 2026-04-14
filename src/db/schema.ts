export const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY NOT NULL,
    display_name TEXT NOT NULL,
    primary_phone TEXT NOT NULL,
    relationship TEXT,
    photo_uri TEXT,
    aliases_json TEXT NOT NULL DEFAULT '[]',
    is_favorite INTEGER NOT NULL DEFAULT 0,
    is_sos INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS call_log (
    id TEXT PRIMARY KEY NOT NULL,
    contact_id TEXT,
    contact_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    started_at TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    direction TEXT NOT NULL DEFAULT 'outgoing'
  );`,
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS chat_history (
    id TEXT PRIMARY KEY NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'en',
    created_at TEXT NOT NULL
  );`,
  'CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(display_name);',
  'CREATE INDEX IF NOT EXISTS idx_call_log_started_at ON call_log(started_at DESC);',
  'CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at DESC);',
] as const;

export const bootstrapSettings = [
  { key: 'languagePreference', value: 'auto' },
  { key: 'ttsRate', value: '0.95' },
  { key: 'caregiverPin', value: '1234' },
  { key: 'primarySosContactId', value: '' },
] as const;

