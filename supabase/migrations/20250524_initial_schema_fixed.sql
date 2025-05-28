-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'shop_owner' CHECK (role IN ('admin', 'shop_owner')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shops table
CREATE TABLE IF NOT EXISTS public.shops (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  logo TEXT,
  industry TEXT NOT NULL,
  shop_number TEXT NOT NULL,
  city TEXT NOT NULL,
  mall TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'KES',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_date TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  payment_method TEXT,
  transaction_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_reminders table
CREATE TABLE IF NOT EXISTS public.payment_reminders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed')),
  reminder_type TEXT DEFAULT 'payment_due' CHECK (reminder_type IN ('payment_due', 'payment_overdue')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories (only if they don't exist)
INSERT INTO public.categories (name, description) 
SELECT * FROM (VALUES
  ('Fashion', 'Clothing, accessories, and fashion items'),
  ('Electronics', 'Electronic devices and gadgets'),
  ('Groceries', 'Food and grocery items'),
  ('Toys', 'Toys and games for children'),
  ('Books', 'Books and educational materials'),
  ('Beauty', 'Cosmetics and beauty products'),
  ('Apparel', 'Clothing and apparel'),
  ('Shoes', 'Footwear and shoes'),
  ('Home & Kitchen', 'Home and kitchen appliances'),
  ('Jewelry', 'Jewelry and accessories'),
  ('Sport & Fitness', 'Sports and fitness equipment'),
  ('Health & Beauty', 'Health and beauty products'),
  ('Food & Beverage', 'Food and beverage items'),
  ('Home & Garden', 'Home and garden supplies')
) AS v(name, description)
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE categories.name = v.name);

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_shops_owner_id ON public.shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_shops_status ON public.shops(status);
CREATE INDEX IF NOT EXISTS idx_shops_city ON public.shops(city);
CREATE INDEX IF NOT EXISTS idx_shops_industry ON public.shops(industry);
CREATE INDEX IF NOT EXISTS idx_payments_shop_id ON public.payments(shop_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON public.payments(due_date);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_shop_id ON public.payment_reminders(shop_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_reminders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
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

-- Create RLS policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Shops policies
CREATE POLICY "Shop owners can view own shops" ON public.shops
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Shop owners can insert own shops" ON public.shops
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Shop owners can update own shops" ON public.shops
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Admins can view all shops" ON public.shops
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Public can view approved shops" ON public.shops
  FOR SELECT USING (status = 'approved');

-- Payments policies
CREATE POLICY "Shop owners can view own payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.shops 
      WHERE id = shop_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all payments" ON public.payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Categories policies (public read access)
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Payment reminders policies
CREATE POLICY "Shop owners can view own reminders" ON public.payment_reminders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.shops 
      WHERE id = shop_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all reminders" ON public.payment_reminders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist and recreate them
DROP TRIGGER IF EXISTS handle_updated_at_profiles ON public.profiles;
CREATE TRIGGER handle_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_shops ON public.shops;
CREATE TRIGGER handle_updated_at_shops
  BEFORE UPDATE ON public.shops
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_payments ON public.payments;
CREATE TRIGGER handle_updated_at_payments
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
