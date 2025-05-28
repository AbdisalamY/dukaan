# Supabase Database Setup Guide

This guide will help you set up your Supabase database and connect your VSCode project to it.

## Prerequisites

1. Supabase CLI installed globally
2. Your Supabase project URL and keys (already in `.env.local`)

## Database Migration Steps

### Option 1: Apply Migration via Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**

   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Navigate to your project: `kqnvnxajcifcmntjxrzg`

2. **Run the Migration**

   - Go to the "SQL Editor" tab
   - Copy the entire content from `supabase/migrations/20250524_initial_schema.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute the migration

3. **Verify Tables Created**
   - Go to the "Table Editor" tab
   - You should see the following tables:
     - `profiles`
     - `shops`
     - `payments`
     - `categories`
     - `payment_reminders`

### Option 2: Apply Migration via CLI (If you have Supabase CLI)

1. **Link to your remote project**

   ```bash
   cd dukaan
   supabase link --project-ref kqnvnxajcifcmntjxrzg
   ```

2. **Apply the migration**
   ```bash
   supabase db push
   ```

## Environment Variables

Make sure your `.env.local` file has the correct values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://kqnvnxajcifcmntjxrzg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxbnZueGFqY2lmY21udGp4cnpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwNzU2MjgsImV4cCI6MjA2MzY1MTYyOH0.WN9UDaAVibk5L9tNyKJvjv9SAjtV-VYWOW7M-sJtseI
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

## Database Schema Overview

### Tables Created:

1. **profiles** - User profiles extending auth.users

   - Links to Supabase auth
   - Stores user role (admin/shop_owner)

2. **shops** - Shop information

   - Owned by users
   - Contains shop details, location, status

3. **payments** - Payment tracking

   - Linked to shops
   - Tracks payment status and history

4. **categories** - Product/shop categories

   - Pre-populated with common categories

5. **payment_reminders** - Payment reminder history
   - Tracks when reminders were sent

### Row Level Security (RLS)

- All tables have RLS enabled
- Users can only access their own data
- Admins have full access
- Public can view approved shops

## Testing the Setup

1. **Start your development server**

   ```bash
   npm run dev
   ```

2. **Test Authentication**

   - Go to `/sign-up` and create a new account
   - Check if a profile is automatically created in the `profiles` table

3. **Test API Endpoints**
   - `/api/shops` - Get shops
   - `/api/payments` - Get payments
   - `/api/categories` - Get categories

## Creating an Admin User

After migration, you'll need to manually set a user as admin:

1. **Sign up a user** through your app
2. **Go to Supabase Dashboard** → Table Editor → profiles
3. **Find your user** and change the `role` from `shop_owner` to `admin`

## API Endpoints Available

### Shops

- `GET /api/shops` - List shops with filters
- `POST /api/shops` - Create new shop
- `GET /api/shops/[id]` - Get specific shop
- `PUT /api/shops/[id]` - Update shop
- `DELETE /api/shops/[id]` - Delete shop

### Payments

- `GET /api/payments` - List payments with filters
- `POST /api/payments` - Create payment (admin only)
- `GET /api/payments/[id]` - Get specific payment
- `PUT /api/payments/[id]` - Update payment (admin only)
- `DELETE /api/payments/[id]` - Delete payment (admin only)

### Categories

- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category (admin only)

## Next Steps

1. **Apply the database migration** using one of the methods above
2. **Test the authentication flow** by signing up
3. **Create an admin user** to access admin features
4. **Update your components** to use the new database instead of mock data

## Troubleshooting

### Common Issues:

1. **Migration fails**

   - Check your Supabase project URL and keys
   - Ensure you have the correct permissions

2. **RLS blocks queries**

   - Make sure users are properly authenticated
   - Check if the user has the correct role

3. **API endpoints return 401**
   - Verify authentication is working
   - Check if the user session is valid

### Getting Help:

- Check Supabase logs in the dashboard
- Use the browser developer tools to inspect network requests
- Verify environment variables are loaded correctly

## Database Client Usage

Use the database client in your components:

```typescript
import { db } from "@/lib/database";

// Get shops
const { shops } = await db.getShops({ status: "approved" });

// Create shop
const { shop } = await db.createShop({
  name: "My Shop",
  industry: "Fashion",
  // ... other fields
});
```

This setup provides a complete database backend for your dukaan application with proper authentication, authorization, and data management.
