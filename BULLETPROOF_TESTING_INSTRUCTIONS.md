# 🛡️ Bulletproof Testing Instructions for Dukaan Project

This document provides step-by-step instructions to thoroughly test and bulletproof your Dukaan application.

## 🚀 Quick Start Testing

### Step 1: Setup Testing Environment

```bash
# Make the setup script executable and run it
chmod +x scripts/setup-testing.sh
./scripts/setup-testing.sh
```

### Step 2: Apply Database Migration

```bash
# Apply the M-Pesa enhancement migration
supabase db push
```

### Step 3: Add M-Pesa Credentials

Update your `.env.local` file with M-Pesa sandbox credentials:

```env
# Add these to your existing .env.local
MPESA_CONSUMER_KEY=your_sandbox_consumer_key
MPESA_CONSUMER_SECRET=your_sandbox_consumer_secret
MPESA_BUSINESS_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa-stk-push
```

### Step 4: Start Development Server

```bash
npm run dev
```

### Step 5: Run Comprehensive Tests

```bash
# Run the automated test suite
node scripts/test-runner.js
```

## 📋 Detailed Testing Procedures

### 1. Environment Validation

#### Check Prerequisites

- [ ] Node.js 18+ installed
- [ ] Supabase project configured
- [ ] Environment variables set
- [ ] Database migrations applied

#### Verify Setup

```bash
# Check Node version
node --version

# Check if server starts
npm run dev

# Verify database connection
curl http://localhost:3000/api/categories
```

### 2. Database Testing

#### Test Database Schema

```sql
-- Connect to your Supabase database and run:

-- Verify M-Pesa fields exist
\d payments;

-- Test data integrity
SELECT COUNT(*) FROM profiles;
SELECT COUNT(*) FROM shops;
SELECT COUNT(*) FROM categories;

-- Test RLS policies
SELECT * FROM shops LIMIT 1;
```

#### Test Database Performance

```sql
-- Check index usage
EXPLAIN ANALYZE SELECT * FROM payments WHERE mpesa_checkout_request_id = 'test';

-- Test complex queries
EXPLAIN ANALYZE SELECT
  s.name,
  COUNT(p.id) as payment_count
FROM shops s
LEFT JOIN payments p ON s.id = p.shop_id
GROUP BY s.id, s.name;
```

### 3. Authentication Testing

#### Test Sign Up Flow

```bash
# Test valid signup
curl -X POST http://localhost:3000/sign-up \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "first-name=Test&last-name=User&email=test@example.com&password=password123"

# Test invalid email
curl -X POST http://localhost:3000/sign-up \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "first-name=Test&last-name=User&email=invalid-email&password=password123"

# Test weak password
curl -X POST http://localhost:3000/sign-up \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "first-name=Test&last-name=User&email=test2@example.com&password=123"
```

#### Test Sign In Flow

```bash
# Test valid login
curl -X POST http://localhost:3000/sign-in \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=test@example.com&password=password123"

# Test invalid credentials
curl -X POST http://localhost:3000/sign-in \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=nonexistent@example.com&password=wrongpassword"
```

### 4. M-Pesa Payment Testing

#### Test STK Push Validation

```bash
# Test valid payment request
curl -X POST http://localhost:3000/api/payments/mpesa-stk-push \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "254712345678",
    "amount": 100,
    "shopName": "Test Shop",
    "accountReference": "TEST_SHOP",
    "transactionDesc": "Test payment"
  }'

# Test invalid phone number
curl -X POST http://localhost:3000/api/payments/mpesa-stk-push \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "123456789",
    "amount": 100,
    "shopName": "Test Shop",
    "accountReference": "TEST_SHOP",
    "transactionDesc": "Test payment"
  }'

# Test zero amount
curl -X POST http://localhost:3000/api/payments/mpesa-stk-push \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "254712345678",
    "amount": 0,
    "shopName": "Test Shop",
    "accountReference": "TEST_SHOP",
    "transactionDesc": "Test payment"
  }'
```

#### Test Callback Handling

