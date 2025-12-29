import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../lib/db';
import { requireAuth } from '../../lib/auth';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication
  if (!requireAuth(req, res)) {
    return;
  }

  try {
    const { id, action } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: id'
      });
    }

    // Default action is 'approve', but can also be 'reject'
    const approvalAction = action || 'approve';

    if (!['approve', 'reject'].includes(approvalAction)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action. Must be "approve" or "reject"'
      });
    }

    // Get the suggestion
    const suggestionResult = await sql`
      SELECT * FROM airport_suggestions
      WHERE id = ${id} AND status = 'pending'
    `;

    if (suggestionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Suggestion not found or already processed'
      });
    }

    const suggestion = suggestionResult.rows[0];

    if (approvalAction === 'approve') {
      // Insert into airports table
      await sql`
        INSERT INTO airports (
          icao_code,
          iata_code,
          name,
          city,
          country,
          latitude,
          longitude,
          elevation,
          timezone
        ) VALUES (
          ${suggestion.icao_code},
          ${suggestion.iata_code},
          ${suggestion.name},
          ${suggestion.city},
          ${suggestion.country},
          ${suggestion.latitude},
          ${suggestion.longitude},
          ${suggestion.elevation},
          ${suggestion.timezone}
        )
      `;

      // Update suggestion status
      await sql`
        UPDATE airport_suggestions
        SET
          status = 'approved',
          reviewed_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `;

      return res.status(200).json({
        success: true,
        message: 'Airport approved and added to database',
        airport: {
          icao_code: suggestion.icao_code,
          name: suggestion.name
        }
      });
    } else {
      // Reject the suggestion
      await sql`
        UPDATE airport_suggestions
        SET
          status = 'rejected',
          reviewed_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `;

      return res.status(200).json({
        success: true,
        message: 'Airport suggestion rejected'
      });
    }
  } catch (error: any) {
    console.error('Error processing suggestion:', error);

    // Check for unique constraint violation
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'An airport with this ICAO code already exists'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
