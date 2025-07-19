import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FinancialData } from '@/pages/Index';

export const useFinancialData = (userId: string | undefined) => {
  const { toast } = useToast();
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentModelId, setCurrentModelId] = useState<string | null>(null);
  const [companyData, setCompanyData] = useState<any>(null);
  const [industry, setIndustry] = useState<string>("");
  const [loadingState, setLoadingState] = useState<string>('waiting_for_user');
  const [error, setError] = useState<string | null>(null);

  // Load financial data when user is available
  useEffect(() => {
    if (userId) {
      console.log('💼 Financial Data: Loading for user', userId);
      loadFinancialData();
    } else {
      console.log('💼 Financial Data: No user ID, skipping load');
      setLoading(false);
      setLoadingState('no_user');
    }
  }, [userId]);

  // Add timeout for loading
  useEffect(() => {
    if (loading && userId) {
      const timeoutId = setTimeout(() => {
        if (loading) {
          console.warn('💼 Financial Data: Loading timeout reached');
          setLoading(false);
          setLoadingState('timeout');
          setError('Loading timeout - please try refreshing the page');
        }
      }, 10000);

      return () => clearTimeout(timeoutId);
    }
  }, [loading, userId]);

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
      setLoadingState('loading_models');
      setError(null);
      console.log('💼 Financial Data: Starting load process');

      // Get or create financial model
      let { data: models, error: modelsError } = await supabase
        .from('financial_models')
        .select('*')
        .eq('user_id', userId)
        .limit(1);

      if (modelsError) {
        console.error('💼 Financial Data: Error loading models:', modelsError);
        throw modelsError;
      }

      let modelId: string;

      if (!models || models.length === 0) {
        console.log('💼 Financial Data: Creating new model');
        setLoadingState('creating_model');
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

        if (createError) {
          console.error('💼 Financial Data: Error creating model:', createError);
          throw createError;
        }
        modelId = newModel.id;
      } else {
        modelId = models[0].id;
        console.log('💼 Financial Data: Using existing model', modelId);
      }

      setCurrentModelId(modelId);
      setLoadingState('loading_data');

      const [
        revenueStreamsResult,
        costStructuresResult,
        operationalExpensesResult,
        employeePlanningResult,
        loansFinancingResult,
        taxationResult,
        financialModelResult,
        balanceSheetAssetsResult,
        accountsReceivableResult,
        capTableStakeholdersResult,
        safeAgreementsResult,
        fundUtilizationResult,
        operationalEmployeesResult,
        operationalConsultantsResult
      ] = await Promise.all([
        supabase.from('revenue_streams').select('*').eq('financial_model_id', modelId),
        supabase.from('cost_structures').select('*').eq('financial_model_id', modelId),
        supabase.from('operational_expenses').select('*').eq('financial_model_id', modelId),
        supabase.from('employee_planning').select('*').eq('financial_model_id', modelId),
        supabase.from('loans_financing').select('*').eq('financial_model_id', modelId),
        supabase.from('taxation').select('*').eq('financial_model_id', modelId),
        supabase.from('financial_models').select('*').eq('id', modelId).single(),
        supabase.from('balance_sheet_assets').select('*').eq('financial_model_id', modelId),
        supabase.from('accounts_receivable').select('*').eq('financial_model_id', modelId),
        supabase.from('cap_table_stakeholders').select('*').eq('financial_model_id', modelId),
        supabase.from('safe_agreements').select('*').eq('financial_model_id', modelId),
        supabase.from('fund_utilization').select('*').eq('financial_model_id', modelId),
        supabase.from('operational_expenses_employees').select('*').eq('financial_model_id', modelId),
        supabase.from('operational_expenses_consultants').select('*').eq('financial_model_id', modelId)
      ]);

      setLoadingState('processing_data');

      const defaultData = createDefaultFinancialData();

      if (financialModelResult.data) {
        const loadedCompanyData = {
          companyName: financialModelResult.data.company_name,
          industry: financialModelResult.data.industry,
          currency: financialModelResult.data.currency,
          language: financialModelResult.data.language
        };
        setCompanyData(loadedCompanyData);
        setIndustry(financialModelResult.data.industry || '');
        console.log('💼 Financial Data: Loaded company data:', loadedCompanyData);
      }

      if (revenueStreamsResult.data && revenueStreamsResult.data.length > 0) {
        defaultData.revenueStreams = revenueStreamsResult.data.map(stream => ({
          name: stream.name,
          type: 'saas' as const,
          year1: stream.year1 || 0,
          year2: stream.year2 || 0,
          year3: stream.year3 || 0,
          growthRate: 0,
          arDays: 0
        }));

        defaultData.revenueStreams = defaultData.revenueStreams.map(stream => {
          if (stream.year1 > 0 && stream.year2 > 0) {
            return {
              ...stream,
              growthRate: ((stream.year2 - stream.year1) / stream.year1) * 100
            };
          }
          return stream;
        });
      }

      if (taxationResult.data && taxationResult.data.length > 0) {
        const taxData = taxationResult.data[0];
        defaultData.taxation = {
          incomeTax: {
            enabled: taxData.income_tax_enabled || false,
            corporateRate: taxData.income_tax_rate || 20,
            year1: taxData.income_tax_year1 || 0,
            year2: taxData.income_tax_year2 || 0,
            year3: taxData.income_tax_year3 || 0
          },
          zakat: {
            enabled: taxData.zakat_enabled || false,
            rate: taxData.zakat_rate || 2.5,
            calculationMethod: (taxData.zakat_calculation_method || 'net-worth') as 'net-worth' | 'profit',
            year1: taxData.zakat_year1 || 0,
            year2: taxData.zakat_year2 || 0,
            year3: taxData.zakat_year3 || 0
          }
        };
      }

      if (loansFinancingResult.data && loansFinancingResult.data.length > 0) {
        defaultData.loansAndFinancing.loans = loansFinancingResult.data.map(loan => ({
          id: loan.id,
          name: loan.type,
          type: loan.type as 'term' | 'line-of-credit' | 'convertible-note',
          principalAmount: loan.amount || 0,
          interestRate: loan.interest_rate || 0,
          termMonths: (loan.term_years || 0) * 12,
          startYear: 'year1' as const,
          paymentFrequency: 'monthly' as const,
          gracePeriodMonths: 0,
          isInterestOnly: false
        }));
      }

      if (balanceSheetAssetsResult.data && balanceSheetAssetsResult.data.length > 0) {
        defaultData.costs.balanceSheet.fixedAssets.assets = balanceSheetAssetsResult.data.map(asset => ({
          id: asset.id,
          name: asset.asset_name,
          cost: asset.asset_cost || 0,
          usefulLife: asset.useful_life || 5,
          assetClass: asset.asset_class as 'tangible' | 'intangible',
          isFromCapitalizedPayroll: asset.is_from_capitalized_payroll || false
        }));

        let year1Total = 0, year2Total = 0, year3Total = 0;
        defaultData.costs.balanceSheet.fixedAssets.assets.forEach(asset => {
          const annualDepreciation = asset.cost / asset.usefulLife;
          year1Total += asset.cost - annualDepreciation;
          year2Total += asset.cost - (annualDepreciation * 2);
          year3Total += asset.cost - (annualDepreciation * 3);
        });

        defaultData.costs.balanceSheet.fixedAssets.year1 = Math.max(0, year1Total);
        defaultData.costs.balanceSheet.fixedAssets.year2 = Math.max(0, year2Total);
        defaultData.costs.balanceSheet.fixedAssets.year3 = Math.max(0, year3Total);
      }

      if (accountsReceivableResult.data && accountsReceivableResult.data.length > 0) {
        const arConfig: { [key: string]: any } = {};
        accountsReceivableResult.data.forEach(ar => {
          const revenueStream = defaultData.revenueStreams.find(rs => rs.name === ar.revenue_stream_name);
          if (revenueStream) {
            arConfig[ar.revenue_stream_name] = {
              arDays: ar.ar_days,
              year1: (revenueStream.year1 * ar.ar_days) / 365,
              year2: (revenueStream.year2 * ar.ar_days) / 365,
              year3: (revenueStream.year3 * ar.ar_days) / 365
            };
          }
        });
        
        defaultData.costs.balanceSheet.accountsReceivable.revenueStreamARs = arConfig;
        
        const totalYear1 = Object.values(arConfig).reduce((sum: number, ar: any) => sum + ar.year1, 0);
        const totalYear2 = Object.values(arConfig).reduce((sum: number, ar: any) => sum + ar.year2, 0);
        const totalYear3 = Object.values(arConfig).reduce((sum: number, ar: any) => sum + ar.year3, 0);
        
        defaultData.costs.balanceSheet.accountsReceivable.totalYear1 = totalYear1;
        defaultData.costs.balanceSheet.accountsReceivable.totalYear2 = totalYear2;
        defaultData.costs.balanceSheet.accountsReceivable.totalYear3 = totalYear3;
      }

      if (operationalEmployeesResult.data && operationalEmployeesResult.data.length > 0) {
        defaultData.costs.team.employees = operationalEmployeesResult.data.map(employee => ({
          id: employee.id,
          name: employee.name,
          designation: employee.designation,
          department: employee.department as any,
          salary: employee.salary || 0,
          isCapitalized: employee.is_capitalized || false
        }));
      }

      if (operationalConsultantsResult.data && operationalConsultantsResult.data.length > 0) {
        defaultData.costs.team.consultants = operationalConsultantsResult.data.map(consultant => ({
          id: consultant.id,
          name: consultant.name,
          designation: consultant.designation,
          department: consultant.department as any,
          monthlyCost: consultant.monthly_cost || 0
        }));
      }

      setFinancialData(defaultData);
      setLoadingState('complete');
      console.log('💼 Financial Data: Loading complete');

    } catch (error) {
      console.error('💼 Financial Data: Error loading:', error);
      
      // Create user-friendly error message
      let userMessage = 'We had trouble loading your financial data.';
      let technicalMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (technicalMessage.includes('network') || technicalMessage.includes('timeout')) {
        userMessage = 'Connection issue - please check your internet and try again.';
      } else if (technicalMessage.includes('permission') || technicalMessage.includes('policy')) {
        userMessage = 'Access denied - please sign in again.';
      } else if (technicalMessage.includes('database')) {
        userMessage = 'Database connection issue - we\'re working to fix this.';
      }
      
      setError(userMessage);
      toast({
        title: "Data Loading Issue",
        description: userMessage + " Starting with a fresh model instead.",
        variant: "destructive"
      });
      setFinancialData(createDefaultFinancialData());
      setLoadingState('error');
    } finally {
      setLoading(false);
    }
  };

  const saveCompanyData = async (data: any) => {
    if (!userId || !currentModelId) return;

    try {
      await supabase
        .from('financial_models')
        .update({
          company_name: data.companyName,
          industry: data.industry,
          currency: data.currency,
          language: data.language
        })
        .eq('id', currentModelId);

      setCompanyData(data);
      setIndustry(data.industry);

      toast({
        title: "Company Data Saved",
        description: "Your company information has been saved.",
      });
    } catch (error) {
      console.error('Error saving company data:', error);
      let errorMessage = 'Failed to save your company information.';
      
      if (error instanceof Error) {
        if (error.message.includes('network')) {
          errorMessage = 'Connection lost while saving. Please try again.';
        } else if (error.message.includes('permission')) {
          errorMessage = 'Permission denied. Please sign in again.';
        }
      }
      
      toast({
        title: "Save Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const saveFinancialData = async (data: FinancialData) => {
    if (!userId || !currentModelId) return;

    try {
      await supabase
        .from('revenue_streams')
        .delete()
        .eq('financial_model_id', currentModelId);

      if (data.revenueStreams.length > 0) {
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

      if (data.taxation) {
        await supabase
          .from('taxation')
          .delete()
          .eq('financial_model_id', currentModelId);

        await supabase
          .from('taxation')
          .insert([{
            financial_model_id: currentModelId,
            income_tax_enabled: data.taxation.incomeTax.enabled,
            income_tax_rate: data.taxation.incomeTax.corporateRate,
            income_tax_year1: data.taxation.incomeTax.year1,
            income_tax_year2: data.taxation.incomeTax.year2,
            income_tax_year3: data.taxation.incomeTax.year3,
            zakat_enabled: data.taxation.zakat.enabled,
            zakat_rate: data.taxation.zakat.rate,
            zakat_calculation_method: data.taxation.zakat.calculationMethod,
            zakat_year1: data.taxation.zakat.year1,
            zakat_year2: data.taxation.zakat.year2,
            zakat_year3: data.taxation.zakat.year3,
            legacy_corporate_tax_rate: data.taxation.incomeTax.corporateRate,
            vat_rate: data.taxation.zakat.rate,
            other_taxes: 0
          }]);
      }

      if (data.loansAndFinancing.loans.length > 0) {
        await supabase
          .from('loans_financing')
          .delete()
          .eq('financial_model_id', currentModelId);

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
    
    setTimeout(() => {
      saveSpecificSection(section, data);
    }, 1000);
  };

  const saveSpecificSection = async (section: keyof FinancialData, data: any) => {
    if (!userId || !currentModelId) return;

    try {
      if (section === 'revenueStreams') {
        await supabase
          .from('revenue_streams')
          .delete()
          .eq('financial_model_id', currentModelId);

        if (data.length > 0) {
          await supabase
            .from('revenue_streams')
            .insert(
              data.map((stream: any) => ({
                financial_model_id: currentModelId,
                name: stream.name,
                year1: stream.year1,
                year2: stream.year2,
                year3: stream.year3
              }))
            );
        }
      } else if (section === 'taxation') {
        await supabase
          .from('taxation')
          .delete()
          .eq('financial_model_id', currentModelId);

        await supabase
          .from('taxation')
          .insert([{
            financial_model_id: currentModelId,
            income_tax_enabled: data.incomeTax.enabled,
            income_tax_rate: data.incomeTax.corporateRate,
            income_tax_year1: data.incomeTax.year1,
            income_tax_year2: data.incomeTax.year2,
            income_tax_year3: data.incomeTax.year3,
            zakat_enabled: data.zakat.enabled,
            zakat_rate: data.zakat.rate,
            zakat_calculation_method: data.zakat.calculationMethod,
            zakat_year1: data.zakat.year1,
            zakat_year2: data.zakat.year2,
            zakat_year3: data.zakat.year3,
            legacy_corporate_tax_rate: data.incomeTax.corporateRate,
            vat_rate: data.zakat.rate,
            other_taxes: 0
          }]);
      } else if (section === 'loansAndFinancing') {
        if (data.loans.length > 0) {
          await supabase
            .from('loans_financing')
            .delete()
            .eq('financial_model_id', currentModelId);

          await supabase
            .from('loans_financing')
            .insert(
              data.loans.map((loan: any) => ({
                financial_model_id: currentModelId,
                type: loan.type,
                amount: loan.principalAmount,
                interest_rate: loan.interestRate,
                term_years: Math.floor(loan.termMonths / 12)
              }))
            );
        }
      } else if (section === 'costs') {
        if (data.balanceSheet && data.balanceSheet.fixedAssets) {
          await supabase
            .from('balance_sheet_assets')
            .delete()
            .eq('financial_model_id', currentModelId);

          if (data.balanceSheet.fixedAssets.assets.length > 0) {
            await supabase
              .from('balance_sheet_assets')
              .insert(
                data.balanceSheet.fixedAssets.assets.map((asset: any) => ({
                  financial_model_id: currentModelId,
                  asset_name: asset.name,
                  asset_cost: asset.cost,
                  useful_life: asset.usefulLife,
                  asset_class: asset.assetClass,
                  is_from_capitalized_payroll: asset.isFromCapitalizedPayroll
                }))
              );
          }
        }

        if (data.balanceSheet && data.balanceSheet.accountsReceivable) {
          await supabase
            .from('accounts_receivable')
            .delete()
            .eq('financial_model_id', currentModelId);

          const arEntries = Object.entries(data.balanceSheet.accountsReceivable.revenueStreamARs || {});
          if (arEntries.length > 0) {
            await supabase
              .from('accounts_receivable')
              .insert(
                arEntries.map(([streamName, arData]: [string, any]) => ({
                  financial_model_id: currentModelId,
                  revenue_stream_name: streamName,
                  ar_days: arData.arDays || 30
                }))
              );
          }
        }

        if (data.team) {
          await supabase
            .from('operational_expenses_employees')
            .delete()
            .eq('financial_model_id', currentModelId);

          if (data.team.employees && data.team.employees.length > 0) {
            await supabase
              .from('operational_expenses_employees')
              .insert(
                data.team.employees.map((employee: any) => ({
                  financial_model_id: currentModelId,
                  name: employee.name,
                  designation: employee.designation,
                  department: employee.department,
                  salary: employee.salary,
                  is_capitalized: employee.isCapitalized
                }))
              );
          }

          await supabase
            .from('operational_expenses_consultants')
            .delete()
            .eq('financial_model_id', currentModelId);

          if (data.team.consultants && data.team.consultants.length > 0) {
            await supabase
              .from('operational_expenses_consultants')
              .insert(
                data.team.consultants.map((consultant: any) => ({
                  financial_model_id: currentModelId,
                  name: consultant.name,
                  designation: consultant.designation,
                  department: consultant.department,
                  monthly_cost: consultant.monthlyCost
                }))
              );
          }
        }
      }

    } catch (error) {
      console.error(`Error saving ${section}:`, error);
    }
  };

  const saveCapTableData = async (stakeholders: any[], safeAgreements: any[]) => {
    if (!userId || !currentModelId) return;

    try {
      await supabase
        .from('cap_table_stakeholders')
        .delete()
        .eq('financial_model_id', currentModelId);

      if (stakeholders.length > 0) {
        await supabase
          .from('cap_table_stakeholders')
          .insert(
            stakeholders.map(stakeholder => ({
              financial_model_id: currentModelId,
              name: stakeholder.name,
              type: stakeholder.type,
              shares: stakeholder.shares,
              share_class: stakeholder.shareClass,
              investment_amount: stakeholder.investmentAmount || 0
            }))
          );
      }

      await supabase
        .from('safe_agreements')
        .delete()
        .eq('financial_model_id', currentModelId);

      if (safeAgreements.length > 0) {
        await supabase
          .from('safe_agreements')
          .insert(
            safeAgreements.map(safe => ({
              financial_model_id: currentModelId,
              investor_name: safe.investorName,
              amount: safe.amount,
              valuation_cap: safe.valuationCap,
              discount_rate: safe.discountRate,
              is_converted: safe.isConverted || false
            }))
          );
      }

      toast({
        title: "Cap Table Saved",
        description: "Your cap table data has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving cap table:', error);
      toast({
        title: "Save Error",
        description: "Failed to save cap table data.",
        variant: "destructive"
      });
    }
  };

  const saveFundUtilizationData = async (useOfFunds: any[]) => {
    if (!userId || !currentModelId) return;

    try {
      await supabase
        .from('fund_utilization')
        .delete()
        .eq('financial_model_id', currentModelId);

      if (useOfFunds.length > 0) {
        await supabase
          .from('fund_utilization')
          .insert(
            useOfFunds.map(fund => ({
              financial_model_id: currentModelId,
              category: fund.category,
              description: fund.description,
              amount: fund.amount,
              percentage: fund.percentage,
              timeline: fund.timeline || 'year1'
            }))
          );
      }

      toast({
        title: "Fund Utilization Saved", 
        description: "Your fund utilization data has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving fund utilization:', error);
      toast({
        title: "Save Error",
        description: "Failed to save fund utilization data.",
        variant: "destructive"
      });
    }
  };

  const resetSetup = () => {
    console.log('💼 Financial Data: Resetting setup');
    setCompanyData(null);
    setIndustry("");
    setFinancialData(createDefaultFinancialData());
  };

  return {
    financialData,
    loading,
    updateFinancialData,
    saveFinancialData: () => financialData && saveFinancialData(financialData),
    loadFinancialData,
    companyData,
    setCompanyData: saveCompanyData,
    industry,
    setIndustry,
    saveCapTableData,
    saveFundUtilizationData,
    resetSetup,
    debugInfo: {
      loadingState,
      error,
      currentModelId
    }
  };
};
