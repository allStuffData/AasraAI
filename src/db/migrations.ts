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
  });
};

