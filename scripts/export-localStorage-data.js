/**
 * Export script to extract patrol data from localStorage
 * 
 * Usage:
 * 1. Open your browser console (F12)
 * 2. Navigate to your trailsMapper app
 * 3. Copy and paste this entire script
 * 4. Run it - it will download a JSON file with your data
 */

(function() {
  const LOCAL_STORAGE_KEY = 'trailsMapper.trips';
  
  try {
    // Get data from localStorage
    const savedTrips = localStorage.getItem(LOCAL_STORAGE_KEY);
    
    if (!savedTrips) {
      console.error('No trips data found in localStorage');
      alert('No trips data found in localStorage. Make sure you are on the browser that has the data.');
      return;
    }
    
    // Parse the data
    const trips = JSON.parse(savedTrips);
    
    if (!Array.isArray(trips)) {
      console.error('Invalid data format - expected an array');
      alert('Invalid data format. Expected an array of trips.');
      return;
    }
    
    console.log(`Found ${trips.length} trips in localStorage`);
    console.log('Sample trip:', trips[0]);
    
    // Create export object with metadata
    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      count: trips.length,
      trips: trips
    };
    
    // Convert to JSON string
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Create download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patrols-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('✅ Export successful! File downloaded.');
    alert(`Successfully exported ${trips.length} patrols to JSON file.`);
    
  } catch (error) {
    console.error('Error exporting data:', error);
    alert('Error exporting data: ' + error.message);
  }
})();
