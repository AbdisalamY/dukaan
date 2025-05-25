-- Add RLS policies for cities and malls tables
-- Only admins can create/update/delete cities and malls
-- Everyone can read them
-- Enable RLS on cities and malls if not already enabled
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.malls ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view cities" ON public.cities;

DROP POLICY IF EXISTS "Admins can manage cities" ON public.cities;

DROP POLICY IF EXISTS "Anyone can view malls" ON public.malls;

DROP POLICY IF EXISTS "Admins can manage malls" ON public.malls;

-- Cities policies
CREATE POLICY "Anyone can view cities" ON public.cities FOR
SELECT
    USING (true);

CREATE POLICY "Admins can manage cities" ON public.cities FOR ALL USING (
    auth.uid () IN (
        SELECT
            id
        FROM
            public.profiles
        WHERE
            role = 'admin'
    )
);

-- Malls policies  
CREATE POLICY "Anyone can view malls" ON public.malls FOR
SELECT
    USING (true);

CREATE POLICY "Admins can manage malls" ON public.malls FOR ALL USING (
    auth.uid () IN (
        SELECT
            id
        FROM
            public.profiles
        WHERE
            role = 'admin'
    )
);

-- Update categories policies to be more explicit about admin-only creation
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;

CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (
    auth.uid () IN (
        SELECT
            id
        FROM
            public.profiles
        WHERE
            role = 'admin'
    )
);