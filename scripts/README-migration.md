# Migrating Patrol Data from localStorage to Supabase

This guide will help you migrate your patrol data from browser localStorage to Supabase.

## Step 1: Export Data from Browser localStorage

1. Open the browser that contains your patrol data
2. Navigate to your trailsMapper application
3. Open the browser console (F12 or Right-click → Inspect → Console)
4. Copy the entire contents of `export-localStorage-data.js`
5. Paste it into the console and press Enter
6. A JSON file will be downloaded with your data

**Alternative: Manual Export**
If the script doesn't work, you can manually export:
```javascript
// In browser console:
const data = localStorage.getItem('trailsMapper.trips');
console.log(data);
// Copy the output and save it to a file
```

## Step 2: Set Up Supabase Table

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase-schema.sql`
4. Paste and run it in the SQL Editor
5. Verify the table was created by checking **Table Editor**

**Note:** The schema includes Row Level Security (RLS) policies. Adjust them based on your authentication needs:
- If you want public read access, uncomment the public read policy
- If you need different permissions, modify the policies accordingly

## Step 3: Import Data to Supabase

### Option A: Using Node.js Script (Recommended)

1. Install dependencies:
   ```bash
   npm install @supabase/supabase-js
   ```

2. Get your Supabase credentials:
   - Go to **Project Settings** → **API**
   - Copy your **Project URL** and **anon/public key**

3. Update `import-to-supabase.js`:
   - Replace `YOUR_SUPABASE_PROJECT_URL` with your project URL
   - Replace `YOUR_SUPABASE_ANON_KEY` with your anon key
   - Update `JSON_FILE_PATH` to point to your exported JSON file

4. Run the import script:
   ```bash
   node scripts/import-to-supabase.js
   ```

### Option B: Using Supabase Dashboard

1. Go to **Table Editor** → **trailPatrols** table
2. Click **Insert** → **Insert row**
3. Manually enter each trip (not recommended for large datasets)

### Option C: Using Supabase SQL Editor

1. Convert your JSON to SQL INSERT statements
2. Run in SQL Editor:
   ```sql
   INSERT INTO "trailPatrols" (date, trail, partners, trees_cleared) VALUES
   ('2024-05-23', 'Greyrock & Greyrock Meadows', 'Jeanne Corbin', ''),
   ('2024-06-05', 'North Fork', 'Carol Springberg', ''),
   -- ... more rows
   ;
   ```

## Step 4: Verify the Migration

1. Go to **Table Editor** → **trailPatrols**
2. Check that all your data is there
3. Verify the count matches your exported data

## Data Structure Mapping

| localStorage Field | Supabase Column | Type |
|-------------------|----------------|------|
| `date` | `date` | DATE |
| `trail` | `trail` | TEXT |
| `partners` | `partners` | TEXT |
| `treesCleared` | `trees_cleared` | TEXT |

**Additional Supabase columns:**
- `id` - UUID (auto-generated)
- `created_at` - TIMESTAMP (auto-generated)
- `updated_at` - TIMESTAMP (auto-updated)

## Troubleshooting

### Export Issues
- **No data found**: Make sure you're on the correct browser/device
- **Invalid format**: Check that localStorage contains valid JSON

### Import Issues
- **Authentication error**: Check your Supabase URL and anon key
- **RLS policy error**: Adjust the RLS policies in the schema
- **Batch size error**: Reduce `BATCH_SIZE` in the import script if you have >1000 rows

### Data Issues
- **Missing fields**: Empty strings are converted to NULL in Supabase
- **Date format**: Ensure dates are in YYYY-MM-DD format

## Next Steps

After migration, you'll want to:
1. Update your app to use Supabase instead of localStorage
2. Set up authentication if needed
3. Test the new data flow
