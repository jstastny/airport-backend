// Detect if we should use Vercel's postgres client
// Check if connecting to Vercel's database by looking for vercel-storage.com in the connection string
const isVercelDb =
  process.env.VERCEL === '1' ||
  (process.env.POSTGRES_URL && process.env.POSTGRES_URL.includes('vercel-storage.com'));

// Type definition for SQL function
type SQLFunction = {
  (strings: TemplateStringsArray, ...values: any[]): Promise<{ rows: any[]; rowCount: number | null }>;
  query: (queryText: string, params?: any[]) => Promise<{ rows: any[]; rowCount: number | null }>;
};

let sqlInstance: SQLFunction;

if (isVercelDb) {
  // Connecting to Vercel Postgres: Use @vercel/postgres
  const { sql: vercelSql } = require('@vercel/postgres');
  sqlInstance = vercelSql as SQLFunction;
} else {
  // Local development with local Postgres: Use pg library
  const { Pool } = require('pg');
  let pool: any = null;

  function getPool() {
    if (!pool) {
      pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
      });
    }
    return pool;
  }

  // Create SQL tagged template function
  const localSql = async (strings: TemplateStringsArray, ...values: any[]) => {
    const client = getPool();

    // Build the query by replacing template placeholders with $1, $2, etc.
    let query = strings[0];
    const params: any[] = [];

    for (let i = 0; i < values.length; i++) {
      query += `$${i + 1}` + strings[i + 1];
      params.push(values[i]);
    }

    const result = await client.query(query, params);
    return { rows: result.rows, rowCount: result.rowCount };
  };

  // Add query method for non-template queries
  localSql.query = async (queryText: string, params?: any[]) => {
    const client = getPool();
    const result = await client.query(queryText, params || []);
    return { rows: result.rows, rowCount: result.rowCount };
  };

  sqlInstance = localSql as SQLFunction;
}

export const sql = sqlInstance;

export interface Airport {
  id: number;
  icao_code: string;
  iata_code?: string;
  name: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  elevation?: number;
  timezone?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AirportSuggestion {
  id: number;
  icao_code: string;
  iata_code?: string;
  name: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  elevation?: number;
  timezone?: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: Date;
  reviewed_at?: Date;
  reviewed_by?: string;
}

export interface AirportInput {
  icao_code: string;
  iata_code?: string;
  name: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  elevation?: number;
  timezone?: string;
}
