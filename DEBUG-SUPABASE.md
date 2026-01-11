# Debugging Supabase Connection Issues

## Step 1: Check Browser Console

1. Open your app in the browser
2. Press **F12** to open Developer Tools
3. Go to the **Console** tab
4. Look for error messages - they will now show detailed information

## Step 2: Verify .env File

1. Make sure you have a `.env` file in the project root (same folder as `package.json`)
2. Check the file contents - it should look like:
   ```
   VITE_SUPABASE_URL=https://vuisznmoippkwkcxquzx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. **Important**: No spaces around the `=` sign
4. **Important**: No quotes around the values
5. **Important**: Variable names MUST start with `VITE_`

## Step 3: Restart Dev Server

After creating or modifying `.env`, you MUST restart your dev server:

1. Stop the server (Ctrl+C in terminal)
2. Run `npm run dev` again
3. Vite only reads `.env` files on startup

## Step 4: Check Common Errors

### Error: "Missing Supabase environment variables"
- **Fix**: Create `.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- **Fix**: Restart dev server after creating `.env`

### Error: "relation 'trailPatrols' does not exist"
- **Fix**: Run the SQL schema in Supabase SQL Editor (`scripts/supabase-schema.sql`)

### Error: "new row violates row-level security policy"
- **Fix**: Run the RLS fix script in Supabase SQL Editor (`scripts/fix-rls-policies.sql`)

### Error: "Failed to fetch" or Network Error
- **Fix**: Check your Supabase URL is correct
- **Fix**: Check your anon key is correct
- **Fix**: Verify RLS policies allow public access

### Error: "Invalid API key"
- **Fix**: Get a fresh anon key from Supabase Dashboard → Settings → API

## Step 5: Test Supabase Connection

Open browser console and run:

```javascript
// Check if environment variables are loaded
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing');

// Test connection
import { supabase } from './lib/supabase';
const { data, error } = await supabase.from('trailPatrols').select('count');
console.log('Test result:', { data, error });
```

## Step 6: Verify Data in Supabase

1. Go to Supabase Dashboard
2. Click **Table Editor** → **trailPatrols**
3. Verify your data is there
4. Check the table name is exactly `trailPatrols` (camelCase, case-sensitive)

## Quick Fix Checklist

- [ ] `.env` file exists in project root
- [ ] `.env` has `VITE_SUPABASE_URL` (not `SUPABASE_URL`)
- [ ] `.env` has `VITE_SUPABASE_ANON_KEY` (not `SUPABASE_ANON_KEY`)
- [ ] No spaces around `=` in `.env`
- [ ] No quotes around values in `.env`
- [ ] Dev server restarted after creating `.env`
- [ ] Table `trailPatrols` exists in Supabase
- [ ] RLS policies allow public access
- [ ] Data exists in Supabase table
