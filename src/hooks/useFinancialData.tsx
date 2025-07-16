import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FinancialData } from '@/pages/Index';

export const useFinancialData = (userId: string | undefined) => {
  const { toast } = useToast();
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentModelId, setCurrentModelId] = useState<string | null>(null);

  // Load financial data when user is available
  useEffect(() => {
    if (userId) {
      loadFinancialData();
    }
  }, [userId]);

  const createDefaultFinancialData = (): FinancialData => ({
    revenueStreams: [],
    costs: {
      revenueStreamCosts: {},
      team: {
        employees: [],
        consultants: [],
        healthCare: { amount: 0, percentage: 0 },
        benefits: { amount: 0, percentage: 0 },
        iqama: { amount: 0, percentage: 0 },
        recruitment: { year1: 0, year2: 0, year3: 0 }
      },
      admin: {
        rent: { 
          monthlyAmount: 0, 
          utilitiesPercentage: 0, 
          year1: 0, year2: 0, year3: 0 
        },
        travel: {
          tripsPerMonth: 0,
          domesticCostPerTrip: 0,
          internationalCostPerTrip: 0,
          domesticTripsRatio: 0,
          year1: 0, year2: 0, year3: 0
        },
        insurance: { 
          percentageOfAssets: 0, 
          year1: 0, year2: 0, year3: 0 
        },
        legal: { year1: 0, year2: 0, year3: 0 },
        accounting: { year1: 0, year2: 0, year3: 0 },
        software: {
          items: [],
          year1: 0, year2: 0, year3: 0
        },
        other: { year1: 0, year2: 0, year3: 0 }
      },
      balanceSheet: {
        fixedAssets: {
          assets: [],
          year1: 0, year2: 0, year3: 0
        },
        accountsReceivable: {
          revenueStreamARs: {},
          totalYear1: 0,
          totalYear2: 0,
          totalYear3: 0
        },
        accountsPayable: {
          daysForPayment: 0,
          year1: 0, year2: 0, year3: 0
        },
        cashAndBank: { year1: 0, year2: 0, year3: 0 },
        inventory: { year1: 0, year2: 0, year3: 0 },
        otherAssets: { year1: 0, year2: 0, year3: 0 },
        otherLiabilities: { year1: 0, year2: 0, year3: 0 }
      },
      marketing: {
        isPercentageOfRevenue: false,
        percentageOfRevenue: 0,
        manualBudget: { year1: 0, year2: 0, year3: 0 },
        digitalAdvertising: { year1: 0, year2: 0, year3: 0 },
        contentCreation: { year1: 0, year2: 0, year3: 0 },
        events: { year1: 0, year2: 0, year3: 0 },
        pr: { year1: 0, year2: 0, year3: 0 },
        brandingDesign: { year1: 0, year2: 0, year3: 0 },
        tools: { year1: 0, year2: 0, year3: 0 },
        other: { year1: 0, year2: 0, year3: 0 }
      }
    },
    loansAndFinancing: {
      loans: [],
      totalInterestExpense: {
        year1: 0,
        year2: 0,
        year3: 0
      }
    },
    taxation: {
      incomeTax: {
        enabled: false,
        corporateRate: 0,
        year1: 0,
        year2: 0,
        year3: 0
      },
      zakat: {
        enabled: false,
        rate: 0,
        calculationMethod: 'net-worth',
        year1: 0,
        year2: 0,
        year3: 0
      }
    },
    employees: [],
    funding: {
      totalFunding: 0,
      burnRate: 0,
      useOfFunds: []
    }
  });

  const loadFinancialData = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      // Get or create financial model
      let { data: models, error: modelsError } = await supabase
        .from('financial_models')
        .select('*')
        .eq('user_id', userId)
        .limit(1);

      if (modelsError) throw modelsError;

      let modelId: string;

      if (!models || models.length === 0) {
        // Create new financial model
        const { data: newModel, error: createError } = await supabase
          .from('financial_models')
          .insert([{
            user_id: userId,
            company_name: 'My Company',
            industry: 'technology',
            currency: 'USD',
            language: 'English'
          }])
          .select()
          .single();

        if (createError) throw createError;
        modelId = newModel.id;
      } else {
        modelId = models[0].id;
      }

      setCurrentModelId(modelId);

      // Load all data in parallel
      const [
        revenueStreamsResult,
        costStructuresResult,
        operationalExpensesResult,
        employeePlanningResult,
        loansFinancingResult,
        taxationResult
      ] = await Promise.all([
        supabase.from('revenue_streams').select('*').eq('financial_model_id', modelId),
        supabase.from('cost_structures').select('*').eq('financial_model_id', modelId),
        supabase.from('operational_expenses').select('*').eq('financial_model_id', modelId),
        supabase.from('employee_planning').select('*').eq('financial_model_id', modelId),
        supabase.from('loans_financing').select('*').eq('financial_model_id', modelId),
        supabase.from('taxation').select('*').eq('financial_model_id', modelId)
      ]);

      // Build financial data from database results
      const defaultData = createDefaultFinancialData();

      // Map revenue streams
      if (revenueStreamsResult.data && revenueStreamsResult.data.length > 0) {
        defaultData.revenueStreams = revenueStreamsResult.data.map(stream => ({
          name: stream.name,
          type: 'saas' as const, // Default type since it's not in DB schema
          year1: stream.year1 || 0,
          year2: stream.year2 || 0,
          year3: stream.year3 || 0,
          growthRate: 0, // Not in DB schema
          arDays: 0 // Not in DB schema
        }));
      }

      // Map taxation data
      if (taxationResult.data && taxationResult.data.length > 0) {
        const taxData = taxationResult.data[0];
        defaultData.taxation = {
          incomeTax: {
            enabled: taxData.corporate_tax_rate > 0,
            corporateRate: taxData.corporate_tax_rate || 0,
            year1: 0,
            year2: 0,
            year3: 0
          },
          zakat: {
            enabled: taxData.vat_rate > 0,
            rate: taxData.vat_rate || 0,
            calculationMethod: 'net-worth',
            year1: 0,
            year2: 0,
            year3: 0
          }
        };
      }

      // Map loans data
      if (loansFinancingResult.data && loansFinancingResult.data.length > 0) {
        defaultData.loansAndFinancing.loans = loansFinancingResult.data.map(loan => ({
          id: loan.id,
          name: loan.type,
          type: loan.type as 'term' | 'line-of-credit' | 'convertible-note',
          principalAmount: loan.amount || 0,
          interestRate: loan.interest_rate || 0,
          termMonths: (loan.term_years || 0) * 12,
          startYear: 'year1' as const,
          isInterestOnly: false
        }));
      }

      setFinancialData(defaultData);

    } catch (error) {
      console.error('Error loading financial data:', error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load your financial data. Creating new model.",
        variant: "destructive"
      });
      setFinancialData(createDefaultFinancialData());
    } finally {
      setLoading(false);
    }
  };

  const saveFinancialData = async (data: FinancialData) => {
    if (!userId || !currentModelId) return;

    try {
      // Save revenue streams
      if (data.revenueStreams.length > 0) {
        // Delete existing streams first
        await supabase
          .from('revenue_streams')
          .delete()
          .eq('financial_model_id', currentModelId);

        // Insert new streams
        await supabase
          .from('revenue_streams')
          .insert(
            data.revenueStreams.map(stream => ({
              financial_model_id: currentModelId,
              name: stream.name,
              year1: stream.year1,
              year2: stream.year2,
              year3: stream.year3
            }))
          );
      }

      // Save taxation data
      if (data.taxation) {
        // Delete existing taxation first
        await supabase
          .from('taxation')
          .delete()
          .eq('financial_model_id', currentModelId);

        // Insert new taxation
        await supabase
          .from('taxation')
          .insert([{
            financial_model_id: currentModelId,
            corporate_tax_rate: data.taxation.incomeTax.corporateRate,
            vat_rate: data.taxation.zakat.rate,
            other_taxes: 0
          }]);
      }

      // Save loans data
      if (data.loansAndFinancing.loans.length > 0) {
        // Delete existing loans first
        await supabase
          .from('loans_financing')
          .delete()
          .eq('financial_model_id', currentModelId);

        // Insert new loans
        await supabase
          .from('loans_financing')
          .insert(
            data.loansAndFinancing.loans.map(loan => ({
              financial_model_id: currentModelId,
              type: loan.type,
              amount: loan.principalAmount,
              interest_rate: loan.interestRate,
              term_years: Math.floor(loan.termMonths / 12)
            }))
          );
      }

      toast({
        title: "Data Saved",
        description: "Your financial data has been saved successfully.",
      });

    } catch (error) {
      console.error('Error saving financial data:', error);
      toast({
        title: "Save Error",
        description: "Failed to save your financial data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateFinancialData = (section: keyof FinancialData, data: any) => {
    const newData = {
      ...financialData!,
      [section]: data
    };
    setFinancialData(newData);
    
    // Auto-save after a short delay
    setTimeout(() => {
      saveFinancialData(newData);
    }, 1000);
  };

  return {
    financialData,
    loading,
    updateFinancialData,
    saveFinancialData: () => financialData && saveFinancialData(financialData),
    loadFinancialData
  };
};