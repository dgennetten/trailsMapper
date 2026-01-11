/**
 * PASTE JSON VERSION - No file picker needed!
 * 
 * This version lets you paste your JSON data directly.
 * Useful if the file picker isn't working.
 * 
 * INSTRUCTIONS:
 * 1. Open your exported JSON file in a text editor
 * 2. Select all (Ctrl+A) and copy (Ctrl+C)
 * 3. Run this script
 * 4. When prompted, paste your JSON data
 */

(async function() {
  try {
    console.log('🚀 Starting import (paste JSON version)...');
    
    // STEP 1: Get credentials
    console.log('\n📝 Step 1: Getting Supabase credentials...');
    const SUPABASE_URL = prompt('Enter your Supabase Project URL:\n(Example: https://xxxxx.supabase.co)');
    if (!SUPABASE_URL) {
      alert('Import cancelled - no URL');
      return;
    }
    console.log('✅ URL received');
    
    const SUPABASE_ANON_KEY = prompt('Enter your Supabase anon public key:');
    if (!SUPABASE_ANON_KEY) {
      alert('Import cancelled - no key');
      return;
    }
    console.log('✅ Key received');
    
    // STEP 2: Get JSON data
    console.log('\n📋 Step 2: Getting JSON data...');
    alert('In the next prompt, paste your entire JSON file content.\n\n' +
          '1. Open your exported JSON file\n' +
          '2. Select All (Ctrl+A or Cmd+A)\n' +
          '3. Copy (Ctrl+C or Cmd+C)\n' +
          '4. Paste it in the next prompt');
    
    const jsonText = prompt('Paste your JSON data here:');
    if (!jsonText) {
      alert('Import cancelled - no data');
      return;
    }
    
    console.log('✅ JSON received, length:', jsonText.length);
    
    // STEP 3: Parse JSON
    console.log('\n🔍 Step 3: Parsing JSON...');
    let exportData;
    try {
      exportData = JSON.parse(jsonText);
      console.log('✅ JSON parsed successfully');
    } catch (error) {
      console.error('❌ JSON parse error:', error);
      alert('Error parsing JSON: ' + error.message + '\n\nMake sure you copied the entire JSON file.');
      return;
    }
    
    if (!exportData.trips || !Array.isArray(exportData.trips)) {
      console.error('❌ Invalid data structure');
      console.log('Available keys:', Object.keys(exportData));
      alert('Invalid export file. Expected format: { trips: [...] }\n\nCheck console for details.');
      return;
    }
    
    console.log('✅ Found', exportData.trips.length, 'trips to import');
    
    // STEP 4: Load Supabase
    console.log('\n🔌 Step 4: Loading Supabase client...');
    
    function loadSupabase() {
      return new Promise((resolve, reject) => {
        if (window.supabase) {
          resolve(window.supabase);
          return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
        script.onload = () => resolve(window.supabase);
        script.onerror = () => reject(new Error('Failed to load Supabase client'));
        document.head.appendChild(script);
      });
    }
    
    const supabaseModule = await loadSupabase();
    const { createClient } = supabaseModule;
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase client ready');
    
    // STEP 5: Transform data
    console.log('\n🔄 Step 5: Transforming data...');
    const tripsToInsert = exportData.trips.map(trip => ({
      date: trip.date,
      trail: trip.trail,
      partners: trip.partners || null,
      trees_cleared: trip.treesCleared || null
    }));
    console.log('✅ Data transformed');
    
    // STEP 6: Confirm
    const confirm = window.confirm(
      `Ready to import ${tripsToInsert.length} patrols to Supabase.\n\n` +
      `URL: ${SUPABASE_URL}\n` +
      `Table: trailPatrols\n\n` +
      `Click OK to proceed.`
    );
    
    if (!confirm) {
      console.log('❌ Import cancelled');
      return;
    }
    
    // STEP 7: Import
    console.log('\n📤 Step 7: Importing data...');
    const BATCH_SIZE = 1000;
    let imported = 0;
    let errors = [];
    
    for (let i = 0; i < tripsToInsert.length; i += BATCH_SIZE) {
      const batch = tripsToInsert.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(tripsToInsert.length / BATCH_SIZE);
      
      console.log(`📦 Batch ${batchNum}/${totalBatches} (${batch.length} patrols)...`);
      
      const { data, error } = await supabase
        .from('trailPatrols')
        .insert(batch);
      
      if (error) {
        console.error(`❌ Batch ${batchNum} error:`, error);
        errors.push({ batch: batchNum, error: error.message });
      } else {
        imported += batch.length;
        console.log(`✅ Batch ${batchNum} imported (${imported}/${tripsToInsert.length})`);
      }
    }
    
    // STEP 8: Verify
    console.log('\n🔍 Step 8: Verifying...');
    const { count, error: countError } = await supabase
      .from('trailPatrols')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.warn('⚠️ Could not verify count:', countError);
    } else {
      console.log('✅ Total in database:', count);
    }
    
    // Results
    if (errors.length > 0) {
      console.error('❌ Import completed with', errors.length, 'errors');
      alert(`Import completed with ${errors.length} error(s).\n\nImported: ${imported}/${tripsToInsert.length}\n\nCheck console for details.`);
    } else {
      console.log(`\n🎉 Successfully imported ${imported} patrols!`);
      alert(`✅ Successfully imported ${imported} patrols!\n\nTotal in database: ${count || 'unknown'}`);
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    alert('Import failed: ' + error.message + '\n\nCheck console for details.');
  }
})();
