#!/usr/bin/env node

/**
 * Supabase Database Manager
 * Direct access to your Supabase database for management tasks
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

// Initialize Supabase client with service role key for admin access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.log('Required variables:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL');
    console.log('- SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Database management functions
class SupabaseManager {

    // Apply the database migration
    async applyMigration() {
        console.log('🚀 Database Migration');
        console.log('');
        console.log('❌ Direct SQL execution is not available in this Supabase setup.');
        console.log('');
        console.log('✅ Please use the Supabase Dashboard method instead:');
        console.log('');
        console.log('1. Go to: https://supabase.com/dashboard/project/kqnvnxajcifcmntjxrzg');
        console.log('2. Click "SQL Editor" in the sidebar');
        console.log('3. Copy the content from: supabase/migrations/20250524_initial_schema.sql');
        console.log('4. Paste it into the SQL Editor and click "Run"');
        console.log('');
        console.log('📖 See scripts/apply-migration-dashboard.md for detailed instructions');
        console.log('');
        console.log('After applying the migration, run: npm run db:status');

        return false;
    }

    // List all tables
    async listTables() {
        console.log('📋 Listing database tables...');

        try {
            const { data, error } = await supabase
                .from('information_schema.tables')
                .select('table_name')
                .eq('table_schema', 'public');

            if (error) {
                console.error('❌ Error listing tables:', error);
                return;
            }

            console.log('Tables in your database:');
            data.forEach(table => console.log(`  - ${table.table_name}`));
        } catch (error) {
            console.error('❌ Error:', error.message);
        }
    }

    // Create an admin user
    async createAdminUser(email, password, fullName) {
        console.log(`👤 Creating admin user: ${email}`);

        try {
            // Create user
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email,
                password,
                user_metadata: {
                    full_name: fullName
                },
                email_confirm: true
            });

            if (authError) {
                console.error('❌ Error creating user:', authError);
                return false;
            }

            // Update profile to admin role
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ role: 'admin' })
                .eq('id', authData.user.id);

            if (profileError) {
                console.error('❌ Error setting admin role:', profileError);
                return false;
            }

            console.log('✅ Admin user created successfully!');
            console.log(`   Email: ${email}`);
            console.log(`   User ID: ${authData.user.id}`);
            return true;
        } catch (error) {
            console.error('❌ Error creating admin user:', error.message);
            return false;
        }
    }

    // Add sample data
    async addSampleData() {
        console.log('📊 Adding sample data...');

        try {
            // Add sample shops
            const { data: shops, error: shopsError } = await supabase
                .from('shops')
                .insert([
                    {
                        name: 'Fashion Hub',
                        industry: 'Fashion',
                        shop_number: 'A12',
                        city: 'Nairobi',
                        mall: 'Westgate Mall',
                        whatsapp_number: '+254799374937',
                        status: 'approved',
                        logo: 'https://via.placeholder.com/150'
                    },
                    {
                        name: 'Tech World',
                        industry: 'Electronics',
                        shop_number: 'B34',
                        city: 'Nairobi',
                        mall: 'Garden City Mall',
                        whatsapp_number: '+254701234567',
                        status: 'approved',
                        logo: 'https://via.placeholder.com/150'
                    }
                ])
                .select();

            if (shopsError) {
                console.error('❌ Error adding sample shops:', shopsError);
                return false;
            }

            console.log('✅ Sample data added successfully!');
            console.log(`   Added ${shops.length} sample shops`);
            return true;
        } catch (error) {
            console.error('❌ Error adding sample data:', error.message);
            return false;
        }
    }

    // Execute simple queries (not DDL)
    async executeQuery(tableName, operation = 'SELECT') {
        console.log(`🔧 Executing ${operation} on ${tableName}...`);

        try {
            if (operation.toUpperCase() === 'SELECT') {
                const { data, error } = await supabase
                    .from(tableName)
                    .select('*')
                    .limit(5);

                if (error) {
                    console.error('❌ Query failed:', error);
                    return false;
                }

                console.log('✅ Query executed successfully!');
                console.log('Results:', data);
                return true;
            } else {
                console.log('❌ Only SELECT queries are supported via this method');
                console.log('💡 For other operations, use the Supabase Dashboard SQL Editor');
                return false;
            }
        } catch (error) {
            console.error('❌ Error executing query:', error.message);
            return false;
        }
    }

    // Check database status
    async checkStatus() {
        console.log('🔍 Checking database status...');

        try {
            // Check if tables exist
            const tables = ['profiles', 'shops', 'payments', 'categories'];
            const results = {};

            for (const table of tables) {
                try {
                    const { count, error } = await supabase
                        .from(table)
                        .select('*', { count: 'exact', head: true });

                    if (error) {
                        results[table] = `❌ Error: ${error.message}`;
                    } else {
                        results[table] = `✅ ${count} records`;
                    }
                } catch (err) {
                    results[table] = `❌ Table not found`;
                }
            }

            console.log('Database Status:');
            Object.entries(results).forEach(([table, status]) => {
                console.log(`  ${table}: ${status}`);
            });

            // Check if migration is needed
            const hasErrors = Object.values(results).some(status => status.includes('❌'));
            if (hasErrors) {
                console.log('');
                console.log('💡 Some tables are missing. You may need to apply the migration:');
                console.log('   See scripts/apply-migration-dashboard.md for instructions');
            }

            return true;
        } catch (error) {
            console.error('❌ Error checking status:', error.message);
            return false;
        }
    }
}

// CLI Interface
const manager = new SupabaseManager();
const command = process.argv[2];

switch (command) {
    case 'migrate':
        await manager.applyMigration();
        break;

    case 'tables':
        await manager.listTables();
        break;

    case 'status':
        await manager.checkStatus();
        break;

    case 'create-admin':
        const email = process.argv[3];
        const password = process.argv[4];
        const fullName = process.argv[5] || 'Admin User';

        if (!email || !password) {
            console.log('Usage: node supabase-manager.js create-admin <email> <password> [fullName]');
            process.exit(1);
        }

        await manager.createAdminUser(email, password, fullName);
        break;

    case 'sample-data':
        await manager.addSampleData();
        break;

    case 'query':
        const tableName = process.argv[3];
        if (!tableName) {
            console.log('Usage: node supabase-manager.js query <table_name>');
            console.log('Example: node supabase-manager.js query shops');
            process.exit(1);
        }
        await manager.executeQuery(tableName);
        break;

    default:
        console.log('🛠️  Supabase Database Manager');
        console.log('');
        console.log('Available commands:');
        console.log('  migrate        - Show migration instructions');
        console.log('  tables         - List all tables');
        console.log('  status         - Check database status');
        console.log('  create-admin   - Create admin user');
        console.log('  sample-data    - Add sample data');
        console.log('  query          - Query a table');
        console.log('');
        console.log('Examples:');
        console.log('  node scripts/supabase-manager.js status');
        console.log('  node scripts/supabase-manager.js create-admin admin@example.com password123');
        console.log('  node scripts/supabase-manager.js query shops');
        console.log('');
        console.log('📖 For migration: see scripts/apply-migration-dashboard.md');
        break;
}

process.exit(0);
