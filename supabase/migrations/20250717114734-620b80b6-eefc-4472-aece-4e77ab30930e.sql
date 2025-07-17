-- Create table for operational expenses employees
CREATE TABLE public.operational_expenses_employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  financial_model_id UUID NOT NULL,
  name TEXT NOT NULL,
  designation TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'other',
  salary NUMERIC NOT NULL DEFAULT 0,
  is_capitalized BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for operational expenses consultants  
CREATE TABLE public.operational_expenses_consultants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  financial_model_id UUID NOT NULL,
  name TEXT NOT NULL,
  designation TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'other',
  monthly_cost NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.operational_expenses_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operational_expenses_consultants ENABLE ROW LEVEL SECURITY;

-- Create policies for operational_expenses_employees
CREATE POLICY "Users can view their own operational expenses employees" 
ON public.operational_expenses_employees 
FOR SELECT 
USING (auth.uid() = ( SELECT financial_models.user_id
   FROM financial_models
  WHERE (financial_models.id = operational_expenses_employees.financial_model_id)));

CREATE POLICY "Users can create their own operational expenses employees" 
ON public.operational_expenses_employees 
FOR INSERT 
WITH CHECK (auth.uid() = ( SELECT financial_models.user_id
   FROM financial_models
  WHERE (financial_models.id = operational_expenses_employees.financial_model_id)));

CREATE POLICY "Users can update their own operational expenses employees" 
ON public.operational_expenses_employees 
FOR UPDATE 
USING (auth.uid() = ( SELECT financial_models.user_id
   FROM financial_models
  WHERE (financial_models.id = operational_expenses_employees.financial_model_id)));

CREATE POLICY "Users can delete their own operational expenses employees" 
ON public.operational_expenses_employees 
FOR DELETE 
USING (auth.uid() = ( SELECT financial_models.user_id
   FROM financial_models
  WHERE (financial_models.id = operational_expenses_employees.financial_model_id)));

-- Create policies for operational_expenses_consultants
CREATE POLICY "Users can view their own operational expenses consultants" 
ON public.operational_expenses_consultants 
FOR SELECT 
USING (auth.uid() = ( SELECT financial_models.user_id
   FROM financial_models
  WHERE (financial_models.id = operational_expenses_consultants.financial_model_id)));

CREATE POLICY "Users can create their own operational expenses consultants" 
ON public.operational_expenses_consultants 
FOR INSERT 
WITH CHECK (auth.uid() = ( SELECT financial_models.user_id
   FROM financial_models
  WHERE (financial_models.id = operational_expenses_consultants.financial_model_id)));

CREATE POLICY "Users can update their own operational expenses consultants" 
ON public.operational_expenses_consultants 
FOR UPDATE 
USING (auth.uid() = ( SELECT financial_models.user_id
   FROM financial_models
  WHERE (financial_models.id = operational_expenses_consultants.financial_model_id)));

CREATE POLICY "Users can delete their own operational expenses consultants" 
ON public.operational_expenses_consultants 
FOR DELETE 
USING (auth.uid() = ( SELECT financial_models.user_id
   FROM financial_models
  WHERE (financial_models.id = operational_expenses_consultants.financial_model_id)));

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_operational_expenses_employees_updated_at
BEFORE UPDATE ON public.operational_expenses_employees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_operational_expenses_consultants_updated_at
BEFORE UPDATE ON public.operational_expenses_consultants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();