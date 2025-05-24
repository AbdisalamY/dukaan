# Direct Supabase Access Guide

This guide shows you how to directly access and edit your Supabase database from VSCode using the tools I've created for you.

## 🛠️ Available Methods

### Method 1: VSCode Command Palette (Recommended)

1. **Open Command Palette**: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. **Type**: "Tasks: Run Task"
3. **Select one of these Supabase tasks**:
   - `Supabase: Apply Migration` - Apply database schema
   - `Supabase: Check Status` - Check database status
   - `Supabase: List Tables` - List all tables
   - `Supabase: Add Sample Data` - Add sample shops
   - `Supabase: Create Admin User` - Create admin user
   - `Supabase: Execute Custom SQL` - Run custom SQL

### Method 2: Terminal Commands

Open terminal in VSCode (` Ctrl+``  `) and run:

```bash
# Apply database migration
npm run db:migrate

# Check database status
npm run db:status

# List all tables
npm run db:tables

# Add sample data
npm run db:sample

# Create admin user (will prompt for details)
npm run db:admin

# Execute custom SQL (will prompt for SQL)
npm run db:sql
```

### Method 3: Direct Script Usage

```bash
# Apply migration
node scripts/supabase-manager.js migrate

# Check status
node scripts/supabase-manager.js status

# List tables
node scripts/supabase-manager.js tables

# Create admin user
node scripts/supabase-manager.js create-admin admin@example.com password123 "Admin User"

# Add sample data
node scripts/supabase-manager.js sample-data

# Execute custom SQL
node scripts/supabase-manager.js sql "SELECT * FROM shops"
```

## 🚀 Quick Start Steps

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Up Service Role Key

You need to add your Supabase service role key to `.env.local`:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/kqnvnxajcifcmntjxrzg)
2. Go to Settings → API
3. Copy the "service_role" key (not the anon key)
4. Add it to your `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 3: Apply Database Migration

**Option A: Using VSCode Command Palette**

1. Press `Ctrl+Shift+P`
2. Type "Tasks: Run Task"
3. Select "Supabase: Apply Migration"

**Option B: Using Terminal**

```bash
npm run db:migrate
```

### Step 4: Check Database Status

```bash
npm run db:status
```

### Step 5: Create Admin User

```bash
npm run db:admin
# Follow prompts to enter email, password, and name
```

### Step 6: Add Sample Data (Optional)

```bash
npm run db:sample
```

## 📊 What Each Tool Does

### `db:migrate`

- Applies the complete database schema
- Creates all tables (profiles, shops, payments, categories, payment_reminders)
- Sets up Row Level Security (RLS) policies
- Creates triggers and functions

### `db:status`

- Shows how many records are in each table
- Indicates if tables exist and are accessible
- Helps verify migration was successful

### `db:tables`

- Lists all tables in your database
- Useful for verification

### `db:admin`

- Creates a new user with admin privileges
- Automatically sets role to 'admin' in profiles table
- Bypasses email confirmation

### `db:sample`

- Adds sample shop data for testing
- Creates 2 sample shops with approved status

### `db:sql`

- Executes any custom SQL query
- Useful for data manipulation and testing

## 🔧 Advanced Usage

### Custom SQL Examples

```sql
-- View all shops with owner info
SELECT s.*, p.full_name, p.email
FROM shops s
JOIN profiles p ON s.owner_id = p.id;

-- Update shop status
UPDATE shops SET status = 'approved' WHERE name = 'Fashion Hub';

-- Create a payment record
INSERT INTO payments (shop_id, amount, due_date)
VALUES ('shop-uuid-here', 5000.00, '2025-06-01');

-- View payment summary
SELECT
  s.name as shop_name,
  COUNT(p.id) as payment_count,
  SUM(p.amount) as total_amount
FROM shops s
LEFT JOIN payments p ON s.id = p.shop_id
GROUP BY s.id, s.name;
```

### Troubleshooting

**Error: Missing Supabase credentials**

- Make sure `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`
- Verify the key is correct (starts with `eyJ`)

**Error: Migration failed**

- Check if tables already exist
- Verify you have admin access to the database
- Try running individual SQL statements

**Error: Permission denied**

- Make sure you're using the service role key, not the anon key
- Check if RLS policies are blocking access

## 🎯 Real-World Workflow

1. **Initial Setup**:

   ```bash
   npm run db:migrate
   npm run db:admin  # Create your admin account
   npm run db:sample # Add test data
   ```

2. **Development**:

   ```bash
   npm run db:status # Check current state
   npm run db:sql    # Run custom queries
   ```

3. **Data Management**:
   - Use VSCode tasks for quick operations
   - Use custom SQL for complex data manipulation
   - Check status regularly to monitor changes

## 🔐 Security Notes

- The service role key has full database access
- Never commit the service role key to version control
- Use environment variables for all sensitive data
- The tools respect RLS policies when possible

## 📱 Integration with Your App

Once your database is set up:

1. **Update Components**: Replace mock data with API calls
2. **Test Authentication**: Sign up users and verify profile creation
3. **Test Admin Features**: Use your admin account to manage shops
4. **Verify RLS**: Ensure users can only see their own data

This setup gives you complete control over your Supabase database directly from VSCode, making development and testing much more efficient!
