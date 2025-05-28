# Comprehensive Testing Guide - Dukaan Project

This guide provides thorough testing procedures to make your Dukaan application bulletproof.

## 🧪 Testing Strategy Overview

### Testing Levels

1. **Unit Tests** - Individual components and functions
2. **Integration Tests** - API endpoints and database operations
3. **End-to-End Tests** - Complete user workflows
4. **Security Tests** - Authentication and authorization
5. **Performance Tests** - Load and stress testing
6. **M-Pesa Integration Tests** - Payment flow validation

## 📋 Pre-Testing Checklist

### Environment Setup

- [ ] Database migration applied (`supabase db push`)
- [ ] M-Pesa sandbox credentials configured
- [ ] Development server running (`npm run dev`)
- [ ] Supabase project accessible
- [ ] All environment variables set

### Test Data Preparation

- [ ] Admin user created
- [ ] Shop owner user created
- [ ] Test shops created
- [ ] Test categories available
- [ ] Test payment records

## 🔐 Authentication Testing

### Test Cases

#### 1. Sign Up Flow

```bash
# Test valid signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Results:**

- [ ] User created in auth.users
- [ ] Profile created in profiles table
- [ ] Email confirmation sent (if enabled)
- [ ] Proper redirect to confirmation page

#### 2. Sign In Flow

```bash
# Test valid login
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Results:**

- [ ] Successful authentication
- [ ] Session created
- [ ] Redirect to appropriate dashboard
- [ ] User role properly identified

#### 3. Error Handling Tests

**Test Cases:**

- [ ] Invalid email format
- [ ] Weak password
- [ ] Existing email signup
- [ ] Non-existent user login
- [ ] Wrong password
- [ ] Rate limiting

**Validation:**

- [ ] User-friendly error messages displayed
- [ ] No sensitive information leaked
- [ ] Proper error codes returned
- [ ] Form validation working

## 🏪 Shop Management Testing

### API Endpoint Tests

#### 1. Create Shop

```bash
curl -X POST http://localhost:3000/api/shops \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Shop",
    "industry": "Fashion",
    "shop_number": "A123",
    "city": "Nairobi",
    "mall": "Test Mall",
    "whatsapp_number": "254712345678"
  }'
```

**Validation:**

- [ ] Shop created with correct data
- [ ] Owner_id properly set
- [ ] Status defaults to 'pending'
- [ ] Timestamps set correctly
- [ ] RLS policies enforced

#### 2. Update Shop

```bash
curl -X PUT http://localhost:3000/api/shops/SHOP_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Updated Shop Name",
    "status": "approved"
  }'
```

**Validation:**

- [ ] Only owner can update own shop
- [ ] Admin can update any shop
- [ ] Status changes properly tracked
- [ ] Updated_at timestamp updated

#### 3. Shop Permissions

**Test Cases:**

- [ ] Shop owner can view own shops
- [ ] Shop owner cannot view other shops
- [ ] Admin can view all shops
- [ ] Public can view approved shops only
- [ ] Unauthorized users cannot access

## 💳 M-Pesa Payment Testing

### 1. STK Push Initiation

#### Valid Payment Test

```bash
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

**Expected Results:**

- [ ] STK push sent successfully
- [ ] Payment record created in database
- [ ] Checkout request ID stored
- [ ] Phone number validated and formatted
- [ ] Amount validated (positive integer)

#### Edge Cases Testing

```bash
# Invalid phone number
curl -X POST http://localhost:3000/api/payments/mpesa-stk-push \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "123456789",
    "amount": 100,
    "shopName": "Test Shop",
    "accountReference": "TEST_SHOP",
    "transactionDesc": "Test payment"
  }'

# Zero amount
curl -X POST http://localhost:3000/api/payments/mpesa-stk-push \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "254712345678",
    "amount": 0,
    "shopName": "Test Shop",
    "accountReference": "TEST_SHOP",
    "transactionDesc": "Test payment"
  }'

# Missing fields
curl -X POST http://localhost:3000/api/payments/mpesa-stk-push \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "254712345678"
  }'
```

**Validation:**

- [ ] Invalid phone numbers rejected
- [ ] Zero/negative amounts rejected
- [ ] Missing required fields handled
- [ ] Proper error messages returned

### 2. Callback Handling

#### Successful Payment Callback

```bash
curl -X PUT http://localhost:3000/api/payments/mpesa-stk-push \
  -H "Content-Type: application/json" \
  -d '{
    "Body": {
      "stkCallback": {
        "MerchantRequestID": "test-merchant-id",
        "CheckoutRequestID": "test-checkout-id",
        "ResultCode": 0,
        "ResultDesc": "The service request is processed successfully.",
        "CallbackMetadata": {
          "Item": [
            {
              "Name": "MpesaReceiptNumber",
              "Value": "TEST123456"
            },
            {
              "Name": "TransactionDate",
              "Value": "20250125120000"
            },
            {
              "Name": "PhoneNumber",
              "Value": "254712345678"
            }
          ]
        }
      }
    }
  }'
