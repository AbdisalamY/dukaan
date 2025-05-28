import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function createTestUser() {
    try {
        console.log('Creating test user...')

        const { data, error } = await supabase.auth.admin.createUser({
            email: 'test@example.com',
            password: 'password123',
            email_confirm: true,
            user_metadata: {
                full_name: 'Test User'
            }
        })

        if (error) {
            console.error('Error creating user:', error)
            return
        }

        console.log('Test user created successfully!')
        console.log('Email: test@example.com')
        console.log('Password: password123')
        console.log('User ID:', data.user.id)

        // Also create a profile entry
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: data.user.id,
                email: 'test@example.com',
                full_name: 'Test User',
                role: 'shop_owner'
            })

        if (profileError) {
            console.error('Error creating profile:', profileError)
        } else {
            console.log('Profile created successfully!')
        }

    } catch (error) {
        console.error('Unexpected error:', error)
    }
}

createTestUser()
