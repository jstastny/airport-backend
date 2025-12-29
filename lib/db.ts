import { sql } from '@vercel/postgres';

export { sql };

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
