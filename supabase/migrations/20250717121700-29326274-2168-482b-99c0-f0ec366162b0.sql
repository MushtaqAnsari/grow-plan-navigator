-- Add foreign key constraints to connect all tables to financial_models

-- Add foreign key for revenue_streams
ALTER TABLE public.revenue_streams 
ADD CONSTRAINT revenue_streams_financial_model_id_fkey 
FOREIGN KEY (financial_model_id) REFERENCES public.financial_models(id) ON DELETE CASCADE;

-- Add foreign key for cost_structures
ALTER TABLE public.cost_structures 
ADD CONSTRAINT cost_structures_financial_model_id_fkey 
FOREIGN KEY (financial_model_id) REFERENCES public.financial_models(id) ON DELETE CASCADE;

-- Add foreign key for operational_expenses
ALTER TABLE public.operational_expenses 
ADD CONSTRAINT operational_expenses_financial_model_id_fkey 
FOREIGN KEY (financial_model_id) REFERENCES public.financial_models(id) ON DELETE CASCADE;

-- Add foreign key for operational_expenses_employees
ALTER TABLE public.operational_expenses_employees 
ADD CONSTRAINT operational_expenses_employees_financial_model_id_fkey 
FOREIGN KEY (financial_model_id) REFERENCES public.financial_models(id) ON DELETE CASCADE;

-- Add foreign key for operational_expenses_consultants
ALTER TABLE public.operational_expenses_consultants 
ADD CONSTRAINT operational_expenses_consultants_financial_model_id_fkey 
FOREIGN KEY (financial_model_id) REFERENCES public.financial_models(id) ON DELETE CASCADE;

-- Add foreign key for employee_planning
ALTER TABLE public.employee_planning 
ADD CONSTRAINT employee_planning_financial_model_id_fkey 
FOREIGN KEY (financial_model_id) REFERENCES public.financial_models(id) ON DELETE CASCADE;

-- Add foreign key for loans_financing
ALTER TABLE public.loans_financing 
ADD CONSTRAINT loans_financing_financial_model_id_fkey 
FOREIGN KEY (financial_model_id) REFERENCES public.financial_models(id) ON DELETE CASCADE;

-- Add foreign key for taxation
ALTER TABLE public.taxation 
ADD CONSTRAINT taxation_financial_model_id_fkey 
FOREIGN KEY (financial_model_id) REFERENCES public.financial_models(id) ON DELETE CASCADE;

-- Add foreign key for balance_sheet_assets
ALTER TABLE public.balance_sheet_assets 
ADD CONSTRAINT balance_sheet_assets_financial_model_id_fkey 
FOREIGN KEY (financial_model_id) REFERENCES public.financial_models(id) ON DELETE CASCADE;

-- Add foreign key for accounts_receivable
ALTER TABLE public.accounts_receivable 
ADD CONSTRAINT accounts_receivable_financial_model_id_fkey 
FOREIGN KEY (financial_model_id) REFERENCES public.financial_models(id) ON DELETE CASCADE;

-- Add foreign key for cap_table_stakeholders
ALTER TABLE public.cap_table_stakeholders 
ADD CONSTRAINT cap_table_stakeholders_financial_model_id_fkey 
FOREIGN KEY (financial_model_id) REFERENCES public.financial_models(id) ON DELETE CASCADE;

-- Add foreign key for safe_agreements
ALTER TABLE public.safe_agreements 
ADD CONSTRAINT safe_agreements_financial_model_id_fkey 
FOREIGN KEY (financial_model_id) REFERENCES public.financial_models(id) ON DELETE CASCADE;

-- Add foreign key for fund_utilization
ALTER TABLE public.fund_utilization 
ADD CONSTRAINT fund_utilization_financial_model_id_fkey 
FOREIGN KEY (financial_model_id) REFERENCES public.financial_models(id) ON DELETE CASCADE;