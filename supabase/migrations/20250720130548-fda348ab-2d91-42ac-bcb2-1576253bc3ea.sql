-- Create direct_costs table for revenue stream direct costs
CREATE TABLE public.direct_costs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  financial_model_id UUID NOT NULL,
  user_id UUID NOT NULL,
  revenue_stream_name TEXT NOT NULL,
  cost_type TEXT NOT NULL, -- 'cogs', 'processing', 'fulfillment', or custom
  cost_name TEXT, -- for custom cost types
  year1 NUMERIC DEFAULT 0,
  year2 NUMERIC DEFAULT 0,
  year3 NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.direct_costs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own direct costs" 
ON public.direct_costs 
FOR SELECT 
USING (auth.uid() = (
  SELECT financial_models.user_id
  FROM financial_models
  WHERE financial_models.id = direct_costs.financial_model_id
));

CREATE POLICY "Users can create their own direct costs" 
ON public.direct_costs 
FOR INSERT 
WITH CHECK (auth.uid() = (
  SELECT financial_models.user_id
  FROM financial_models
  WHERE financial_models.id = direct_costs.financial_model_id
));

CREATE POLICY "Users can update their own direct costs" 
ON public.direct_costs 
FOR UPDATE 
USING (auth.uid() = (
  SELECT financial_models.user_id
  FROM financial_models
  WHERE financial_models.id = direct_costs.financial_model_id
));

CREATE POLICY "Users can delete their own direct costs" 
ON public.direct_costs 
FOR DELETE 
USING (auth.uid() = (
  SELECT financial_models.user_id
  FROM financial_models
  WHERE financial_models.id = direct_costs.financial_model_id
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_direct_costs_updated_at
BEFORE UPDATE ON public.direct_costs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();