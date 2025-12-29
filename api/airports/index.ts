import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../lib/db';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await sql`
      SELECT
        id,
        icao_code,
        iata_code,
        name,
        city,
        country,
        latitude,
        longitude,
        elevation,
        timezone,
        created_at,
        updated_at
      FROM airports
      ORDER BY name ASC
    `;

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      airports: result.rows
    });
  } catch (error) {
    console.error('Error fetching airports:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
