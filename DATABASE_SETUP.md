# Database Setup Guide

This guide will help you set up and configure your Supabase database for the Dukaan application with M-Pesa integration.

## Current Database Status

✅ **Supabase Configuration**: Your database is properly configured with the following connection details:

- **Project URL**: `https://kqnvnxajcifcmntjxrzg.supabase.co`
- **Environment**: Production-ready with proper authentication

## Database Schema

Your database includes the following tables:

### Core Tables

1. **profiles** - User profiles extending auth.users
2. **shops** - Shop information and status
3. **payments** - Payment records with M-Pesa integration
4. **categories** - Shop categories
5. **payment_reminders** - Payment reminder tracking

### M-Pesa Enhanced Fields

The payments table has been enhanced with M-Pesa specific fields:

- `mpesa_checkout_request_id` - STK Push tracking ID
- `mpesa_merchant_request_id` - Merchant request ID
- `mpesa_receipt_number` - M-Pesa receipt for successful payments
- `phone_number` - Phone number used for payment

## Required Migrations

You need to apply the following migration to add M-Pesa fields:

```bash
# Apply the M-Pesa enhancement migration
supabase db push
```

Or manually run the migration file: `supabase/migrations/20250525_add_mpesa_fields.sql`

## Environment Variables Setup

Add these M-Pesa configuration variables to your `.env.local`:

```env
# M-Pesa Configuration (Add these to your existing .env.local)
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_BUSINESS_SHORTCODE=your_business_shortcode
MPESA_PASSKEY=your_mpesa_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa-stk-push
```

## Getting M-Pesa Credentials

### For Development (Sandbox):

1. Visit [Safaricom Developer Portal](https://developer.safaricom.co.ke/)
2. Create an account and log in
3. Create a new app for "Lipa Na M-Pesa Online"
4. Get your sandbox credentials:
   - Consumer Key
   - Consumer Secret
   - Business Short Code (use test shortcode: 174379)
   - Passkey (use test passkey provided in documentation)

### For Production:

1. Apply for Lipa Na M-Pesa Online on the Safaricom portal
2. Complete the integration testing
3. Get production credentials after approval

## Database Access Methods

### 1. Supabase Dashboard

- URL: https://supabase.com/dashboard/project/kqnvnxajcifcmntjxrzg
- Access: Use your Supabase account credentials

### 2. Direct SQL Access

```sql
-- Example: View all payments with M-Pesa details
SELECT
  p.*,
  s.name as shop_name,
  pr.full_name as owner_name
FROM payments p
LEFT JOIN shops s ON p.shop_id = s.id
LEFT JOIN profiles pr ON s.owner_id = pr.id
WHERE p.payment_method = 'M-Pesa'
ORDER BY p.created_at DESC;
```

### 3. API Access

Your application uses the database through:

- Supabase client in `src/utils/supabase/client.ts`
- Database helper in `src/lib/database.ts`
- API routes in `src/app/api/`

## Row Level Security (RLS)

Your database has proper RLS policies configured:

### Profiles

- Users can view/update their own profile
- Admins can view all profiles

### Shops

- Shop owners can manage their own shops
- Admins can manage all shops
- Public can view approved shops

### Payments

- Shop owners can view their own payments
- Admins can view all payments

## Testing Database Integration

### 1. Test M-Pesa Payment Flow

```bash
# Test STK Push (replace with actual values)
curl -X POST http://localhost:3000/api/payments/mpesa-stk-push \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "254712345678",
    "amount": 100,
    "shopName": "Test Shop",
    "accountReference": "TEST_SHOP",
    "transactionDesc": "Test payment"
  }'
```

### 2. Verify Database Records

Check the payments table after testing:

```sql
SELECT * FROM payments
WHERE payment_method = 'M-Pesa'
ORDER BY created_at DESC
LIMIT 5;
```

## Monitoring and Maintenance

### 1. Payment Status Monitoring

```sql
-- Check payment status distribution
SELECT status, COUNT(*) as count
FROM payments
WHERE payment_method = 'M-Pesa'
GROUP BY status;
```

### 2. Failed Payments Analysis

```sql
-- Analyze failed payments
SELECT
  phone_number,
  amount,
  notes,
  created_at
FROM payments
WHERE status = 'failed' AND payment_method = 'M-Pesa'
ORDER BY created_at DESC;
```

### 3. Performance Monitoring

The database includes optimized indexes for:

- M-Pesa checkout request ID lookups
- Phone number searches
- Payment status filtering
- Shop and user relationships

## Backup and Recovery

### Automated Backups

Supabase provides automatic daily backups for your project.

### Manual Backup

```bash
# Export specific tables
supabase db dump --data-only --table payments > payments_backup.sql
supabase db dump --data-only --table shops > shops_backup.sql
```

## Troubleshooting

### Common Issues

1. **M-Pesa Callback Not Working**

   - Ensure callback URL is publicly accessible
   - Check firewall settings
   - Verify HTTPS certificate

2. **Payment Status Not Updating**

   - Check M-Pesa callback logs
   - Verify database permissions
   - Check RLS policies

3. **Database Connection Issues**
   - Verify environment variables
   - Check Supabase project status
   - Confirm API keys are valid

### Debug Queries

```sql
-- Check recent M-Pesa transactions
SELECT
  mpesa_checkout_request_id,
  status,
  amount,
  phone_number,
  created_at,
  payment_date
FROM payments
WHERE payment_method = 'M-Pesa'
AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

## Next Steps

1. ✅ Database schema is ready
2. ⏳ Apply M-Pesa migration: `supabase db push`
3. ⏳ Add M-Pesa credentials to `.env.local`
4. ⏳ Test payment flow in development
5. ⏳ Set up production M-Pesa credentials
6. ⏳ Configure callback URL for production

Your database is now fully configured for M-Pesa integration with proper tracking, security, and monitoring capabilities.
