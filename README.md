# Airport Backend API

A Vercel-based backend API for managing airports with a review system. This API allows mobile apps to sync airport data and users to submit suggestions for new airports.

## Features

- **Public API**: Get all approved airports in JSON format
- **User Submissions**: Users can suggest new airports for review
- **Admin Review System**: Review and approve/reject airport suggestions
- **Auto-sync Ready**: Designed for mobile apps to sync on startup/timer

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Hosting**: Vercel Serverless Functions
- **Database**: Vercel Postgres
- **Authentication**: Bearer token for admin endpoints

## Quick Start with Docker

The fastest way to run the project locally is with Docker Compose:

```bash
# Start all services (PostgreSQL + API on port 3333)
docker-compose up -d

# Wait a few seconds for services to initialize, then import sample data
./docker-init.sh

# Or manually import:
docker exec -it airport-api npm run import-airports
```

Your API will be available at **http://localhost:3333**

**Default credentials:**
- Admin API Key: `local-dev-admin-key-change-in-production`
- Database: `airport_db` (user: `airport_user`, password: `airport_pass`)

**Useful commands:**
```bash
# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Reset database (removes all data)
docker-compose down -v
docker-compose up -d
```

**Test the API:**
```bash
# Get all airports
curl http://localhost:3333/api/airports

# Submit a suggestion
curl -X POST http://localhost:3333/api/airports/suggest \
  -H "Content-Type: application/json" \
  -d '{"icao_code":"TEST","name":"Test Airport"}'

# View pending suggestions (admin)
curl http://localhost:3333/api/airports/pending \
  -H "Authorization: Bearer local-dev-admin-key-change-in-production"
```

## Setup (Manual/Vercel Deployment)

### 1. Prerequisites

- Node.js 18+ installed
- Vercel account
- Vercel CLI installed (`npm i -g vercel`)

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Vercel Postgres

1. Create a new Vercel project or link existing one:
   ```bash
   vercel link
   ```

2. Add Vercel Postgres to your project:
   - Go to your project in Vercel Dashboard
   - Navigate to Storage tab
   - Click "Create Database" → "Postgres"
   - Follow the setup wizard

3. Pull environment variables locally:
   ```bash
   vercel env pull .env.local
   ```

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your admin API key to `.env.local`:
   ```
   ADMIN_API_KEY=your-secret-admin-key-here
   ```

3. Make sure to add `ADMIN_API_KEY` to your Vercel project environment variables:
   ```bash
   vercel env add ADMIN_API_KEY
   ```

### 5. Initialize Database

Run the database initialization script to create tables:

```bash
npx tsx scripts/init-db.ts
```

Or you can run the SQL directly in Vercel Postgres dashboard using the `schema.sql` file.

### 6. Deploy

Deploy to Vercel:

```bash
vercel --prod
```

## API Documentation

### Public Endpoints

#### GET /api/airports

Get all approved airports.

