/**
 * SIMPLIFIED Browser Import Script
 * 
 * This version makes it easier to enter your credentials and data.
 * 
 * INSTRUCTIONS:
 * 1. Get your Supabase URL and anon key from: Supabase Dashboard → Settings → API
 * 2. Export your data first using export-localStorage-data.js
 * 3. Copy this entire script
 * 4. Paste into browser console (F12 → Console)
 * 5. Follow the prompts!
 */

(async function() {
  try {
    console.log('🚀 Starting import process...');
    
    // ============================================
    // STEP 1: ENTER YOUR SUPABASE CREDENTIALS
    // ============================================
    // Get these from: Supabase Dashboard → Settings → API
    
    console.log('Step 1: Getting Supabase credentials...');
    const SUPABASE_URL = prompt('Enter your Supabase Project URL:\n(Example: https://xxxxx.supabase.co)');
    if (!SUPABASE_URL) {
      alert('Import cancelled - no URL provided');
      console.log('❌ Import cancelled - no URL');
      return;
    }
    console.log('✅ URL received:', SUPABASE_URL);
    
    const SUPABASE_ANON_KEY = prompt('Enter your Supabase anon public key:\n(Starts with eyJ...)');
    if (!SUPABASE_ANON_KEY) {
      alert('Import cancelled - no key provided');
      console.log('❌ Import cancelled - no key');
      return;
    }
    console.log('✅ Key received (length:', SUPABASE_ANON_KEY.length, 'chars)');
  
  // ============================================
  // STEP 2: LOAD YOUR EXPORTED JSON FILE
  // ============================================
  
  console.log('📁 Step 2: File selection');
  alert('A green button will appear on the page.\n\nClick it to select your exported JSON file (patrols-export-*.json)');
  
  // Create a visible button for user to click (required for file picker - browsers block programmatic file pickers)
  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10000;background:white;padding:20px;border:2px solid #4CAF50;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);';
  
  const button = document.createElement('button');
  button.textContent = '📁 Click to Select JSON File';
  button.style.cssText = 'padding:12px 24px;font-size:16px;background:#4CAF50;color:white;border:none;border-radius:4px;cursor:pointer;';
  button.onmouseover = () => button.style.background = '#45a049';
  button.onmouseout = () => button.style.background = '#4CAF50';
  
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json';
  fileInput.style.display = 'none';
  
  const file = await new Promise((resolve) => {
    let resolved = false;
    
    fileInput.addEventListener('change', (e) => {
      if (resolved) return;
      resolved = true;
      const selectedFile = e.target.files?.[0];
      document.body.removeChild(buttonContainer);
      console.log('✅ File selected:', selectedFile ? selectedFile.name : 'none');
      resolve(selectedFile || null);
    });
    
    button.addEventListener('click', () => {
      fileInput.click();
    });
    
    buttonContainer.appendChild(button);
    buttonContainer.appendChild(document.createTextNode(' (Select your patrols-export-*.json file)'));
    document.body.appendChild(buttonContainer);
    document.body.appendChild(fileInput);
    
    // Auto-remove after 5 minutes if no selection
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        if (buttonContainer.parentNode) document.body.removeChild(buttonContainer);
        if (fileInput.parentNode) document.body.removeChild(fileInput);
        console.warn('⏱️ File picker timeout');
        resolve(null);
      }
    }, 300000);
  });
  
  if (!file) {
    alert('No file selected. Import cancelled.');
    console.log('❌ Import cancelled - no file selected');
    return;
  }
  
  console.log(`✅ File selected: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
  
  // Read the file
  const fileText = await file.text();
  let exportData;
  
  try {
    exportData = JSON.parse(fileText);
  } catch (error) {
    alert('Error reading JSON file: ' + error.message);
    return;
  }
  
  // Validate the data
  if (!exportData.trips || !Array.isArray(exportData.trips)) {
    alert('Invalid export file. Expected format: { trips: [...] }');
    return;
  }
  
  console.log(`✅ Found ${exportData.trips.length} patrols to import`);
  
  // ============================================
  // STEP 3: LOAD SUPABASE CLIENT
  // ============================================
  
  console.log('Loading Supabase client...');
  
  function loadSupabase() {
    return new Promise((resolve, reject) => {
      // Check if already loaded
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
  
  // ============================================
  // STEP 4: TRANSFORM AND IMPORT DATA
  // ============================================
  
  console.log('Transforming data...');
  
  const tripsToInsert = exportData.trips.map(trip => ({
    date: trip.date,
    trail: trip.trail,
    partners: trip.partners || null,
    trees_cleared: trip.treesCleared || null
  }));
  
  console.log(`Ready to import ${tripsToInsert.length} patrols`);
  
  // Confirm before importing
  const confirm = window.confirm(
    `Ready to import ${tripsToInsert.length} patrols to Supabase.\n\n` +
    `URL: ${SUPABASE_URL}\n` +
    `Table: trailPatrols\n\n` +
    `Click OK to proceed, or Cancel to abort.`
  );
  
  if (!confirm) {
    console.log('Import cancelled by user');
    return;
  }
  
  // Import in batches
  const BATCH_SIZE = 1000;
  let imported = 0;
  let errors = [];
  
  for (let i = 0; i < tripsToInsert.length; i += BATCH_SIZE) {
    const batch = tripsToInsert.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(tripsToInsert.length / BATCH_SIZE);
    
    console.log(`📦 Importing batch ${batchNum}/${totalBatches} (${batch.length} patrols)...`);
    
    const { data, error } = await supabase
      .from('trailPatrols')
      .insert(batch);
    
    if (error) {
      console.error(`❌ Error in batch ${batchNum}:`, error);
      errors.push({ batch: batchNum, error: error.message });
    } else {
      imported += batch.length;
      console.log(`✅ Batch ${batchNum} imported successfully (${imported}/${tripsToInsert.length} total)`);
    }
  }
  
  // ============================================
  // STEP 5: VERIFY IMPORT
  // ============================================
  
  console.log('\n📊 Verifying import...');
  
  const { count, error: countError } = await supabase
    .from('trailPatrols')
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    console.warn('⚠️ Could not verify count:', countError);
  } else {
    console.log(`✅ Total patrols in database: ${count}`);
  }
  
  // ============================================
  // FINAL RESULTS
  // ============================================
  
  if (errors.length > 0) {
    console.error('❌ Import completed with errors:', errors);
    alert(
      `Import completed with ${errors.length} error(s).\n\n` +
      `Imported: ${imported}/${tripsToInsert.length}\n` +
      `Check console for details.`
    );
  } else {
    console.log(`\n🎉 Successfully imported ${imported} patrols to Supabase!`);
    alert(`✅ Successfully imported ${imported} patrols to Supabase!\n\nTotal in database: ${count || 'unknown'}`);
  }
  
  } catch (error) {
    console.error('❌ Fatal error during import:', error);
    alert('Import failed with error: ' + error.message + '\n\nCheck the console for details.');
  }
  
})();
