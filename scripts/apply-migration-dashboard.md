# Apply Migration via Supabase Dashboard

Since the `exec_sql` function isn't available, here's the easiest way to apply your database migration:

## Step 1: Copy the Migration SQL

The migration file is located at: `supabase/migrations/20250524_initial_schema.sql`

## Step 2: Open Supabase Dashboard

1. Go to [your Supabase project](https://supabase.com/dashboard/project/kqnvnxajcifcmntjxrzg)
2. Click on "SQL Editor" in the left sidebar

## Step 3: Apply the Migration

1. Copy the entire content from `supabase/migrations/20250524_initial_schema.sql`
2. Paste it into the SQL Editor
3. Click "Run" to execute the migration

## Step 4: Verify Success

After running the migration, you should see these tables in the "Table Editor":

- `profiles`
- `shops`
- `payments`
- `categories`
- `payment_reminders`

## Step 5: Test the Tools

Once the migration is applied, you can use the other tools:

```bash
# Check database status
npm run db:status

# Create admin user
npm run db:admin

# Add sample data
npm run db:sample
```

This method is actually more reliable than trying to execute the migration programmatically!