```

**Expected Results:**

- [ ] Payment status updated to 'paid'
- [ ] Receipt number stored
- [ ] Payment date set
- [ ] Transaction ID updated

#### Failed Payment Callback

```bash
curl -X PUT http://localhost:3000/api/payments/mpesa-stk-push \
  -H "Content-Type: application/json" \
  -d '{
    "Body": {
      "stkCallback": {
        "MerchantRequestID": "test-merchant-id",
        "CheckoutRequestID": "test-checkout-id",
        "ResultCode": 1,
        "ResultDesc": "The balance is insufficient for the transaction."
      }
    }
  }'
```

**Expected Results:**

- [ ] Payment status updated to 'failed'
- [ ] Error description stored in notes
- [ ] No receipt number set

## 🗄️ Database Testing

### 1. Data Integrity Tests

#### SQL Validation Queries

```sql
-- Test user profile creation
SELECT COUNT(*) FROM profiles WHERE email = 'test@example.com';

-- Test shop creation
SELECT * FROM shops WHERE name = 'Test Shop';

-- Test payment records
SELECT
  p.*,
  s.name as shop_name
FROM payments p
LEFT JOIN shops s ON p.shop_id = s.id
WHERE p.payment_method = 'M-Pesa'
ORDER BY p.created_at DESC;

-- Test RLS policies
SET ROLE authenticated;
SELECT * FROM shops; -- Should only show user's shops

-- Test indexes performance
EXPLAIN ANALYZE SELECT * FROM payments WHERE mpesa_checkout_request_id = 'test-id';
```

### 2. Constraint Testing

#### Test Data Validation

```sql
-- Test invalid status
INSERT INTO shops (name, status) VALUES ('Test', 'invalid_status'); -- Should fail

-- Test required fields
INSERT INTO shops (name) VALUES ('Test'); -- Should fail due to missing required fields

-- Test foreign key constraints
INSERT INTO payments (shop_id) VALUES ('non-existent-id'); -- Should fail
```

### 3. Performance Testing

#### Load Testing Queries

```sql
-- Test with large datasets
SELECT COUNT(*) FROM payments WHERE created_at > NOW() - INTERVAL '30 days';

-- Test complex joins
SELECT
  s.name,
  COUNT(p.id) as payment_count,
  SUM(p.amount) as total_amount
FROM shops s
LEFT JOIN payments p ON s.id = p.shop_id
GROUP BY s.id, s.name
ORDER BY total_amount DESC;
```

## 🔒 Security Testing

### 1. Authentication Security

#### Test Cases

- [ ] JWT token validation
- [ ] Session expiration handling
- [ ] Password strength requirements
- [ ] Rate limiting on auth endpoints
- [ ] CSRF protection

#### SQL Injection Tests

```bash
# Test malicious input
curl -X POST http://localhost:3000/api/shops \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test'; DROP TABLE shops; --",
    "industry": "Fashion"
  }'
```

**Expected:** Input should be sanitized, no SQL injection possible

### 2. Authorization Testing

#### RLS Policy Validation

```sql
-- Test as shop owner
SET ROLE authenticated;
SET request.jwt.claims TO '{"sub": "shop-owner-id", "role": "shop_owner"}';
SELECT * FROM payments; -- Should only see own payments

-- Test as admin
SET request.jwt.claims TO '{"sub": "admin-id", "role": "admin"}';
SELECT * FROM payments; -- Should see all payments
```

### 3. Data Privacy

#### PII Protection Tests

- [ ] Phone numbers properly formatted/masked
- [ ] Email addresses not exposed in logs
- [ ] Payment details secured
- [ ] User data properly anonymized in analytics

## 🚀 Performance Testing

### 1. Load Testing

#### API Endpoint Load Tests

```bash
# Install artillery for load testing
npm install -g artillery

# Create load test config
cat > load-test.yml << EOF
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "API Load Test"
    requests:
      - get:
          url: "/api/shops"
      - post:
          url: "/api/payments/mpesa-stk-push"
          json:
            phoneNumber: "254712345678"
            amount: 100
            shopName: "Load Test Shop"
            accountReference: "LOAD_TEST"
            transactionDesc: "Load test payment"
