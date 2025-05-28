#!/usr/bin/env node

/**
 * Comprehensive Test Runner for Dukaan Project
 * This script automates the testing process to make the application bulletproof
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestRunner {
    constructor() {
        this.baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
        this.testResults = {
            passed: 0,
            failed: 0,
            errors: []
        };
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const colors = {
            info: '\x1b[36m',    // Cyan
            success: '\x1b[32m', // Green
            error: '\x1b[31m',   // Red
            warning: '\x1b[33m', // Yellow
            reset: '\x1b[0m'     // Reset
        };

        console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
    }

    async runTest(testName, testFunction) {
        try {
            this.log(`Running test: ${testName}`, 'info');
            await testFunction();
            this.testResults.passed++;
            this.log(`✅ PASSED: ${testName}`, 'success');
        } catch (error) {
            this.testResults.failed++;
            this.testResults.errors.push({ test: testName, error: error.message });
            this.log(`❌ FAILED: ${testName} - ${error.message}`, 'error');
        }
    }

    async makeRequest(method, endpoint, data = null, headers = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            const responseData = await response.json().catch(() => ({}));

            return {
                status: response.status,
                ok: response.ok,
                data: responseData
            };
        } catch (error) {
            throw new Error(`Request failed: ${error.message}`);
        }
    }

    // Database Tests
    async testDatabaseConnection() {
        // Test if we can connect to the database
        const response = await this.makeRequest('GET', '/api/categories');
        if (!response.ok) {
            throw new Error('Database connection failed');
        }
    }

    async testDatabaseMigrations() {
        // Test if M-Pesa fields exist by trying to query them
        const response = await this.makeRequest('GET', '/api/payments');
        if (!response.ok) {
            throw new Error('Database migrations not applied correctly');
        }
    }

    // Authentication Tests
    async testSignUpValidation() {
        // Test invalid email
        const response1 = await this.makeRequest('POST', '/api/auth/signup', {
            firstName: 'Test',
            lastName: 'User',
            email: 'invalid-email',
            password: 'password123'
        });

        if (response1.ok) {
            throw new Error('Should reject invalid email');
        }

        // Test weak password
        const response2 = await this.makeRequest('POST', '/api/auth/signup', {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            password: '123'
        });

        if (response2.ok) {
            throw new Error('Should reject weak password');
        }
    }

    async testSignInValidation() {
        // Test non-existent user
        const response = await this.makeRequest('POST', '/api/auth/signin', {
            email: 'nonexistent@example.com',
            password: 'password123'
        });

        if (response.ok) {
            throw new Error('Should reject non-existent user');
        }
    }

    // M-Pesa Payment Tests
    async testMpesaValidation() {
        // Test invalid phone number
        const response1 = await this.makeRequest('POST', '/api/payments/mpesa-stk-push', {
            phoneNumber: '123456789',
            amount: 100,
            shopName: 'Test Shop',
            accountReference: 'TEST',
            transactionDesc: 'Test payment'
        });

        if (response1.status !== 400) {
            throw new Error('Should reject invalid phone number');
        }

        // Test zero amount
        const response2 = await this.makeRequest('POST', '/api/payments/mpesa-stk-push', {
            phoneNumber: '254712345678',
            amount: 0,
            shopName: 'Test Shop',
            accountReference: 'TEST',
            transactionDesc: 'Test payment'
        });

        if (response2.status !== 400) {
            throw new Error('Should reject zero amount');
        }

        // Test missing fields
        const response3 = await this.makeRequest('POST', '/api/payments/mpesa-stk-push', {
            phoneNumber: '254712345678'
        });

        if (response3.status !== 400) {
            throw new Error('Should reject missing required fields');
        }
    }

    async testMpesaCallback() {
        // Test successful callback
        const successCallback = {
            Body: {
                stkCallback: {
                    MerchantRequestID: 'test-merchant-id',
                    CheckoutRequestID: 'test-checkout-id',
                    ResultCode: 0,
                    ResultDesc: 'Success',
                    CallbackMetadata: {
                        Item: [
                            { Name: 'MpesaReceiptNumber', Value: 'TEST123456' },
                            { Name: 'TransactionDate', Value: '20250125120000' },
                            { Name: 'PhoneNumber', Value: '254712345678' }
                        ]
                    }
                }
            }
        };

        const response1 = await this.makeRequest('PUT', '/api/payments/mpesa-stk-push', successCallback);
        if (!response1.ok) {
            throw new Error('Successful callback should be processed');
        }

        // Test failed callback
        const failedCallback = {
            Body: {
                stkCallback: {
                    MerchantRequestID: 'test-merchant-id',
                    CheckoutRequestID: 'test-checkout-id',
                    ResultCode: 1,
                    ResultDesc: 'Insufficient balance'
                }
            }
        };

        const response2 = await this.makeRequest('PUT', '/api/payments/mpesa-stk-push', failedCallback);
        if (!response2.ok) {
            throw new Error('Failed callback should be processed');
        }
    }

    // API Security Tests
    async testSQLInjection() {
        const maliciousData = {
            name: "Test'; DROP TABLE shops; --",
            industry: 'Fashion',
            shop_number: 'A123',
            city: 'Nairobi',
            mall: 'Test Mall',
            whatsapp_number: '254712345678'
        };

        const response = await this.makeRequest('POST', '/api/shops', maliciousData);
        // Should either reject the request or sanitize the input
        // We'll check that the shops table still exists by making another request
        const testResponse = await this.makeRequest('GET', '/api/shops');
        if (!testResponse.ok && testResponse.status === 500) {
            throw new Error('SQL injection vulnerability detected');
        }
    }

    async testInputValidation() {
        // Test XSS prevention
        const xssData = {
            name: '<script>alert("xss")</script>',
            industry: 'Fashion',
            shop_number: 'A123',
            city: 'Nairobi',
            mall: 'Test Mall',
            whatsapp_number: '254712345678'
        };

        const response = await this.makeRequest('POST', '/api/shops', xssData);
        // Should sanitize or reject malicious input
        if (response.ok && response.data.name && response.data.name.includes('<script>')) {
            throw new Error('XSS vulnerability detected');
        }
    }

    // Performance Tests
    async testAPIPerformance() {
        const startTime = Date.now();
        const response = await this.makeRequest('GET', '/api/shops');
        const endTime = Date.now();

        const responseTime = endTime - startTime;
        if (responseTime > 2000) {
            throw new Error(`API response too slow: ${responseTime}ms`);
        }

        if (!response.ok) {
            throw new Error('API request failed');
        }
    }

    async testConcurrentRequests() {
        const requests = [];
        for (let i = 0; i < 10; i++) {
            requests.push(this.makeRequest('GET', '/api/categories'));
        }

        const results = await Promise.all(requests);
        const failedRequests = results.filter(r => !r.ok);

        if (failedRequests.length > 0) {
            throw new Error(`${failedRequests.length} concurrent requests failed`);
        }
    }

    // Environment Tests
    async testEnvironmentVariables() {
        const requiredEnvVars = [
            'NEXT_PUBLIC_SUPABASE_URL',
            'NEXT_PUBLIC_SUPABASE_ANON_KEY',
            'SUPABASE_SERVICE_ROLE_KEY'
        ];

        for (const envVar of requiredEnvVars) {
            if (!process.env[envVar]) {
                throw new Error(`Missing required environment variable: ${envVar}`);
            }
        }
    }

    async testServerHealth() {
        const response = await this.makeRequest('GET', '/api/categories');
        if (!response.ok) {
            throw new Error('Server health check failed');
        }
    }

    // Main test execution
    async runAllTests() {
        this.log('🚀 Starting comprehensive test suite for Dukaan project', 'info');
        this.log('=' * 60, 'info');

        // Environment Tests
        this.log('\n📋 Running Environment Tests...', 'warning');
        await this.runTest('Environment Variables', () => this.testEnvironmentVariables());
        await this.runTest('Server Health Check', () => this.testServerHealth());

        // Database Tests
        this.log('\n🗄️ Running Database Tests...', 'warning');
        await this.runTest('Database Connection', () => this.testDatabaseConnection());
        await this.runTest('Database Migrations', () => this.testDatabaseMigrations());

        // Authentication Tests
        this.log('\n🔐 Running Authentication Tests...', 'warning');
        await this.runTest('Sign Up Validation', () => this.testSignUpValidation());
        await this.runTest('Sign In Validation', () => this.testSignInValidation());

        // M-Pesa Tests
        this.log('\n💳 Running M-Pesa Payment Tests...', 'warning');
        await this.runTest('M-Pesa Input Validation', () => this.testMpesaValidation());
        await this.runTest('M-Pesa Callback Handling', () => this.testMpesaCallback());

        // Security Tests
        this.log('\n🔒 Running Security Tests...', 'warning');
        await this.runTest('SQL Injection Prevention', () => this.testSQLInjection());
        await this.runTest('Input Validation', () => this.testInputValidation());

        // Performance Tests
        this.log('\n🚀 Running Performance Tests...', 'warning');
        await this.runTest('API Performance', () => this.testAPIPerformance());
        await this.runTest('Concurrent Requests', () => this.testConcurrentRequests());

        // Results Summary
        this.log('\n' + '=' * 60, 'info');
        this.log('📊 TEST RESULTS SUMMARY', 'info');
        this.log('=' * 60, 'info');
        this.log(`✅ Passed: ${this.testResults.passed}`, 'success');
        this.log(`❌ Failed: ${this.testResults.failed}`, 'error');

        if (this.testResults.errors.length > 0) {
            this.log('\n🚨 FAILED TESTS:', 'error');
            this.testResults.errors.forEach(error => {
                this.log(`  - ${error.test}: ${error.error}`, 'error');
            });
        }

        const totalTests = this.testResults.passed + this.testResults.failed;
        const successRate = ((this.testResults.passed / totalTests) * 100).toFixed(2);

        this.log(`\n📈 Success Rate: ${successRate}%`, successRate >= 90 ? 'success' : 'warning');

        if (this.testResults.failed === 0) {
            this.log('\n🎉 ALL TESTS PASSED! Your Dukaan application is bulletproof! 🎉', 'success');
        } else {
            this.log('\n⚠️ Some tests failed. Please review and fix the issues above.', 'warning');
        }

        return this.testResults.failed === 0;
    }
}

// CLI execution
if (require.main === module) {
    const testRunner = new TestRunner();

    testRunner.runAllTests()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('Test runner failed:', error);
            process.exit(1);
        });
}

module.exports = TestRunner;
