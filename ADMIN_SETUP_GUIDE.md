# Admin User Setup Guide

## 🚨 Important: Admin User Creation Process

### The Problem

Simply updating the role in the database (`UPDATE profiles SET role = 'admin'`) **WILL NOT WORK** because:

- No auth.users record exists
- No password is set
- User cannot log in
- No email confirmation

### ✅ Correct Admin Creation Process

## Option 1: Manual Admin Creation (Recommended)

### Step 1: Register Admin via UI

1. Go to `/sign-up` on your website
2. Register with your admin email and password
3. Complete email verification (if required)
4. This creates both `auth.users` and `profiles` records

### Step 2: Upgrade to Admin Role

```sql
-- Run this in Supabase SQL Editor
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-admin@email.com';
```

### Step 3: Verify Admin Access

1. Sign out and sign back in
2. Navigate to `/admin` - you should have access
3. Verify all admin functions work

## Option 2: Programmatic Admin Creation

### Create Admin Creation API Endpoint

I can create a special admin creation endpoint that:

- Creates the auth user
- Sets up the profile with admin role
- Sends welcome email
- Handles password setup

### Step 1: Create Admin Setup API

```typescript
// /api/admin/create-first-admin
export async function POST(request: NextRequest) {
  // Check if any admin exists
  const { data: existingAdmins } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .limit(1);

  if (existingAdmins && existingAdmins.length > 0) {
    return NextResponse.json(
      { error: "Admin already exists" },
      { status: 400 }
    );
  }

  // Create admin user
  const { email, password, fullName } = await request.json();

  const { data: authData, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm
    user_metadata: {
      full_name: fullName,
      role: "admin",
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Update profile role (trigger should create profile)
  await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", authData.user.id);

  return NextResponse.json({
    message: "Admin created successfully",
    email: authData.user.email,
  });
}
```

## Option 3: Supabase Dashboard Method

### Step 1: Create User in Supabase Dashboard

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User"
3. Enter email and password
4. Set "Email Confirmed" to true
5. Click "Create User"

### Step 2: Update Role

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-admin@email.com';
```

## 🔐 Admin Login Process

### After Admin Creation:

1. **Email**: Use the email you registered/created with
2. **Password**: Use the password you set during creation
3. **Login URL**: `/sign-in`
4. **Dashboard Access**: After login, go to `/admin`

### What Happens After Login:

1. User signs in with email/password
2. Middleware checks user role
3. If role = 'admin', access to `/admin/*` routes granted
4. Admin can manage shops, payments, users, etc.

## 🧪 Testing Admin Access

### Verify Admin Setup:

```sql
-- Check if admin user exists
SELECT
  p.email,
  p.role,
  p.created_at,
  u.email_confirmed_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.role = 'admin';
```

### Test Admin Functions:

1. ✅ Can access `/admin/dashboard`
2. ✅ Can view all shops
3. ✅ Can approve/reject shops
4. ✅ Can manage payments
5. ✅ Can view analytics
6. ✅ Cannot be redirected to shop dashboard

## 🚨 Security Considerations

### Admin Account Security:

- Use strong password (12+ characters)
- Enable 2FA if available
- Use dedicated admin email
- Regular password updates
- Monitor admin access logs

### First Admin Creation:

- Only create ONE admin initially
- Additional admins should be created by existing admins
- Document admin creation process
- Keep admin credentials secure

## 📋 Recommended Setup Flow

### For Production:

1. **Deploy application** to production
2. **Register admin account** via UI (`/sign-up`)
3. **Verify email** (if confirmation enabled)
4. **Update role** in database to 'admin'
5. **Test admin access** (`/admin`)
6. **Document credentials** securely

### For Development:

1. **Use Option 1** (register via UI)
2. **Test all admin functions**
3. **Create test shop owners**
4. **Verify role separation**

## ⚠️ Common Issues

### Issue: "Cannot access admin routes"

**Solution**: Verify role is set to 'admin' in profiles table

### Issue: "User doesn't exist"

**Solution**: Must create auth.users record first (via signup or Supabase dashboard)

### Issue: "Email not confirmed"

**Solution**: Set email_confirmed_at in auth.users or disable email confirmation

### Issue: "Redirected to shop dashboard"

**Solution**: Check middleware role verification logic

Your admin user will have full access to manage the marketplace once properly created!
