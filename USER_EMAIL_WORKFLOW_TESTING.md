# User Email Workflow Testing Guide

## Overview

This guide will help you test the complete user registration and email workflow for your Dukaan project.

## Current Issues Identified

1. **Categories API Error**: "Failed to fetch categories" on homepage
2. **Signup Still Failing**: Email confirmation issues
3. **Google OAuth Setup**: Needs proper configuration

## Testing Steps

### 1. Fix Categories API Issue

The categories API is failing due to RLS policies. Let's fix this first.

### 2. Test Email Workflow Options

#### Option A: Disable Email Confirmation (Recommended for Development)

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your "dukaan" project
3. Navigate to **Authentication** → **Settings**
4. Find **"Enable email confirmations"** setting
5. **Disable** email confirmations
6. Save changes

#### Option B: Configure Email Service (For Production)

1. In Supabase Dashboard → **Authentication** → **Settings**
2. Configure SMTP settings:
   - SMTP Host: (e.g., smtp.gmail.com)
   - SMTP Port: 587
   - SMTP User: your-email@gmail.com
   - SMTP Password: your-app-password
3. Set custom email templates if needed

### 3. Test Signup Flow

#### Test Case 1: Regular Email Signup

```
First Name: Test
Last Name: User
Email: test.user@example.com
Password: TestPassword123!
```

#### Test Case 2: Your Email

```
First Name: dukaan
Last Name: admin
Email: dukan96@gmail.com
Password: Geeljire3!
```

### 4. Test Google OAuth (If Enabled)

#### Prerequisites:

1. Google Cloud Console project setup
2. OAuth 2.0 credentials configured
3. Authorized redirect URIs set

#### Steps:

1. Go to signup page
2. Click "Sign in with Google"
3. Complete OAuth flow
4. Verify user creation in database

### 5. Verify Database Records

After successful signup, check:

```sql
-- Check auth.users table
SELECT id, email, email_confirmed_at, created_at FROM auth.users WHERE email = 'your-test-email';

-- Check profiles table
SELECT id, email, full_name, role, created_at FROM profiles WHERE email = 'your-test-email';
```

### 6. Test Email Confirmation (If Enabled)

1. Check email inbox for confirmation email
2. Click confirmation link
3. Verify `email_confirmed_at` is set in auth.users
4. Test login with confirmed account

### 7. Test Complete User Journey

1. **Signup** → **Email Confirmation** → **Login** → **Shop Dashboard**
2. **Create Shop** → **Admin Approval** → **Payment Management**

## Troubleshooting

### Common Issues:

#### 1. "Failed to fetch categories"

- **Cause**: RLS policies blocking public access
- **Fix**: Update categories RLS policy

#### 2. "Sign up failed. Please try again."

- **Cause**: Email confirmation enabled but not configured
- **Fix**: Disable email confirmation or configure SMTP

#### 3. Google OAuth not working

- **Cause**: Missing or incorrect OAuth configuration
- **Fix**: Configure Google Cloud Console properly

#### 4. User created but no profile

- **Cause**: Database trigger not working
- **Fix**: Check trigger function and policies

## Email Templates (Optional)

### Confirmation Email Template

```html
<h2>Welcome to TeKe TeKe!</h2>
<p>Please confirm your email address by clicking the link below:</p>
<a href="{{ .ConfirmationURL }}">Confirm Email</a>
```

### Welcome Email Template

```html
<h2>Welcome to TeKe TeKe!</h2>
<p>Your account has been created successfully.</p>
<p>You can now start creating your shop and managing payments.</p>
```

## Testing Checklist

- [ ] Categories load without errors
- [ ] Signup form accepts valid input
- [ ] User record created in auth.users
- [ ] Profile record created automatically
- [ ] Email confirmation works (if enabled)
- [ ] Login works after signup
- [ ] User redirected to correct dashboard
- [ ] Google OAuth works (if configured)
- [ ] Error messages are user-friendly

## Next Steps After Testing

1. **Production Setup**: Configure proper email service
2. **Security**: Enable email confirmation for production
3. **Monitoring**: Set up error tracking
4. **User Experience**: Customize email templates
5. **Analytics**: Track signup conversion rates

## Support

If you encounter issues:

1. Check browser console for errors
2. Check Supabase logs in dashboard
3. Verify environment variables
4. Test with different email addresses
5. Clear browser cache and cookies
