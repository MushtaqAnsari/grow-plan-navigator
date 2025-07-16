-- Create Balance Sheet related tables
CREATE TABLE public.balance_sheet_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  financial_model_id UUID NOT NULL,
  asset_name TEXT NOT NULL,
  asset_cost NUMERIC DEFAULT 0,
  useful_life INTEGER DEFAULT 5,
  asset_class TEXT DEFAULT 'tangible',
  is_from_capitalized_payroll BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.balance_sheet_assets ENABLE ROW LEVEL SECURITY;

-- Create policies for balance sheet assets
CREATE POLICY "Users can view their own balance sheet assets"
ON public.balance_sheet_assets
FOR SELECT
USING (auth.uid() = (SELECT user_id FROM financial_models WHERE id = balance_sheet_assets.financial_model_id));

CREATE POLICY "Users can create their own balance sheet assets"
ON public.balance_sheet_assets
FOR INSERT
WITH CHECK (auth.uid() = (SELECT user_id FROM financial_models WHERE id = balance_sheet_assets.financial_model_id));

CREATE POLICY "Users can update their own balance sheet assets"
ON public.balance_sheet_assets
FOR UPDATE
USING (auth.uid() = (SELECT user_id FROM financial_models WHERE id = balance_sheet_assets.financial_model_id));

CREATE POLICY "Users can delete their own balance sheet assets"
ON public.balance_sheet_assets
FOR DELETE
USING (auth.uid() = (SELECT user_id FROM financial_models WHERE id = balance_sheet_assets.financial_model_id));

-- Create Accounts Receivable Configuration table
CREATE TABLE public.accounts_receivable (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  financial_model_id UUID NOT NULL,
  revenue_stream_name TEXT NOT NULL,
  ar_days INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(financial_model_id, revenue_stream_name)
);

-- Enable RLS for AR
ALTER TABLE public.accounts_receivable ENABLE ROW LEVEL SECURITY;

-- Create policies for accounts receivable
CREATE POLICY "Users can view their own accounts receivable"
ON public.accounts_receivable
FOR SELECT
USING (auth.uid() = (SELECT user_id FROM financial_models WHERE id = accounts_receivable.financial_model_id));

CREATE POLICY "Users can create their own accounts receivable"
ON public.accounts_receivable
FOR INSERT
WITH CHECK (auth.uid() = (SELECT user_id FROM financial_models WHERE id = accounts_receivable.financial_model_id));

CREATE POLICY "Users can update their own accounts receivable"
ON public.accounts_receivable
FOR UPDATE
USING (auth.uid() = (SELECT user_id FROM financial_models WHERE id = accounts_receivable.financial_model_id));

CREATE POLICY "Users can delete their own accounts receivable"
ON public.accounts_receivable
FOR DELETE
USING (auth.uid() = (SELECT user_id FROM financial_models WHERE id = accounts_receivable.financial_model_id));

-- Create Cap Table related tables
CREATE TABLE public.cap_table_stakeholders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  financial_model_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'founder', -- founder, investor, employee, advisor
  shares NUMERIC DEFAULT 0,
  share_class TEXT DEFAULT 'common',
  investment_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for cap table stakeholders
ALTER TABLE public.cap_table_stakeholders ENABLE ROW LEVEL SECURITY;

-- Create policies for cap table stakeholders
CREATE POLICY "Users can view their own cap table stakeholders"
ON public.cap_table_stakeholders
FOR SELECT
USING (auth.uid() = (SELECT user_id FROM financial_models WHERE id = cap_table_stakeholders.financial_model_id));

CREATE POLICY "Users can create their own cap table stakeholders"
ON public.cap_table_stakeholders
FOR INSERT
WITH CHECK (auth.uid() = (SELECT user_id FROM financial_models WHERE id = cap_table_stakeholders.financial_model_id));

CREATE POLICY "Users can update their own cap table stakeholders"
ON public.cap_table_stakeholders
FOR UPDATE
USING (auth.uid() = (SELECT user_id FROM financial_models WHERE id = cap_table_stakeholders.financial_model_id));

CREATE POLICY "Users can delete their own cap table stakeholders"
ON public.cap_table_stakeholders
FOR DELETE
USING (auth.uid() = (SELECT user_id FROM financial_models WHERE id = cap_table_stakeholders.financial_model_id));

-- Create SAFE Agreements table
CREATE TABLE public.safe_agreements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  financial_model_id UUID NOT NULL,
  investor_name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  valuation_cap NUMERIC DEFAULT 0,
  discount_rate NUMERIC DEFAULT 0,
  is_converted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for SAFE agreements
ALTER TABLE public.safe_agreements ENABLE ROW LEVEL SECURITY;

-- Create policies for SAFE agreements
CREATE POLICY "Users can view their own safe agreements"
ON public.safe_agreements
FOR SELECT
USING (auth.uid() = (SELECT user_id FROM financial_models WHERE id = safe_agreements.financial_model_id));

CREATE POLICY "Users can create their own safe agreements"
ON public.safe_agreements
FOR INSERT
WITH CHECK (auth.uid() = (SELECT user_id FROM financial_models WHERE id = safe_agreements.financial_model_id));

CREATE POLICY "Users can update their own safe agreements"
ON public.safe_agreements
FOR UPDATE
USING (auth.uid() = (SELECT user_id FROM financial_models WHERE id = safe_agreements.financial_model_id));

CREATE POLICY "Users can delete their own safe agreements"
ON public.safe_agreements
FOR DELETE
USING (auth.uid() = (SELECT user_id FROM financial_models WHERE id = safe_agreements.financial_model_id));

-- Create Fund Utilization table
CREATE TABLE public.fund_utilization (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  financial_model_id UUID NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  amount NUMERIC DEFAULT 0,
  percentage NUMERIC DEFAULT 0,
  timeline TEXT DEFAULT 'year1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for fund utilization
ALTER TABLE public.fund_utilization ENABLE ROW LEVEL SECURITY;

-- Create policies for fund utilization
CREATE POLICY "Users can view their own fund utilization"
ON public.fund_utilization
FOR SELECT
USING (auth.uid() = (SELECT user_id FROM financial_models WHERE id = fund_utilization.financial_model_id));

CREATE POLICY "Users can create their own fund utilization"
ON public.fund_utilization
FOR INSERT
WITH CHECK (auth.uid() = (SELECT user_id FROM financial_models WHERE id = fund_utilization.financial_model_id));

CREATE POLICY "Users can update their own fund utilization"
ON public.fund_utilization
FOR UPDATE
USING (auth.uid() = (SELECT user_id FROM financial_models WHERE id = fund_utilization.financial_model_id));

CREATE POLICY "Users can delete their own fund utilization"
ON public.fund_utilization
FOR DELETE
USING (auth.uid() = (SELECT user_id FROM financial_models WHERE id = fund_utilization.financial_model_id));

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_balance_sheet_assets_updated_at
BEFORE UPDATE ON public.balance_sheet_assets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_accounts_receivable_updated_at
BEFORE UPDATE ON public.accounts_receivable
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cap_table_stakeholders_updated_at
BEFORE UPDATE ON public.cap_table_stakeholders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_safe_agreements_updated_at
BEFORE UPDATE ON public.safe_agreements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fund_utilization_updated_at
BEFORE UPDATE ON public.fund_utilization
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();