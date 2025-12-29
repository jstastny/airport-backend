import { sql } from '../lib/db';
import { readFileSync } from 'fs';
import { join } from 'path';

interface AirportData {
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

async function importAirports() {
  try {
    console.log('Importing airports...');

    // Read the sample data file
    const dataFile = readFileSync(join(__dirname, 'sample-airports.json'), 'utf-8');
    const airports: AirportData[] = JSON.parse(dataFile);

    console.log(`Found ${airports.length} airports to import`);

    let imported = 0;
    let skipped = 0;

    for (const airport of airports) {
      try {
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
            ${airport.icao_code.toUpperCase()},
            ${airport.iata_code?.toUpperCase() || null},
            ${airport.name},
            ${airport.city || null},
            ${airport.country || null},
            ${airport.latitude || null},
            ${airport.longitude || null},
            ${airport.elevation || null},
            ${airport.timezone || null}
          )
        `;
        imported++;
        console.log(`✓ Imported: ${airport.icao_code} - ${airport.name}`);
      } catch (error: any) {
        if (error.code === '23505') {
          // Duplicate key - skip
          skipped++;
          console.log(`⊘ Skipped (duplicate): ${airport.icao_code} - ${airport.name}`);
        } else {
          throw error;
        }
      }
    }

    console.log(`\nImport complete!`);
    console.log(`Imported: ${imported}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Total: ${airports.length}`);
    process.exit(0);
  } catch (error) {
    console.error('Error importing airports:', error);
    process.exit(1);
  }
}

importAirports();
