import { sql } from '../lib/db';
import { readFileSync } from 'fs';
import { join } from 'path';

async function initDatabase() {
  try {
    console.log('Initializing database...');

    const schemaSQL = readFileSync(join(__dirname, '../schema.sql'), 'utf-8');

    // Split by semicolon and execute each statement
    const statements = schemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      await sql.query(statement);
    }

    console.log('Database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();