**Response:**
```json
{
  "success": true,
  "count": 150,
  "airports": [
    {
      "id": 1,
      "icao_code": "KLAX",
      "iata_code": "LAX",
      "name": "Los Angeles International Airport",
      "city": "Los Angeles",
      "country": "United States",
      "latitude": 33.9425,
      "longitude": -118.408,
      "elevation": 125,
      "timezone": "America/Los_Angeles",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/airports/suggest

Submit a new airport suggestion.

**Request Body:**
```json
{
  "icao_code": "KJFK",
  "iata_code": "JFK",
  "name": "John F. Kennedy International Airport",
  "city": "New York",
  "country": "United States",
  "latitude": 40.6413,
  "longitude": -73.7781,
  "elevation": 13,
  "timezone": "America/New_York"
}
```

**Required Fields:**
- `icao_code` (string, 4 characters)
- `name` (string)

**Optional Fields:**
- `iata_code` (string, 3 characters)
- `city` (string)
- `country` (string)
- `latitude` (number)
- `longitude` (number)
- `elevation` (number, in feet)
- `timezone` (string)

**Response:**
```json
{
  "success": true,
  "message": "Airport suggestion submitted successfully",
  "suggestion_id": 42
}
```

### Admin Endpoints

All admin endpoints require authentication using a Bearer token.

**Authentication Header:**
```
Authorization: Bearer your-admin-api-key
```

#### GET /api/airports/pending

Get all pending airport suggestions.

**Response:**
```json
{
  "success": true,
  "count": 5,
  "suggestions": [
    {
      "id": 42,
      "icao_code": "KJFK",
      "iata_code": "JFK",
      "name": "John F. Kennedy International Airport",
      "city": "New York",
      "country": "United States",
      "latitude": 40.6413,
      "longitude": -73.7781,
      "elevation": 13,
      "timezone": "America/New_York",
      "status": "pending",
      "submitted_at": "2024-01-15T10:30:00Z",
      "reviewed_at": null,
      "reviewed_by": null
    }
  ]
}
```

#### POST /api/airports/approve

Approve or reject an airport suggestion.

**Request Body:**
```json
{
  "id": 42,
  "action": "approve"
}
```

**Fields:**
- `id` (number, required): The suggestion ID
- `action` (string, optional): Either "approve" or "reject" (default: "approve")

**Response (Approved):**
```json
{
  "success": true,
  "message": "Airport approved and added to database",
  "airport": {
    "icao_code": "KJFK",
    "name": "John F. Kennedy International Airport"
  }
}
```

**Response (Rejected):**
```json
{
  "success": true,
  "message": "Airport suggestion rejected"
}
```

#### POST /api/airports/create

Directly create a new airport (bypasses the suggestion/review process).

**Request Body:**
```json
{
  "icao_code": "EGLL",
  "iata_code": "LHR",
  "name": "London Heathrow Airport",
  "city": "London",
  "country": "United Kingdom",
  "latitude": 51.4700,
  "longitude": -0.4543,
  "elevation": 83,
  "timezone": "Europe/London"
}
```

**Required Fields:**
- `icao_code` (string, 4 characters)
- `name` (string)

**Optional Fields:**
- `iata_code` (string, 3 characters)
- `city` (string)
- `country` (string)
- `latitude` (number)
- `longitude` (number)
- `elevation` (number, in feet)
- `timezone` (string)

**Response:**
```json
{
  "success": true,
  "message": "Airport created successfully",
  "airport": {
    "id": 151,
    "icao_code": "EGLL",
    "name": "London Heathrow Airport"
  }
}
```

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created (for suggestions)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing auth)
- `403` - Forbidden (invalid auth)
- `404` - Not Found
- `405` - Method Not Allowed
- `409` - Conflict (duplicate ICAO code)
- `500` - Internal Server Error

## Database Schema

### `airports` Table
Stores approved airports that are served via the public API.

### `airport_suggestions` Table
Stores pending, approved, and rejected airport suggestions.

See `schema.sql` for the complete database schema.

## Development

### Local Development (Standalone Server)

Run the standalone Express server (no Vercel CLI required):

```bash
npm run dev
```

The API will be available at `http://localhost:3333`.

This uses a lightweight Express server that wraps the Vercel serverless functions, making local development easier without requiring Vercel authentication.

### Testing with Vercel Dev

If you want to test with the actual Vercel runtime (requires `vercel login`):

```bash
npm run dev:vercel
```

The API will be available at `http://localhost:3000`.

## Bulk Import

You can bulk import airports using the import script. This is useful for populating your database with initial data.

### Using the Sample Data

The project includes a sample data file with 5 airports. To import it:

```bash
npm run import-airports
```

### Importing Your Own Data

1. Edit `scripts/sample-airports.json` with your airport data
2. Run the import script: `npm run import-airports`

The script will skip any airports that already exist (based on ICAO code).

### Data Format

Your JSON file should contain an array of airport objects:

```json
[
  {
    "icao_code": "KLAX",
    "iata_code": "LAX",
    "name": "Los Angeles International Airport",
    "city": "Los Angeles",
    "country": "United States",
    "latitude": 33.9425,
    "longitude": -118.408,
    "elevation": 125,
    "timezone": "America/Los_Angeles"
  }
]
```

## Mobile App Integration

Your mobile app should:

1. **On startup/timer**: Call `GET /api/airports` to fetch all airports
2. **Compare with local database**: Update local storage with new/changed airports
3. **User submissions**: Allow users to submit suggestions via `POST /api/airports/suggest`

Example sync logic:
```javascript
async function syncAirports() {
  const response = await fetch('https://your-domain.vercel.app/api/airports');
  const data = await response.json();

  // Update local database with data.airports
  await updateLocalDatabase(data.airports);
}
```

## License

MIT