EOF

# Run load test
artillery run load-test.yml
```

### 2. Database Performance

#### Query Performance Tests

```sql
-- Test slow queries
EXPLAIN ANALYZE SELECT * FROM payments
WHERE created_at BETWEEN '2025-01-01' AND '2025-12-31';

-- Test index usage
EXPLAIN ANALYZE SELECT * FROM payments
WHERE mpesa_checkout_request_id = 'test-id';

-- Test join performance
EXPLAIN ANALYZE SELECT
  s.name,
  p.amount,
  p.status
FROM shops s
JOIN payments p ON s.id = p.shop_id
WHERE s.status = 'approved';
```

## 🔄 End-to-End Testing

### 1. Complete User Workflows

#### Shop Owner Journey

1. **Sign Up**

   - [ ] Create account
   - [ ] Verify email (if enabled)
   - [ ] Complete profile

2. **Shop Management**

   - [ ] Create shop
   - [ ] Wait for admin approval
   - [ ] Update shop details

3. **Payment Flow**
   - [ ] View payment due
   - [ ] Initiate M-Pesa payment
   - [ ] Receive STK push
   - [ ] Complete payment
   - [ ] Verify payment status

#### Admin Journey

1. **Dashboard Access**

   - [ ] Login as admin
   - [ ] View admin dashboard
   - [ ] Check analytics

2. **Shop Management**

   - [ ] View pending shops
   - [ ] Approve/reject shops
   - [ ] Send reminders

3. **Payment Monitoring**
   - [ ] View all payments
   - [ ] Track payment status
   - [ ] Generate reports

### 2. Error Recovery Testing

#### Network Failure Scenarios

- [ ] M-Pesa API timeout handling
- [ ] Database connection loss
- [ ] Partial payment completion
- [ ] Callback delivery failure

#### Data Consistency Tests

- [ ] Concurrent payment attempts
- [ ] Duplicate callback handling
- [ ] Race condition prevention

## 📊 Monitoring and Logging

### 1. Application Monitoring

#### Key Metrics to Track

- [ ] API response times
- [ ] Error rates
- [ ] Payment success rates
- [ ] Database query performance
- [ ] User session duration

#### Log Analysis

```bash
# Check application logs
tail -f logs/application.log | grep ERROR

# Monitor M-Pesa transactions
grep "M-Pesa" logs/application.log | tail -20

# Check database performance
grep "slow query" logs/database.log
```

### 2. Alert Configuration

#### Critical Alerts

- [ ] Payment failure rate > 5%
- [ ] API response time > 2s
- [ ] Database connection errors
- [ ] M-Pesa callback failures
- [ ] Authentication failures

## 🧪 Test Automation

### 1. Automated Test Suite

Create comprehensive test files:

#### Unit Tests (`tests/unit/`)

- [ ] Component rendering tests
- [ ] Utility function tests
- [ ] Validation logic tests

#### Integration Tests (`tests/integration/`)

- [ ] API endpoint tests
- [ ] Database operation tests
- [ ] M-Pesa integration tests

#### E2E Tests (`tests/e2e/`)

- [ ] User workflow tests
- [ ] Cross-browser testing
- [ ] Mobile responsiveness

### 2. Continuous Testing

#### CI/CD Pipeline Tests

```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: "18"
      - name: Install dependencies
        run: npm install
      - name: Run unit tests
        run: npm run test:unit
      - name: Run integration tests
        run: npm run test:integration
      - name: Run E2E tests
        run: npm run test:e2e
```

## 📋 Testing Checklist

### Pre-Production Checklist

- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Security tests passed
- [ ] Performance benchmarks met
- [ ] M-Pesa sandbox testing complete
- [ ] Database migrations tested
- [ ] Error handling validated
- [ ] Monitoring configured
- [ ] Backup procedures tested

### Production Readiness

- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Data privacy compliance
- [ ] Disaster recovery tested
- [ ] Documentation complete
- [ ] Team training completed

## 🚨 Emergency Procedures

### Rollback Plan

1. **Database Rollback**

   ```bash
   supabase db reset
   supabase db push --include-all
   ```

2. **Application Rollback**

   ```bash
   git revert HEAD
   npm run build
   npm run deploy
   ```

3. **M-Pesa Integration Issues**
   - Switch to maintenance mode
   - Disable payment processing
   - Contact Safaricom support
   - Implement manual payment tracking

This comprehensive testing guide ensures your Dukaan application is bulletproof and production-ready!
