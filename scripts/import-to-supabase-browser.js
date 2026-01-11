/**
 * Browser-based import script to upload patrol data to Supabase
 * 
 * This script can be run directly in the browser console.
 * No Node.js installation required!
 * 
 * Prerequisites:
 * 1. Export your data using export-localStorage-data.js first
 * 2. Get your Supabase URL and anon key from your Supabase project settings
 * 
 * Usage:
 * 1. Update SUPABASE_URL and SUPABASE_ANON_KEY below
 * 2. Open the exported JSON file and copy its contents
 * 3. Paste this script into browser console
 * 4. Update the EXPORTED_DATA variable with your JSON data
 * 5. Run the script
 */

// ⚠️ UPDATE THESE VALUES FROM YOUR SUPABASE PROJECT
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// ⚠️ PASTE YOUR EXPORTED JSON DATA HERE (or load from file)
// You can also use: const EXPORTED_DATA = JSON.parse(pastedJsonString);
const EXPORTED_DATA = {
  exportDate: "2024-01-01T00:00:00.000Z",
  version: "1.0",
  count: 0,
  trips: []
};

// Load Supabase client from CDN
async function loadSupabase() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    script.onload = () => resolve(window.supabase);
    script.onerror = () => reject(new Error('Failed to load Supabase client'));
    document.head.appendChild(script);
  });
}

async function importToSupabase() {
  try {
    console.log('Loading Supabase client...');
    const supabaseModule = await loadSupabase();
    const { createClient } = supabaseModule;
    
    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Validate exported data
    if (!EXPORTED_DATA.trips || !Array.isArray(EXPORTED_DATA.trips)) {
      throw new Error('Invalid export data format. Expected { trips: [...] }');
    }
    
    console.log(`Found ${EXPORTED_DATA.trips.length} trips to import`);
    
    // Transform the data to match Supabase schema
    const tripsToInsert = EXPORTED_DATA.trips.map(trip => ({
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
    
    alert(`Successfully imported ${imported} trips to Supabase!`);
    
  } catch (error) {
    console.error('Import failed:', error.message);
    alert('Import failed: ' + error.message);
  }
}

// Helper function to load JSON from file input
function loadJsonFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// Alternative: Use file input to load JSON
async function importFromFile() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const data = await loadJsonFromFile(file);
        // Update EXPORTED_DATA and run import
        Object.assign(EXPORTED_DATA, data);
        await importToSupabase();
      } catch (error) {
        console.error('Error loading file:', error);
        alert('Error loading file: ' + error.message);
      }
    }
  };
  input.click();
}

// Uncomment to use file input instead:
// importFromFile();

// Or run directly with EXPORTED_DATA:
importToSupabase();
