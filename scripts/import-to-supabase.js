/**
 * Import script to upload patrol data to Supabase
 * 
 * Prerequisites:
 * 1. Install @supabase/supabase-js: npm install @supabase/supabase-js
 * 2. Get your Supabase URL and anon key from your Supabase project settings
 * 3. Export your data using export-localStorage-data.js first
 * 
 * Usage:
 * 1. Update SUPABASE_URL and SUPABASE_ANON_KEY below
 * 2. Update the JSON_FILE_PATH to point to your exported JSON file
 * 3. Run: node scripts/import-to-supabase.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ⚠️ UPDATE THESE VALUES FROM YOUR SUPABASE PROJECT
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Path to your exported JSON file
const JSON_FILE_PATH = path.join(__dirname, 'patrols-export-YYYY-MM-DD.json');

async function importToSupabase() {
  try {
    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Read the exported JSON file
    console.log('Reading export file...');
    const fileContent = fs.readFileSync(JSON_FILE_PATH, 'utf8');
    const exportData = JSON.parse(fileContent);
    
    if (!exportData.trips || !Array.isArray(exportData.trips)) {
      throw new Error('Invalid export file format. Expected { trips: [...] }');
    }
    
    console.log(`Found ${exportData.trips.length} trips to import`);
    
    // Transform the data to match Supabase schema
    const tripsToInsert = exportData.trips.map(trip => ({
      date: trip.date,
      trail: trip.trail,
      partners: trip.partners || null,
      trees_cleared: trip.treesCleared || null
    }));
    
    // Insert data in batches (Supabase has a limit of 1000 rows per insert)
    const BATCH_SIZE = 1000;
    let imported = 0;
    
    for (let i = 0; i < tripsToInsert.length; i += BATCH_SIZE) {
      const batch = tripsToInsert.slice(i, i + BATCH_SIZE);
      
      console.log(`Importing batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} trips)...`);
      
      const { data, error } = await supabase
        .from('trailPatrols')
        .insert(batch);
      
      if (error) {
        console.error('Error importing batch:', error);
        throw error;
      }
      
      imported += batch.length;
      console.log(`✅ Imported ${imported}/${tripsToInsert.length} trips`);
    }
    
    console.log(`\n🎉 Successfully imported ${imported} trips to Supabase!`);
    
    // Verify the import
    const { count, error: countError } = await supabase
      .from('trailPatrols')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.warn('Warning: Could not verify import count:', countError);
    } else {
      console.log(`Total trips in database: ${count}`);
    }
    
  } catch (error) {
    console.error('Import failed:', error.message);
    process.exit(1);
  }
}

// Run the import
importToSupabase();
