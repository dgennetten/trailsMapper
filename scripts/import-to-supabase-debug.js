/**
 * DEBUG VERSION - Shows detailed progress
 * Use this if the simple version isn't working
 */

(async function() {
  console.log('🚀 ========================================');
  console.log('🚀 IMPORT SCRIPT STARTED');
  console.log('🚀 ========================================');
  
  try {
    // STEP 1: Get credentials
    console.log('\n📝 STEP 1: Getting credentials...');
    const SUPABASE_URL = prompt('Enter your Supabase Project URL:\n(Example: https://xxxxx.supabase.co)');
    if (!SUPABASE_URL) {
      console.error('❌ No URL provided');
      return;
    }
    console.log('✅ URL:', SUPABASE_URL);
    
    const SUPABASE_ANON_KEY = prompt('Enter your Supabase anon public key:');
    if (!SUPABASE_ANON_KEY) {
      console.error('❌ No key provided');
      return;
    }
    console.log('✅ Key received (length:', SUPABASE_ANON_KEY.length, ')');
    
    // STEP 2: File selection
    console.log('\n📁 STEP 2: Opening file picker...');
    alert('A file picker will open now. Select your JSON file.');
    
    const file = await new Promise((resolve) => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.json';
      fileInput.style.cssText = 'position:fixed;top:-1000px;';
      
      let timeoutId;
      
      fileInput.addEventListener('change', (e) => {
        clearTimeout(timeoutId);
        const file = e.target.files?.[0];
        console.log('📄 File selected:', file ? file.name : 'none');
        if (fileInput.parentNode) fileInput.parentNode.removeChild(fileInput);
        resolve(file || null);
      });
      
      document.body.appendChild(fileInput);
      
      // Click after delay
      setTimeout(() => {
        console.log('🖱️ Clicking file input...');
        fileInput.click();
        
        // Timeout after 60 seconds
        timeoutId = setTimeout(() => {
          console.warn('⏱️ File picker timeout (60s)');
          if (fileInput.parentNode) fileInput.parentNode.removeChild(fileInput);
          resolve(null);
        }, 60000);
      }, 100);
    });
    
    if (!file) {
      console.error('❌ No file selected');
      alert('No file selected. Import cancelled.');
      return;
    }
    
    console.log('✅ File:', file.name, 'Size:', file.size, 'bytes');
    
    // STEP 3: Read file
    console.log('\n📖 STEP 3: Reading file...');
    const fileText = await file.text();
    console.log('✅ File read, length:', fileText.length, 'chars');
    
    // STEP 4: Parse JSON
    console.log('\n🔍 STEP 4: Parsing JSON...');
    let exportData;
    try {
      exportData = JSON.parse(fileText);
      console.log('✅ JSON parsed successfully');
    } catch (error) {
      console.error('❌ JSON parse error:', error);
      alert('Error parsing JSON: ' + error.message);
      return;
    }
    
    if (!exportData.trips || !Array.isArray(exportData.trips)) {
      console.error('❌ Invalid data structure. Expected { trips: [...] }');
      console.log('Data keys:', Object.keys(exportData));
      alert('Invalid export file format. Expected { trips: [...] }');
      return;
    }
    
    console.log('✅ Found', exportData.trips.length, 'trips');
    
    // STEP 5: Load Supabase
    console.log('\n🔌 STEP 5: Loading Supabase client...');
    
    function loadSupabase() {
      return new Promise((resolve, reject) => {
        if (window.supabase) {
          console.log('✅ Supabase already loaded');
          resolve(window.supabase);
          return;
        }
        
        console.log('📦 Loading Supabase from CDN...');
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
        script.onload = () => {
          console.log('✅ Supabase loaded');
          resolve(window.supabase);
        };
        script.onerror = () => {
          console.error('❌ Failed to load Supabase');
          reject(new Error('Failed to load Supabase client'));
        };
        document.head.appendChild(script);
      });
    }
    
    const supabaseModule = await loadSupabase();
    const { createClient } = supabaseModule;
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase client created');
    
    // STEP 6: Transform data
    console.log('\n🔄 STEP 6: Transforming data...');
    const tripsToInsert = exportData.trips.map(trip => ({
      date: trip.date,
      trail: trip.trail,
      partners: trip.partners || null,
      trees_cleared: trip.treesCleared || null
    }));
    console.log('✅ Transformed', tripsToInsert.length, 'trips');
    console.log('Sample trip:', tripsToInsert[0]);
    
    // STEP 7: Confirm
    console.log('\n✋ STEP 7: Confirming import...');
    const confirm = window.confirm(
      `Ready to import ${tripsToInsert.length} patrols.\n\n` +
      `Click OK to proceed.`
    );
    
    if (!confirm) {
      console.log('❌ User cancelled');
      return;
    }
    
    // STEP 8: Import
    console.log('\n📤 STEP 8: Importing data...');
    const BATCH_SIZE = 1000;
    let imported = 0;
    let errors = [];
    
    for (let i = 0; i < tripsToInsert.length; i += BATCH_SIZE) {
      const batch = tripsToInsert.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(tripsToInsert.length / BATCH_SIZE);
      
      console.log(`📦 Batch ${batchNum}/${totalBatches}:`, batch.length, 'trips');
      
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
    
    // STEP 9: Verify
    console.log('\n🔍 STEP 9: Verifying import...');
    const { count, error: countError } = await supabase
      .from('trailPatrols')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.warn('⚠️ Count error:', countError);
    } else {
      console.log('✅ Total in database:', count);
    }
    
    // Results
    console.log('\n🎉 ========================================');
    if (errors.length > 0) {
      console.error('❌ Import completed with', errors.length, 'errors');
      console.error('Errors:', errors);
      alert(`Import completed with ${errors.length} error(s).\n\nImported: ${imported}/${tripsToInsert.length}\n\nCheck console for details.`);
    } else {
      console.log('✅ SUCCESS! Imported', imported, 'patrols');
      alert(`✅ Successfully imported ${imported} patrols!\n\nTotal in database: ${count || 'unknown'}`);
    }
    console.log('🎉 ========================================');
    
  } catch (error) {
    console.error('\n❌ ========================================');
    console.error('❌ FATAL ERROR:', error);
    console.error('❌ Stack:', error.stack);
    console.error('❌ ========================================');
    alert('Import failed: ' + error.message + '\n\nCheck console for details.');
  }
})();
