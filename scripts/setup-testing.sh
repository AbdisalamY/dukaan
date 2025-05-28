#!/bin/bash

# Setup Testing Environment for Dukaan Project
# This script prepares your environment for comprehensive testing

set -e  # Exit on any error

echo "🚀 Setting up Dukaan testing environment..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the dukaan project root directory"
    exit 1
fi

print_status "Checking project structure..."

# 1. Check Node.js and npm
print_status "Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js found: $NODE_VERSION"
else
    print_error "Node.js not found. Please install Node.js 18 or higher"
    exit 1
fi

# 2. Install dependencies
print_status "Installing dependencies..."
npm install
print_success "Dependencies installed"

# 3. Check environment variables
print_status "Checking environment variables..."
if [ ! -f ".env.local" ]; then
    print_warning ".env.local not found. Creating from .env.example..."
    cp .env.example .env.local
    print_warning "Please update .env.local with your actual credentials"
else
    print_success ".env.local found"
fi

# Check required environment variables
ENV_VARS=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "SUPABASE_SERVICE_ROLE_KEY")
MISSING_VARS=()

for var in "${ENV_VARS[@]}"; do
    if ! grep -q "^$var=" .env.local; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    print_warning "Missing environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    print_warning "Please update .env.local with the missing variables"
fi

# 4. Check Supabase CLI
print_status "Checking Supabase CLI..."
if command -v supabase &> /dev/null; then
    SUPABASE_VERSION=$(supabase --version)
    print_success "Supabase CLI found: $SUPABASE_VERSION"
else
    print_warning "Supabase CLI not found. Installing..."
    npm install -g supabase
    print_success "Supabase CLI installed"
fi

# 5. Apply database migrations
print_status "Checking database migrations..."
if [ -d "supabase/migrations" ]; then
    print_status "Applying database migrations..."
    # Note: This requires Supabase to be linked to your project
    # supabase db push
    print_warning "Please run 'supabase db push' manually to apply migrations"
    print_success "Migration files found"
else
    print_error "Migration directory not found"
fi

# 6. Build the project
print_status "Building the project..."
npm run build
print_success "Project built successfully"

# 7. Make test scripts executable
print_status "Setting up test scripts..."
chmod +x scripts/test-runner.js
chmod +x scripts/setup-testing.sh
print_success "Test scripts are executable"

# 8. Create test data directory
print_status "Creating test data directory..."
mkdir -p tests/data
mkdir -p tests/logs
print_success "Test directories created"

# 9. Install testing dependencies
print_status "Installing testing dependencies..."
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev artillery  # For load testing
print_success "Testing dependencies installed"

# 10. Create package.json test scripts
print_status "Adding test scripts to package.json..."
cat > temp_package_scripts.json << 'EOF'
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "test:integration": "node scripts/test-runner.js",
  "test:load": "artillery run tests/load-test.yml",
  "test:all": "npm run test && npm run test:integration"
}
EOF

# Note: In a real scenario, you'd merge these scripts into package.json
print_warning "Please add the following scripts to your package.json:"
cat temp_package_scripts.json
rm temp_package_scripts.json

# 11. Create basic test configuration
print_status "Creating test configuration..."
cat > jest.config.js << 'EOF'
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    // Handle module aliases (this will be automatically configured for you based on your tsconfig.json paths)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
EOF

cat > jest.setup.js << 'EOF'
import '@testing-library/jest-dom'
EOF

print_success "Jest configuration created"

# 12. Create sample load test configuration
print_status "Creating load test configuration..."
mkdir -p tests
cat > tests/load-test.yml << 'EOF'
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 5
  defaults:
    headers:
      Content-Type: 'application/json'

scenarios:
  - name: "Basic API Load Test"
    weight: 70
    requests:
      - get:
          url: "/api/categories"
      - get:
          url: "/api/shops"

  - name: "M-Pesa Payment Test"
    weight: 30
    requests:
      - post:
          url: "/api/payments/mpesa-stk-push"
          json:
            phoneNumber: "254712345678"
            amount: 100
            shopName: "Load Test Shop"
            accountReference: "LOAD_TEST"
            transactionDesc: "Load test payment"
EOF

print_success "Load test configuration created"

# 13. Create testing checklist
print_status "Creating testing checklist..."
cat > TESTING_CHECKLIST.md << 'EOF'
# Testing Checklist for Dukaan Project

## Pre-Testing Setup
- [ ] Environment variables configured in .env.local
- [ ] Database migrations applied (`supabase db push`)
- [ ] M-Pesa sandbox credentials added
- [ ] Development server running (`npm run dev`)
- [ ] Dependencies installed (`npm install`)

## Quick Tests
- [ ] Run automated tests: `node scripts/test-runner.js`
- [ ] Run unit tests: `npm test`
- [ ] Run load tests: `npm run test:load`

## Manual Testing
- [ ] Test user registration and login
- [ ] Test shop creation and management
- [ ] Test M-Pesa payment flow
- [ ] Test admin panel functionality
- [ ] Test error handling

## Security Testing
- [ ] Test SQL injection prevention
- [ ] Test XSS prevention
- [ ] Test authentication bypass attempts
- [ ] Test authorization controls

## Performance Testing
- [ ] API response times < 2 seconds
- [ ] Database query performance
- [ ] Concurrent user handling
- [ ] Memory usage monitoring

## Production Readiness
- [ ] All tests passing
- [ ] Security audit complete
- [ ] Performance benchmarks met
- [ ] Error monitoring configured
- [ ] Backup procedures tested
EOF

print_success "Testing checklist created"

# Final summary
echo ""
echo "================================================"
print_success "🎉 Testing environment setup complete!"
echo "================================================"
echo ""
print_status "Next steps:"
echo "1. Update .env.local with your actual credentials"
echo "2. Run 'supabase db push' to apply migrations"
echo "3. Start your development server: 'npm run dev'"
echo "4. Run the test suite: 'node scripts/test-runner.js'"
echo ""
print_status "Available test commands:"
echo "  - node scripts/test-runner.js    # Comprehensive automated tests"
echo "  - npm test                       # Unit tests"
echo "  - artillery run tests/load-test.yml  # Load testing"
echo ""
print_status "Documentation:"
echo "  - COMPREHENSIVE_TESTING_GUIDE.md  # Detailed testing procedures"
echo "  - DATABASE_SETUP.md              # Database configuration"
echo "  - TESTING_CHECKLIST.md           # Quick testing checklist"
echo ""
print_success "Your Dukaan application is ready for bulletproof testing! 🚀"
