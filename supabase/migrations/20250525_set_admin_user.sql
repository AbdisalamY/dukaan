-- Set dukaan96@gmail.com as the admin user
-- This migration will update the user's role to admin when they sign up

-- First, let's create a function to automatically set admin role for the specific email
CREATE OR REPLACE FUNCTION set_admin_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the email is the admin email
  IF NEW.email = 'dukaan96@gmail.com' THEN
    NEW.role = 'admin';
  ELSE
    -- Default role for other users
    NEW.role = 'shop_owner';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set admin role on profile creation
DROP TRIGGER IF EXISTS set_admin_role_trigger ON public.profiles;
CREATE TRIGGER set_admin_role_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_admin_role();

-- Update existing profile if it exists
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'dukaan96@gmail.com';

-- If the profile doesn't exist yet, we'll let the trigger handle it when they sign up
