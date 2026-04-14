import * as SQLite from 'expo-sqlite';

import { bootstrapSettings, schemaStatements } from '@/db/schema';

const DATABASE_NAME = 'aasra.db';
const db = SQLite.openDatabaseSync(DATABASE_NAME);

export const database = db;

export const initializeDatabase = async () => {
  db.withTransactionSync(() => {
    db.execSync('PRAGMA journal_mode = WAL;');
    db.execSync('CREATE TABLE IF NOT EXISTS __migrations (version INTEGER PRIMARY KEY NOT NULL);');
    const current = db.getFirstSync<{ version: number }>('SELECT MAX(version) as version FROM __migrations;');
    const version = current?.version ?? 0;

    if (version < 1) {
      schemaStatements.forEach((statement) => db.execSync(statement));

      bootstrapSettings.forEach((setting) => {
        db.runSync(
          `INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES (?, ?, ?)`,
          [setting.key, setting.value, new Date().toISOString()],
        );
      });

      db.runSync('INSERT INTO __migrations (version) VALUES (?)', [1]);
    }

    if (version < 2) {
      db.execSync(
        `CREATE TABLE IF NOT EXISTS sms_log (
          id TEXT PRIMARY KEY NOT NULL,
          contact_id TEXT,
          contact_name TEXT NOT NULL,
          phone_number TEXT NOT NULL,
          message_body TEXT NOT NULL,
          direction TEXT NOT NULL DEFAULT 'outgoing',
          delivery_status TEXT NOT NULL DEFAULT 'unknown',
          created_at TEXT NOT NULL
        );`,
      );
      db.execSync('CREATE INDEX IF NOT EXISTS idx_sms_log_created_at ON sms_log(created_at DESC);');
      db.runSync(
        `INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES (?, ?, ?)`,
        ['callEmergencyNumberInSos', '0', new Date().toISOString()],
      );
      db.runSync('INSERT INTO __migrations (version) VALUES (?)', [2]);
    }
  });
};
