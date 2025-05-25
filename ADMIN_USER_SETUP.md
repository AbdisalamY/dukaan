# Admin User Setup Guide

## Overview

This document outlines how the admin user system is configured in the TeKe TeKe application.

## Admin User Configuration

### Designated Admin Email

- **Admin Email**: `dukaan96@gmail.com`
- **Role**: `admin`
- **Access Level**: Full system administration

### Database Setup

#### 1. Automatic Role Assignment

A database trigger automatically assigns the admin role to the designated email:

```sql
-- Function to set admin role for specific email
CREATE OR REPLACE FUNCTION set_admin_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email = 'dukaan96@gmail.com' THEN
    NEW.role = 'admin';
  ELSE
    NEW.role = 'shop_owner';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on profile creation
CREATE TRIGGER set_admin_role_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_admin_role();
```

#### 2. Row Level Security (RLS)

Admin-only permissions are enforced at the database level:

- **Categories**: Only admins can create/update/delete
- **Cities**: Only admins can create/update/delete
- **Malls**: Only admins can create/update/delete
- **All users**: Can read categories, cities, and malls

### Authentication Flow

#### 1. Login Redirect Logic

When a user logs in, the system checks their role and redirects accordingly:

- **Admin users** → `/admin/dashboard`
- **Shop owners** → `/shop/dashboard`

#### 2. Supported Login Methods

- Email/Password authentication
- Google OAuth authentication

Both methods check the user's role and redirect appropriately.

### Admin Capabilities

#### 1. Data Management

- Create, update, delete categories
- Create, update, delete cities
- Create, update, delete malls
- Manage shop approvals
- View all payments and analytics

#### 2. Shop Management

- Approve/reject shop registrations
- View all shops regardless of status
- Send payment reminders
- Delete shops if necessary

#### 3. System Analytics

- View system-wide analytics
- Monitor payment trends
- Track shop registration metrics

### Security Features

#### 1. Multi-Layer Protection

- **Database Level**: RLS policies prevent unauthorized access
- **API Level**: Admin checks in all creation endpoints
- **Frontend Level**: Admin-only UI components

#### 2. Automatic Role Detection

- Role is automatically assigned based on email address
- No manual intervention required for admin setup
- Existing profiles are updated if email matches

### How to Access Admin Panel

1. **Sign Up/Sign In** with `dukaan96@gmail.com`
2. **Automatic Redirect** to `/admin/dashboard`
3. **Full Admin Access** to all system features

### Regular User Experience

- **Shop Owners**: Can only select from existing categories, cities, and malls
- **No Creation Options**: Regular users cannot create new categories, cities, or malls
- **Clean Interface**: No confusing options for actions they cannot perform

### Migration Files

The admin setup is implemented through these migration files:

- `20250525_admin_only_cities_malls.sql` - RLS policies
- `20250525_set_admin_user.sql` - Admin role assignment

### Notes

- Only one admin user is configured: `dukaan96@gmail.com`
- The system is designed for single admin management
- All admin permissions are automatically granted upon login
- No additional setup required after database migration
