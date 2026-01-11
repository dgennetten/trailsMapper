# Step-by-Step Import Guide

## Step 1: Get Your Supabase Credentials

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Select your project (or create a new one)
3. Click on **Settings** (gear icon) in the left sidebar
4. Click on **API** in the settings menu
5. You'll see two important values:
   - **Project URL** - looks like: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key** - a long string starting with `eyJ...`

**📋 Copy both values - you'll need them in the next step!**

---

## Step 2: Export Your Data (if you haven't already)

1. Open the browser that has your patrol data
2. Navigate to your trailsMapper app
3. Press **F12** (or Right-click → Inspect) to open Developer Tools
4. Click on the **Console** tab
5. Copy the entire contents of `export-localStorage-data.js`
6. Paste it into the console and press **Enter**
7. A JSON file will download (e.g., `patrols-export-2024-01-15.json`)

---

## Step 3: Import to Supabase (Browser Method - Easiest)

### Option A: Using the File Upload Method (Recommended)

1. Open any webpage (can be your trailsMapper app or even google.com)
2. Press **F12** to open Developer Tools
3. Go to the **Console** tab
4. Copy the entire contents of `import-to-supabase-browser.js`
5. **Before pasting**, update these two lines with your credentials:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';  // Replace with your Project URL
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your anon key
   ```
6. Paste the modified script into the console
7. The script will automatically open a file picker
8. Select your exported JSON file (the one you downloaded in Step 2)
9. Wait for the import to complete - you'll see progress in the console
10. You'll get an alert when it's done!

### Option B: Manual Data Entry

1. Open your exported JSON file in a text editor
2. Copy the entire contents
3. Open browser console (F12 → Console)
4. Copy the import script and update the credentials
5. Replace the `EXPORTED_DATA` object with your JSON data:
   ```javascript
   const EXPORTED_DATA = // paste your JSON here
   ```
6. Run the script

---

## Step 4: Verify the Import

1. Go back to your Supabase dashboard
2. Click on **Table Editor** in the left sidebar
3. Select the **trailPatrols** table
4. You should see all your imported patrols!

---

## Troubleshooting

### "Invalid export data format"
- Make sure you're using the JSON file from the export script
- The file should have a `trips` array inside

### "Failed to load Supabase client"
- Check your internet connection
- Try refreshing the page and running the script again

### "new row violates row-level security policy"
- Your RLS policies might be too restrictive
- Go to Supabase → Authentication → Policies
- Check that your policies allow inserts

### "relation 'trailPatrols' does not exist"
- You haven't created the table yet!
- Go to SQL Editor and run the `supabase-schema.sql` file first

### Import seems stuck
- Check the browser console for error messages
- Make sure your Supabase URL and key are correct
- Verify the table exists in Supabase

---

## Quick Reference

**Where to find Supabase credentials:**
- Dashboard → Settings → API → Project URL & anon public key

**Table name:** `trailPatrols` (camelCase, case-sensitive)

**Required fields:**
- `date` (DATE)
- `trail` (TEXT)
- `partners` (TEXT, optional)
- `trees_cleared` (TEXT, optional)
