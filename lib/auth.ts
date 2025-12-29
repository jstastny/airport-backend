import type { VercelRequest, VercelResponse } from '@vercel/node';

export function requireAuth(req: VercelRequest, res: VercelResponse): boolean {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      success: false,
      error: 'Missing authorization header'
    });
    return false;
  }

  const token = authHeader.replace('Bearer ', '');
  const adminToken = process.env.ADMIN_API_KEY;

  if (!adminToken) {
    console.error('ADMIN_API_KEY environment variable is not set');
    res.status(500).json({
      success: false,
      error: 'Server configuration error'
    });
    return false;
  }

  if (token !== adminToken) {
    res.status(403).json({
      success: false,
      error: 'Invalid authentication token'
    });
    return false;
  }

  return true;
}
