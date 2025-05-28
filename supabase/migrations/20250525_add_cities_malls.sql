-- Create cities table
CREATE TABLE
    IF NOT EXISTS public.cities (
        id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP
        WITH
            TIME ZONE DEFAULT NOW ()
    );

-- Create malls table
CREATE TABLE
    IF NOT EXISTS public.malls (
        id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
        name TEXT NOT NULL,
        city_id UUID REFERENCES public.cities (id) ON DELETE CASCADE,
        created_at TIMESTAMP
        WITH
            TIME ZONE DEFAULT NOW (),
            UNIQUE (name, city_id)
    );

-- Insert default cities
INSERT INTO
    public.cities (name)
SELECT
    *
FROM
    (
        VALUES
            ('Nairobi'),
            ('Mombasa'),
            ('Kisumu'),
            ('Nakuru'),
            ('Eldoret'),
            ('Thika'),
            ('Malindi'),
            ('Kitale'),
            ('Garissa'),
            ('Kakamega')
    ) AS v (name)
WHERE
    NOT EXISTS (
        SELECT
            1
        FROM
            public.cities
        WHERE
            cities.name = v.name
    );

-- Insert default malls for Nairobi
INSERT INTO
    public.malls (name, city_id)
SELECT
    v.name,
    c.id
FROM
    (
        VALUES
            ('Westgate Shopping Mall'),
            ('Sarit Centre'),
            ('The Junction Mall'),
            ('Garden City Mall'),
            ('Two Rivers Mall'),
            ('Village Market'),
            ('Yaya Centre'),
            ('Prestige Plaza'),
            ('The Hub Karen'),
            ('Galleria Shopping Mall')
    ) AS v (name)
    CROSS JOIN public.cities c
WHERE
    c.name = 'Nairobi'
    AND NOT EXISTS (
        SELECT
            1
        FROM
            public.malls m
        WHERE
            m.name = v.name
            AND m.city_id = c.id
    );

-- Insert default malls for Mombasa
INSERT INTO
    public.malls (name, city_id)
SELECT
    v.name,
    c.id
FROM
    (
        VALUES
            ('Nyali Cinemax'),
            ('City Mall'),
            ('Nakumatt Nyali'),
            ('Mombasa Mall'),
            ('Bamburi Mall')
    ) AS v (name)
    CROSS JOIN public.cities c
WHERE
    c.name = 'Mombasa'
    AND NOT EXISTS (
        SELECT
            1
        FROM
            public.malls m
        WHERE
            m.name = v.name
            AND m.city_id = c.id
    );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_malls_city_id ON public.malls (city_id);

-- Enable RLS
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.malls ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for cities
CREATE POLICY "Anyone can view cities" ON public.cities FOR
SELECT
    USING (true);

CREATE POLICY "Admins can manage cities" ON public.cities FOR ALL USING (
    EXISTS (
        SELECT
            1
        FROM
            public.profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- Create RLS policies for malls
CREATE POLICY "Anyone can view malls" ON public.malls FOR
SELECT
    USING (true);

CREATE POLICY "Admins can manage malls" ON public.malls FOR ALL USING (
    EXISTS (
        SELECT
            1
        FROM
            public.profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- Allow authenticated users to create cities and malls
CREATE POLICY "Authenticated users can create cities" ON public.cities FOR INSERT
WITH
    CHECK (auth.uid () IS NOT NULL);

CREATE POLICY "Authenticated users can create malls" ON public.malls FOR INSERT
WITH
    CHECK (auth.uid () IS NOT NULL);