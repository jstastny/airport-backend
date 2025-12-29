import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../lib/db';
import type { AirportInput } from '../../lib/db';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data: AirportInput = req.body;

    // Validate required fields
    if (!data.icao_code || !data.name) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: icao_code and name are required'
      });
    }

    // Validate ICAO code format (should be 4 characters)
    if (data.icao_code.length !== 4) {
      return res.status(400).json({
        success: false,
        error: 'ICAO code must be exactly 4 characters'
      });
    }

    // Validate IATA code format if provided (should be 3 characters)
    if (data.iata_code && data.iata_code.length !== 3) {
      return res.status(400).json({
        success: false,
        error: 'IATA code must be exactly 3 characters'
      });
    }

    // Insert suggestion into database
    const result = await sql`
      INSERT INTO airport_suggestions (
        icao_code,
        iata_code,
        name,
        city,
        country,
        latitude,
        longitude,
        elevation,
        timezone,
        status
      ) VALUES (
        ${data.icao_code.toUpperCase()},
        ${data.iata_code?.toUpperCase() || null},
        ${data.name},
        ${data.city || null},
        ${data.country || null},
        ${data.latitude || null},
        ${data.longitude || null},
        ${data.elevation || null},
        ${data.timezone || null},
        'pending'
      )
      RETURNING id
    `;

    return res.status(201).json({
      success: true,
      message: 'Airport suggestion submitted successfully',
      suggestion_id: result.rows[0].id
    });
  } catch (error: any) {
    console.error('Error submitting suggestion:', error);

    // Check for unique constraint violation
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'An airport suggestion with this ICAO code already exists'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
