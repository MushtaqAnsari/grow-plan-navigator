-- Update taxation table to match the component structure (without trigger)
ALTER TABLE public.taxation 
ADD COLUMN income_tax_enabled BOOLEAN DEFAULT true,
ADD COLUMN income_tax_rate NUMERIC DEFAULT 20,
ADD COLUMN income_tax_year1 NUMERIC DEFAULT 0,
ADD COLUMN income_tax_year2 NUMERIC DEFAULT 0,
ADD COLUMN income_tax_year3 NUMERIC DEFAULT 0,
ADD COLUMN zakat_enabled BOOLEAN DEFAULT true,
ADD COLUMN zakat_rate NUMERIC DEFAULT 2.5,
ADD COLUMN zakat_calculation_method TEXT DEFAULT 'net-worth',
ADD COLUMN zakat_year1 NUMERIC DEFAULT 0,
ADD COLUMN zakat_year2 NUMERIC DEFAULT 0,
ADD COLUMN zakat_year3 NUMERIC DEFAULT 0;