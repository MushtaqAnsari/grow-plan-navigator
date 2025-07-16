-- Create financial_models table for storing company financial data
CREATE TABLE public.financial_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  industry TEXT,
  language TEXT DEFAULT 'English',
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create revenue_streams table
CREATE TABLE public.revenue_streams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  financial_model_id UUID NOT NULL REFERENCES public.financial_models(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  year1 DECIMAL DEFAULT 0,
  year2 DECIMAL DEFAULT 0,
  year3 DECIMAL DEFAULT 0,
  year4 DECIMAL DEFAULT 0,
  year5 DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cost_structures table
CREATE TABLE public.cost_structures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  financial_model_id UUID NOT NULL REFERENCES public.financial_models(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  year1 DECIMAL DEFAULT 0,
  year2 DECIMAL DEFAULT 0,
  year3 DECIMAL DEFAULT 0,
  year4 DECIMAL DEFAULT 0,
  year5 DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create operational_expenses table
CREATE TABLE public.operational_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  financial_model_id UUID NOT NULL REFERENCES public.financial_models(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  year1 DECIMAL DEFAULT 0,
  year2 DECIMAL DEFAULT 0,
  year3 DECIMAL DEFAULT 0,
  year4 DECIMAL DEFAULT 0,
  year5 DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employee_planning table
CREATE TABLE public.employee_planning (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  financial_model_id UUID NOT NULL REFERENCES public.financial_models(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  year1 INTEGER DEFAULT 0,
  year2 INTEGER DEFAULT 0,
  year3 INTEGER DEFAULT 0,
  year4 INTEGER DEFAULT 0,
  year5 INTEGER DEFAULT 0,
  salary_per_employee DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create loans_financing table
CREATE TABLE public.loans_financing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  financial_model_id UUID NOT NULL REFERENCES public.financial_models(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount DECIMAL DEFAULT 0,
  interest_rate DECIMAL DEFAULT 0,
  term_years INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create taxation table
CREATE TABLE public.taxation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  financial_model_id UUID NOT NULL REFERENCES public.financial_models(id) ON DELETE CASCADE,
  corporate_tax_rate DECIMAL DEFAULT 0,
  vat_rate DECIMAL DEFAULT 0,
  other_taxes DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.financial_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operational_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_planning ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans_financing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxation ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for financial_models
CREATE POLICY "Users can view their own financial models" 
ON public.financial_models 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own financial models" 
ON public.financial_models 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial models" 
ON public.financial_models 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial models" 
ON public.financial_models 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for revenue_streams
CREATE POLICY "Users can view their own revenue streams" 
ON public.revenue_streams 
FOR SELECT 
USING (auth.uid() = (SELECT user_id FROM public.financial_models WHERE id = financial_model_id));

CREATE POLICY "Users can create their own revenue streams" 
ON public.revenue_streams 
FOR INSERT 
WITH CHECK (auth.uid() = (SELECT user_id FROM public.financial_models WHERE id = financial_model_id));

CREATE POLICY "Users can update their own revenue streams" 
ON public.revenue_streams 
FOR UPDATE 
USING (auth.uid() = (SELECT user_id FROM public.financial_models WHERE id = financial_model_id));

CREATE POLICY "Users can delete their own revenue streams" 
ON public.revenue_streams 
FOR DELETE 
USING (auth.uid() = (SELECT user_id FROM public.financial_models WHERE id = financial_model_id));

-- Create RLS policies for cost_structures
CREATE POLICY "Users can view their own cost structures" 
ON public.cost_structures 
FOR SELECT 
USING (auth.uid() = (SELECT user_id FROM public.financial_models WHERE id = financial_model_id));

CREATE POLICY "Users can create their own cost structures" 
ON public.cost_structures 
FOR INSERT 
WITH CHECK (auth.uid() = (SELECT user_id FROM public.financial_models WHERE id = financial_model_id));

CREATE POLICY "Users can update their own cost structures" 
ON public.cost_structures 
FOR UPDATE 
USING (auth.uid() = (SELECT user_id FROM public.financial_models WHERE id = financial_model_id));

CREATE POLICY "Users can delete their own cost structures" 
ON public.cost_structures 
FOR DELETE 
USING (auth.uid() = (SELECT user_id FROM public.financial_models WHERE id = financial_model_id));

-- Create RLS policies for operational_expenses
CREATE POLICY "Users can view their own operational expenses" 
ON public.operational_expenses 
FOR SELECT 
USING (auth.uid() = (SELECT user_id FROM public.financial_models WHERE id = financial_model_id));

CREATE POLICY "Users can create their own operational expenses" 
ON public.operational_expenses 
FOR INSERT 
WITH CHECK (auth.uid() = (SELECT user_id FROM public.financial_models WHERE id = financial_model_id));

CREATE POLICY "Users can update their own operational expenses" 
ON public.operational_expenses 
FOR UPDATE 
USING (auth.uid() = (SELECT user_id FROM public.financial_models WHERE id = financial_model_id));

CREATE POLICY "Users can delete their own operational expenses" 
ON public.operational_expenses 
FOR DELETE 
USING (auth.uid() = (SELECT user_id FROM public.financial_models WHERE id = financial_model_id));

-- Create RLS policies for employee_planning
CREATE POLICY "Users can view their own employee planning" 
ON public.employee_planning 
FOR SELECT 
USING (auth.uid() = (SELECT user_id FROM public.financial_models WHERE id = financial_model_id));

CREATE POLICY "Users can create their own employee planning" 
ON public.employee_planning 
FOR INSERT 
WITH CHECK (auth.uid() = (SELECT user_id FROM public.financial_models WHERE id = financial_model_id));

CREATE POLICY "Users can update their own employee planning" 
ON public.employee_planning 
FOR UPDATE 
USING (auth.uid() = (SELECT user_id FROM public.financial_models WHERE id = financial_model_id));

CREATE POLICY "Users can delete their own employee planning" 
ON public.employee_planning 
FOR DELETE 
USING (auth.uid() = (SELECT user_id FROM public.financial_models WHERE id = financial_model_id));

-- Create RLS policies for loans_financing
CREATE POLICY "Users can view their own loans financing" 
ON public.loans_financing 
FOR SELECT 
USING (auth.uid() = (SELECT user_id FROM public.financial_models WHERE id = financial_model_id));

CREATE POLICY "Users can create their own loans financing" 
ON public.loans_financing 
FOR INSERT 
WITH CHECK (auth.uid() = (SELECT user_id FROM public.financial_models WHERE id = financial_model_id));

CREATE POLICY "Users can update their own loans financing" 
ON public.loans_financing 
FOR UPDATE 
USING (auth.uid() = (SELECT user_id FROM public.financial_models WHERE id = financial_model_id));

CREATE POLICY "Users can delete their own loans financing" 
ON public.loans_financing 
FOR DELETE 
USING (auth.uid() = (SELECT user_id FROM public.financial_models WHERE id = financial_model_id));

-- Create RLS policies for taxation
CREATE POLICY "Users can view their own taxation" 
ON public.taxation 
FOR SELECT 
USING (auth.uid() = (SELECT user_id FROM public.financial_models WHERE id = financial_model_id));

CREATE POLICY "Users can create their own taxation" 
ON public.taxation 
FOR INSERT 
WITH CHECK (auth.uid() = (SELECT user_id FROM public.financial_models WHERE id = financial_model_id));

CREATE POLICY "Users can update their own taxation" 
ON public.taxation 
FOR UPDATE 
USING (auth.uid() = (SELECT user_id FROM public.financial_models WHERE id = financial_model_id));

CREATE POLICY "Users can delete their own taxation" 
ON public.taxation 
FOR DELETE 
USING (auth.uid() = (SELECT user_id FROM public.financial_models WHERE id = financial_model_id));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_financial_models_updated_at
BEFORE UPDATE ON public.financial_models
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_revenue_streams_updated_at
BEFORE UPDATE ON public.revenue_streams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cost_structures_updated_at
BEFORE UPDATE ON public.cost_structures
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_operational_expenses_updated_at
BEFORE UPDATE ON public.operational_expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_planning_updated_at
BEFORE UPDATE ON public.employee_planning
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_loans_financing_updated_at
BEFORE UPDATE ON public.loans_financing
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_taxation_updated_at
BEFORE UPDATE ON public.taxation
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();