import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../lib/db';
import { createHash } from 'crypto';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the most recent update timestamp for cache validation
    const lastModifiedResult = await sql`
      SELECT MAX(updated_at) as last_modified
      FROM airports
    `;

    const lastModified = lastModifiedResult.rows[0]?.last_modified;

    if (lastModified) {
      const lastModifiedDate = new Date(lastModified);
      const lastModifiedString = lastModifiedDate.toUTCString();

      // Generate ETag from timestamp
      const etag = `"${createHash('md5').update(lastModified.toString()).digest('hex')}"`;

      // Check If-None-Match (ETag)
      const ifNoneMatch = req.headers['if-none-match'];
      if (ifNoneMatch === etag) {
        res.setHeader('ETag', etag);
        res.setHeader('Last-Modified', lastModifiedString);
        res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400');
        return res.status(304).end();
      }

      // Check If-Modified-Since
      const ifModifiedSince = req.headers['if-modified-since'];
      if (ifModifiedSince) {
        const ifModifiedSinceDate = new Date(ifModifiedSince);
        if (lastModifiedDate <= ifModifiedSinceDate) {
          res.setHeader('ETag', etag);
          res.setHeader('Last-Modified', lastModifiedString);
          res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400');
          return res.status(304).end();
        }
      }

      // Set cache headers
      res.setHeader('ETag', etag);
      res.setHeader('Last-Modified', lastModifiedString);
      res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400');
    }

    // Fetch all airports
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