```bash
# Test successful payment callback
curl -X PUT http://localhost:3000/api/payments/mpesa-stk-push \
  -H "Content-Type: application/json" \
  -d '{
    "Body": {
      "stkCallback": {
        "MerchantRequestID": "test-merchant-id",
        "CheckoutRequestID": "test-checkout-id",
        "ResultCode": 0,
        "ResultDesc": "Success",
        "CallbackMetadata": {
          "Item": [
            {"Name": "MpesaReceiptNumber", "Value": "TEST123456"},
            {"Name": "TransactionDate", "Value": "20250125120000"},
            {"Name": "PhoneNumber", "Value": "254712345678"}
          ]
        }
      }
    }
  }'

# Test failed payment callback
curl -X PUT http://localhost:3000/api/payments/mpesa-stk-push \
  -H "Content-Type: application/json" \
  -d '{
    "Body": {
      "stkCallback": {
        "MerchantRequestID": "test-merchant-id",
        "CheckoutRequestID": "test-checkout-id",
        "ResultCode": 1,
        "ResultDesc": "Insufficient balance"
      }
    }
  }'
```

### 5. Security Testing

#### Test SQL Injection Prevention

```bash
# Test malicious shop creation
curl -X POST http://localhost:3000/api/shops \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test'\'''; DROP TABLE shops; --",
    "industry": "Fashion",
    "shop_number": "A123",
    "city": "Nairobi",
    "mall": "Test Mall",
    "whatsapp_number": "254712345678"
  }'

# Verify shops table still exists
curl http://localhost:3000/api/shops
```

#### Test XSS Prevention

```bash
# Test XSS in shop name
curl -X POST http://localhost:3000/api/shops \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<script>alert(\"xss\")</script>",
    "industry": "Fashion",
    "shop_number": "A123",
    "city": "Nairobi",
    "mall": "Test Mall",
    "whatsapp_number": "254712345678"
  }'
```

### 6. Performance Testing

#### Test API Response Times

```bash
# Test API performance
time curl http://localhost:3000/api/shops
time curl http://localhost:3000/api/categories
time curl http://localhost:3000/api/payments
```

#### Run Load Tests

```bash
# Install artillery if not already installed
npm install -g artillery

# Run load test
artillery run tests/load-test.yml
```

### 7. End-to-End Testing

#### Manual Browser Testing

1. **User Registration Flow**

   - [ ] Visit `/sign-up`
   - [ ] Try invalid email format
   - [ ] Try weak password
   - [ ] Complete valid registration
   - [ ] Verify error messages display correctly

2. **User Login Flow**

   - [ ] Visit `/sign-in`
   - [ ] Try non-existent user
   - [ ] Try wrong password
   - [ ] Complete valid login
   - [ ] Verify error messages display correctly

3. **Shop Owner Dashboard**

   - [ ] Create a shop
   - [ ] View payment due
   - [ ] Initiate M-Pesa payment
   - [ ] Test phone number validation
   - [ ] Verify payment status updates

4. **Admin Panel**
   - [ ] Login as admin
   - [ ] View all shops
   - [ ] Approve/reject shops
   - [ ] View payment analytics
   - [ ] Verify consistent styling

### 8. Mobile Testing

#### Responsive Design

- [ ] Test on mobile devices
- [ ] Verify M-Pesa dialog works on mobile
- [ ] Check admin panel mobile view
- [ ] Test touch interactions

#### Mobile Payment Flow

- [ ] Test M-Pesa STK push on actual mobile device
- [ ] Verify payment notifications
- [ ] Test payment completion flow

### 9. Error Handling Testing

#### Network Failures

- [ ] Disconnect internet during payment
- [ ] Test timeout scenarios
- [ ] Verify graceful error handling

#### Database Failures

- [ ] Test with database offline
- [ ] Verify error messages
- [ ] Test recovery procedures

### 10. Production Readiness

#### Security Checklist

- [ ] All environment variables secured
- [ ] No sensitive data in logs
- [ ] HTTPS configured for production
- [ ] Rate limiting implemented
- [ ] Input validation comprehensive

