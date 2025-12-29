import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../lib/db';
import { requireAuth } from '../../lib/auth';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication
  if (!requireAuth(req, res)) {
    return;
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
        status,
        submitted_at,
        reviewed_at,
        reviewed_by
      FROM airport_suggestions
      WHERE status = 'pending'
      ORDER BY submitted_at ASC
    `;

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      suggestions: result.rows
    });
  } catch (error) {
    console.error('Error fetching pending suggestions:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
