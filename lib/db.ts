import { Pool } from 'pg';

// Create a custom SQL tagged template that works with both pg and Vercel
let pool: Pool | null = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
    });
  }
  return pool;
}

// SQL tagged template function that mimics @vercel/postgres behavior
export const sql = async (strings: TemplateStringsArray, ...values: any[]) => {
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

// Also support the query method for non-template queries
sql.query = async (queryText: string, params?: any[]) => {
  const client = getPool();
  const result = await client.query(queryText, params || []);
  return { rows: result.rows, rowCount: result.rowCount };
};

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
