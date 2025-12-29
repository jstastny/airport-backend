import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    name: 'Airport Backend API',
    version: '1.0.0',
    endpoints: {
      public: {
        'GET /api/airports': 'Get all approved airports',
        'POST /api/airports/suggest': 'Submit airport suggestion'
      },
      admin: {
        'GET /api/airports/pending': 'Get pending suggestions (requires auth)',
        'POST /api/airports/approve': 'Approve/reject suggestion (requires auth)',
        'POST /api/airports/create': 'Create airport directly (requires auth)'
      }
    },
    documentation: 'https://github.com/jstastny/airport-backend'
  });
}