#### Performance Checklist

- [ ] API responses < 2 seconds
- [ ] Database queries optimized
- [ ] Images optimized
- [ ] Caching implemented
- [ ] CDN configured

#### Monitoring Checklist

- [ ] Error tracking configured
- [ ] Performance monitoring setup
- [ ] Payment success rate tracking
- [ ] Database performance monitoring
- [ ] Alert thresholds configured

## 🚨 Critical Test Scenarios

### Scenario 1: High Traffic Payment Processing

```bash
# Simulate 100 concurrent payment requests
for i in {1..100}; do
  curl -X POST http://localhost:3000/api/payments/mpesa-stk-push \
    -H "Content-Type: application/json" \
    -d '{
      "phoneNumber": "254712345678",
      "amount": 100,
      "shopName": "Load Test Shop '$i'",
      "accountReference": "LOAD_TEST_'$i'",
      "transactionDesc": "Load test payment '$i'"
    }' &
done
wait
```

### Scenario 2: Database Stress Test

```sql
-- Create test data
INSERT INTO shops (name, industry, shop_number, city, mall, whatsapp_number)
SELECT
  'Test Shop ' || generate_series,
  'Fashion',
  'A' || generate_series,
  'Nairobi',
  'Test Mall',
  '254712345678'
FROM generate_series(1, 1000);

-- Test query performance
EXPLAIN ANALYZE SELECT * FROM shops WHERE city = 'Nairobi';
```

### Scenario 3: Payment Callback Flood

```bash
# Simulate multiple callbacks
for i in {1..50}; do
  curl -X PUT http://localhost:3000/api/payments/mpesa-stk-push \
    -H "Content-Type: application/json" \
    -d '{
      "Body": {
        "stkCallback": {
          "MerchantRequestID": "test-merchant-'$i'",
          "CheckoutRequestID": "test-checkout-'$i'",
          "ResultCode": 0,
          "ResultDesc": "Success"
        }
      }
    }' &
done
wait
```

## 📊 Success Criteria

### Functional Requirements

- [ ] All authentication flows work correctly
- [ ] M-Pesa payments process successfully
- [ ] Admin panel functions properly
- [ ] Error handling is comprehensive
- [ ] Database operations are reliable

### Performance Requirements

- [ ] API response times < 2 seconds
- [ ] Payment processing < 5 seconds
- [ ] Database queries < 1 second
- [ ] Page load times < 3 seconds
- [ ] 99.9% uptime target

### Security Requirements

- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] Authentication bypass prevented
- [ ] Authorization controls working
- [ ] Data privacy maintained

### User Experience Requirements

- [ ] Error messages are user-friendly
- [ ] Payment flow is intuitive
- [ ] Mobile experience is smooth
- [ ] Admin interface is consistent
- [ ] Loading states are clear

## 🎯 Final Validation

### Pre-Production Checklist

- [ ] All automated tests pass
- [ ] Manual testing complete
- [ ] Security audit passed
- [ ] Performance benchmarks met
- [ ] Error handling validated
- [ ] Documentation complete
- [ ] Team training done
- [ ] Monitoring configured
- [ ] Backup procedures tested
- [ ] Rollback plan ready

### Go-Live Checklist

- [ ] Production environment configured
- [ ] M-Pesa production credentials added
- [ ] SSL certificates installed
- [ ] Domain configured
- [ ] CDN setup complete
- [ ] Monitoring alerts active
- [ ] Support team briefed
- [ ] Launch plan executed

## 🚀 Congratulations!

If you've completed all these tests successfully, your Dukaan application is now **bulletproof** and ready for production! 🎉

Your application now has:

- ✅ Robust M-Pesa payment integration
- ✅ Comprehensive error handling
- ✅ Strong security measures
- ✅ Excellent performance
- ✅ Thorough testing coverage
- ✅ Production-ready monitoring

**Your Dukaan marketplace is ready to serve customers reliably and securely!**
