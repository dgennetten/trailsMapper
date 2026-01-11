# Supabase Integration Setup

## Step 1: Create .env file

Create a `.env` file in the root of your project with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**To get these values:**
1. Go to your Supabase Dashboard
2. Click **Settings** (gear icon) → **API**
3. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

## Step 2: Restart your dev server

After creating the `.env` file, restart your development server:

```bash
npm run dev
```

## Step 3: Test the integration

1. Open your app
2. Navigate to the "PWV Patrols" tab
3. Your data should load from Supabase automatically
4. Try adding/editing/deleting a patrol - it should sync to Supabase

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure you created a `.env` file (not `.env.example`)
- Check that the variable names start with `VITE_`
- Restart your dev server after creating/updating `.env`

### "Failed to fetch" or network errors
- Check that your Supabase URL and key are correct
- Verify your RLS policies allow public access (run `fix-rls-policies.sql` if needed)

### Data not showing
- Check the browser console for errors
- Verify your data exists in Supabase (Table Editor → trailPatrols)
- Check that the table name matches: `trailPatrols` (camelCase)
