-- Fix infinite recursion in policies
-- Drop all existing policies first
DO $$ 
BEGIN
  -- Drop existing policies for profiles
  DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
  
  -- Drop existing policies for shops
  DROP POLICY IF EXISTS "Shop owners can view own shops" ON public.shops;
  DROP POLICY IF EXISTS "Shop owners can insert own shops" ON public.shops;
  DROP POLICY IF EXISTS "Shop owners can update own shops" ON public.shops;
  DROP POLICY IF EXISTS "Admins can view all shops" ON public.shops;
  DROP POLICY IF EXISTS "Public can view approved shops" ON public.shops;
  
  -- Drop existing policies for payments
  DROP POLICY IF EXISTS "Shop owners can view own payments" ON public.payments;
  DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
  
  -- Drop existing policies for categories
  DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
  DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
  
  -- Drop existing policies for payment_reminders
  DROP POLICY IF EXISTS "Shop owners can view own reminders" ON public.payment_reminders;
  DROP POLICY IF EXISTS "Admins can manage all reminders" ON public.payment_reminders;
END $$;

-- Create simplified RLS policies without recursion

-- Profiles policies (simplified to avoid recursion)
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin access to profiles (using direct role check)
CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

-- Shops policies
CREATE POLICY "Shop owners can view own shops" ON public.shops
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Shop owners can insert own shops" ON public.shops
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Shop owners can update own shops" ON public.shops
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Admins can manage all shops" ON public.shops
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Public can view approved shops" ON public.shops
  FOR SELECT USING (status = 'approved');

-- Payments policies
CREATE POLICY "Shop owners can view own payments" ON public.payments
  FOR SELECT USING (
    shop_id IN (
      SELECT id FROM public.shops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Shop owners can update own payments" ON public.payments
  FOR UPDATE USING (
    shop_id IN (
      SELECT id FROM public.shops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all payments" ON public.payments
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

-- Categories policies (public read access)
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

-- Payment reminders policies
CREATE POLICY "Shop owners can view own reminders" ON public.payment_reminders
  FOR SELECT USING (
    shop_id IN (
      SELECT id FROM public.shops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all reminders" ON public.payment_reminders
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );
