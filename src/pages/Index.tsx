import IncomeStatement from "@/components/IncomeStatement";
import Analysis from "@/components/Analysis";
import ValuationModel from "@/components/ValuationModel";
import FundUtilization from "@/components/FundUtilization";
import Valuation from "@/components/Valuation";
import Report from "@/components/Report";
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import BalanceSheet from "@/components/BalanceSheet";
import CompanySetup from "@/components/CompanySetup";
import FinancialModelAgent from "@/components/FinancialModelAgent";
import DebugPanel from "@/components/DebugPanel";
import { BarChart3, FileText, TrendingUp, Users, DollarSign, Target, Building2, Settings, LogOut, Bot, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFinancialData } from "@/hooks/useFinancialData";
import ErrorMessage from "@/components/ErrorMessage";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createCyberLabsDemoData, createCyberLabsCompanyData } from "@/utils/demoData";

export interface FinancialData {
  companyData?: {
    companyName: string;
    industry: string;
    currency: string;
    language: string;
    planningPeriod: number;
  };
  revenueStreams: {
    name: string;
    type: 'saas' | 'ecommerce' | 'advertising' | 'one-time' | 'consulting' | 'commission' | 'freemium';
    year1: number;
    year2: number;
    year3: number;
    growthRate: number;
    arDays: number;
  }[];
  costs: {
    revenueStreamCosts: {
      [key: string]: {
        directCosts: {
          cogs: { year1: number; year2: number; year3: number; };
          processing: { year1: number; year2: number; year3: number; };
          fulfillment: { year1: number; year2: number; year3: number; };
        };
      };
    };
    team: {
      employees: {
        id: string;
        name: string;
        designation: string;
        department: 'technology' | 'sales' | 'marketing' | 'operations' | 'hr' | 'finance' | 'other';
        salary: number;
        isCapitalized?: boolean;
      }[];
      consultants: {
        id: string;
        name: string;
        designation: string;
        department: 'technology' | 'sales' | 'marketing' | 'operations' | 'hr' | 'finance' | 'other';
        monthlyCost: number;
      }[];
      healthCare: { amount: number; percentage: number; };
      benefits: { amount: number; percentage: number; };
      iqama: { amount: number; percentage: number; };
      recruitment: { year1: number; year2: number; year3: number; };
    };
    admin: {
      rent: { 
        monthlyAmount: number; 
        utilitiesPercentage: number; 
        year1: number; year2: number; year3: number; 
      };
      travel: {
        tripsPerMonth: number;
        domesticCostPerTrip: number;
        internationalCostPerTrip: number;
        domesticTripsRatio: number;
        year1: number; year2: number; year3: number;
      };
      insurance: { 
        percentageOfAssets: number; 
        year1: number; year2: number; year3: number; 
      };
      legal: { year1: number; year2: number; year3: number; };
      accounting: { year1: number; year2: number; year3: number; };
      software: {
        items: {
          id: string;
          name: string;
          department: 'technology' | 'sales' | 'marketing' | 'operations' | 'hr' | 'finance' | 'other';
          costType: 'monthly' | 'yearly' | 'one-time';
          amount: number;
        }[];
        year1: number; year2: number; year3: number;
      };
      other: { year1: number; year2: number; year3: number; };
    };
    balanceSheet: {
      fixedAssets: {
        assets: {
          id: string;
          name: string;
          cost: number;
          usefulLife: number;
          assetClass: 'tangible' | 'intangible';
          isFromCapitalizedPayroll?: boolean;
          linkedEmployeeId?: string;
        }[];
        year1: number; year2: number; year3: number;
      };
      accountsReceivable: {
        revenueStreamARs: {
          [key: string]: {
            arDays: number;
            year1: number;
            year2: number;
            year3: number;
          };
        };
        totalYear1: number;
        totalYear2: number;
        totalYear3: number;
      };
      accountsPayable: {
        daysForPayment: number;
        year1: number; year2: number; year3: number;
      };
      cashAndBank: { year1: number; year2: number; year3: number; };
      inventory: { year1: number; year2: number; year3: number; };
      otherAssets: { year1: number; year2: number; year3: number; };
      otherLiabilities: { year1: number; year2: number; year3: number; };
    };
    marketing: {
      isPercentageOfRevenue: boolean;
      percentageOfRevenue: number;
      manualBudget: { year1: number; year2: number; year3: number; };
      digitalAdvertising: { year1: number; year2: number; year3: number; };
      contentCreation: { year1: number; year2: number; year3: number; };
      events: { year1: number; year2: number; year3: number; };
      pr: { year1: number; year2: number; year3: number; };
      brandingDesign: { year1: number; year2: number; year3: number; };
      tools: { year1: number; year2: number; year3: number; };
      other: { year1: number; year2: number; year3: number; };
    };
  };
  loansAndFinancing: {
    loans: {
      id: string;
      name: string;
      type: 'term' | 'line-of-credit' | 'convertible-note';
      principalAmount: number;
      interestRate: number;
      termMonths: number;
      startYear: 'year1' | 'year2' | 'year3';
      paymentFrequency: 'monthly' | 'quarterly' | 'annually';
      gracePeriodMonths: number;
      isInterestOnly?: boolean;
      conversionDetails?: {
        discountRate: number;
        valuationCap: number;
        automaticConversion: boolean;
      };
    }[];
    totalInterestExpense: {
      year1: number;
      year2: number;
      year3: number;
    };
  };
  taxation?: {
    incomeTax: {
      enabled: boolean;
      corporateRate: number;
      year1: number;
      year2: number;
      year3: number;
    };
    zakat: {
      enabled: boolean;
      rate: number;
      calculationMethod: 'net-worth' | 'profit';
      year1: number;
      year2: number;
      year3: number;
    };
  };
  employees: {
    id: string;
    name: string;
    designation: string;
    department: 'technology' | 'sales' | 'marketing' | 'operations' | 'hr' | 'finance' | 'other';
    salary: number;
    isCapitalized?: boolean;
  }[];
  funding: {
    totalFunding: number;
    burnRate: number;
    useOfFunds: {
      category: string;
      percentage: number;
      amount: number;
    }[];
  };
}

const Index = () => {
  const { user, signOut, error: authError, debugInfo: authDebug } = useAuth();
  const { 
    financialData, 
    loading, 
    updateFinancialData, 
    companyData, 
    setCompanyData, 
    industry, 
    setIndustry,
    resetSetup,
    debugInfo: financialDebug,
    currentModelId
  } = useFinancialData(user?.id);
  
  const dataError = financialDebug?.error;
  const [activeTab, setActiveTab] = useState("income-statement");
  const [showAIAgent, setShowAIAgent] = useState(false);
  const [forceShowChoices, setForceShowChoices] = useState(false);
  const { toast } = useToast();

  console.log('🎯 Index: Render state', {
    user: !!user,
    loading,
    financialData: !!financialData,
    companyData: !!companyData,
    showAIAgent,
    forceShowChoices
  });

  const handleAIDataGenerated = async (generatedData: any) => {
    try {
      console.log('🤖 AI Data Generated:', generatedData);
      
      if (generatedData.companyData) {
        setCompanyData(generatedData.companyData);
        setIndustry(generatedData.companyData.industry);
      }

      if (generatedData.revenueStreams) {
        const mappedRevenue = generatedData.revenueStreams.map((stream: any) => ({
          ...stream,
          type: 'saas' as const,
          growthRate: 20,
          arDays: 30
        }));
        await updateFinancialData('revenueStreams', mappedRevenue);
      }

      if (generatedData.costStructures) {
        const existingCosts = financialData?.costs || {
          revenueStreamCosts: {},
          team: { employees: [], consultants: [], healthCare: { amount: 0, percentage: 0 }, benefits: { amount: 0, percentage: 0 }, iqama: { amount: 0, percentage: 0 }, recruitment: { year1: 0, year2: 0, year3: 0 } },
          admin: { rent: { monthlyAmount: 0, utilitiesPercentage: 0, year1: 0, year2: 0, year3: 0 }, travel: { tripsPerMonth: 0, domesticCostPerTrip: 0, internationalCostPerTrip: 0, domesticTripsRatio: 0, year1: 0, year2: 0, year3: 0 }, insurance: { percentageOfAssets: 0, year1: 0, year2: 0, year3: 0 }, legal: { year1: 0, year2: 0, year3: 0 }, accounting: { year1: 0, year2: 0, year3: 0 }, software: { items: [], year1: 0, year2: 0, year3: 0 }, other: { year1: 0, year2: 0, year3: 0 } },
          balanceSheet: { fixedAssets: { assets: [], year1: 0, year2: 0, year3: 0 }, accountsReceivable: { revenueStreamARs: {}, totalYear1: 0, totalYear2: 0, totalYear3: 0 }, accountsPayable: { daysForPayment: 30, year1: 0, year2: 0, year3: 0 }, cashAndBank: { year1: 0, year2: 0, year3: 0 }, inventory: { year1: 0, year2: 0, year3: 0 }, otherAssets: { year1: 0, year2: 0, year3: 0 }, otherLiabilities: { year1: 0, year2: 0, year3: 0 } },
          marketing: { isPercentageOfRevenue: true, percentageOfRevenue: 10, manualBudget: { year1: 0, year2: 0, year3: 0 }, digitalAdvertising: { year1: 0, year2: 0, year3: 0 }, contentCreation: { year1: 0, year2: 0, year3: 0 }, events: { year1: 0, year2: 0, year3: 0 }, pr: { year1: 0, year2: 0, year3: 0 }, brandingDesign: { year1: 0, year2: 0, year3: 0 }, tools: { year1: 0, year2: 0, year3: 0 }, other: { year1: 0, year2: 0, year3: 0 } }
        };
        
        const totalCostsByYear = generatedData.costStructures.reduce((acc: any, cost: any) => {
          acc.year1 += cost.year1 || 0;
          acc.year2 += cost.year2 || 0;
          acc.year3 += cost.year3 || 0;
          acc.year4 += cost.year4 || 0;
          acc.year5 += cost.year5 || 0;
          return acc;
        }, { year1: 0, year2: 0, year3: 0, year4: 0, year5: 0 });

        existingCosts.admin.other = {
          year1: totalCostsByYear.year1,
          year2: totalCostsByYear.year2,
          year3: totalCostsByYear.year3
        };
        
        await updateFinancialData('costs', existingCosts);
      }

      if (generatedData.employeePlanning) {
        const mappedEmployees = generatedData.employeePlanning.map((emp: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          name: emp.role,
          designation: emp.role,
          department: 'other' as const,
          salary: emp.salary_per_employee || 50000,
          isCapitalized: false
        }));
        await updateFinancialData('employees', mappedEmployees);
      }

      if (generatedData.fundUtilization) {
        const totalFunding = generatedData.fundUtilization.reduce((acc: number, item: any) => acc + (item.amount || 0), 0);
        await updateFinancialData('funding', {
          totalFunding,
          burnRate: totalFunding / 24,
          useOfFunds: generatedData.fundUtilization.map((item: any) => ({
            category: item.category,
            percentage: item.percentage || 0,
            amount: item.amount || 0
          }))
        });
      }

      if (generatedData.taxation) {
        await updateFinancialData('taxation', {
          incomeTax: {
            enabled: generatedData.taxation.income_tax_enabled || false,
            corporateRate: generatedData.taxation.corporate_tax_rate || 0,
            year1: 0,
            year2: 0,
            year3: 0
          },
          zakat: {
            enabled: generatedData.taxation.zakat_enabled || false,
            rate: 2.5,
            calculationMethod: 'net-worth' as const,
            year1: 0,
            year2: 0,
            year3: 0
          }
        });
      }

      setShowAIAgent(false);
      setForceShowChoices(false);
      setActiveTab("income-statement");
      
    } catch (error) {
      console.error('Error saving AI generated data:', error);
      toast({
        title: "Error",
        description: "Failed to save generated data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResetSetup = () => {
    console.log('🔄 Resetting setup');
    resetSetup();
    setForceShowChoices(true);
    setShowAIAgent(false);
    setActiveTab("income-statement");
  };

  const handleRefreshData = () => {
    console.log('🔄 Refreshing data');
    window.location.reload();
  };

  // Show authentication error if any
  if (authError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <ErrorMessage 
          error={authError} 
          context="auth"
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Show data error if any
  if (dataError && user && !loading) {
    return (
      <div className="min-h-screen bg-background">
        <DebugPanel
          authDebug={authDebug}
          financialDebug={financialDebug}
          onRefresh={handleRefreshData}
          onReset={handleResetSetup}
        />
        <div className="min-h-screen flex items-center justify-center p-4">
          <ErrorMessage 
            error={dataError} 
            context="data"
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 mb-2">Loading your financial data...</p>
          {financialDebug?.loadingState && (
            <p className="text-xs text-slate-500">
              Status: {financialDebug.loadingState.replace(/_/g, ' ')}
            </p>
          )}
        </div>
        <DebugPanel
          authDebug={authDebug}
          financialDebug={financialDebug}
          onRefresh={handleRefreshData}
          onReset={handleResetSetup}
        />
      </div>
    );
  }

  if (!financialData && financialDebug?.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Loading Error
            </CardTitle>
            <CardDescription>
              Unable to load your financial data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-red-50 rounded-lg text-sm text-red-700">
              {financialDebug.error}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRefreshData} className="flex-1">
                Try Again
              </Button>
              <Button variant="outline" onClick={handleResetSetup} className="flex-1">
                Reset Setup
              </Button>
            </div>
          </CardContent>
        </Card>
        <DebugPanel
          authDebug={authDebug}
          financialDebug={financialDebug}
          onRefresh={handleRefreshData}
          onReset={handleResetSetup}
        />
      </div>
    );
  }

  if (!financialData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Unable to load financial data. Please try again.</p>
          <Button onClick={handleRefreshData} className="mt-4">
            Retry
          </Button>
        </div>
        <DebugPanel
          authDebug={authDebug}
          financialDebug={financialDebug}
          onRefresh={handleRefreshData}
          onReset={handleResetSetup}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">
              Financial Modeling Platform
            </h1>
            <p className="text-lg text-slate-600">
              Build comprehensive financial models for your startup across any sector
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              {user?.email}
            </span>
            <Button 
              variant="outline" 
              onClick={signOut}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {showAIAgent ? (
          <FinancialModelAgent 
            onDataGenerated={handleAIDataGenerated}
            onSwitchToManual={() => {
              setShowAIAgent(false);
              setForceShowChoices(true);
            }}
          />
        ) : (!companyData || forceShowChoices) ? (
          <div className="space-y-6">
            <Card className="max-w-2xl mx-auto shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center bg-gradient-to-r from-primary/5 to-blue-50 rounded-t-xl">
                <CardTitle className="text-2xl mb-2 flex items-center justify-center gap-3">
                  <Bot className="w-8 h-8 text-primary" />
                  Welcome to Financial Model Builder
                </CardTitle>
                <CardDescription>
                  Choose how you'd like to create your financial model
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Button
                    variant="outline"
                    className="h-32 flex flex-col items-center justify-center gap-4 hover:bg-primary/5 border-2 hover:border-primary/20 transition-all duration-200"
                    onClick={() => {
                      setShowAIAgent(true);
                      setForceShowChoices(false);
                    }}
                  >
                    <Bot className="h-8 w-8 text-primary" />
                    <div className="text-center">
                      <div className="font-semibold text-lg">AI Financial Agent</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Describe your needs, get instant model
                      </div>
                      <div className="text-xs text-primary mt-2 font-medium">
                        ✨ Recommended for quick setup
                      </div>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-32 flex flex-col items-center justify-center gap-4 hover:bg-slate-50 border-2 hover:border-slate-200 transition-all duration-200"
                    onClick={() => {
                      setShowAIAgent(false);
                      setForceShowChoices(false);
                    }}
                  >
                    <FileText className="h-8 w-8 text-slate-600" />
                    <div className="text-center">
                      <div className="font-semibold text-lg">Manual Entry</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Build step-by-step manually
                      </div>
                      <div className="text-xs text-slate-600 mt-2">
                        Full control over every detail
                      </div>
                    </div>
                  </Button>
                </div>
                
                {companyData && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700 mb-2">
                      <strong>Existing setup found:</strong> {companyData.companyName}
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setForceShowChoices(false)}
                      className="text-blue-600 p-0 h-auto"
                    >
                      Continue with existing setup →
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {!forceShowChoices && (
              <CompanySetup onSetupComplete={(data) => {
                setCompanyData(data);
                setIndustry(data.industry);
                
                // Save company data with planning period to financial data
                updateFinancialData('companyData', {
                  companyName: data.companyName,
                  industry: data.industry,
                  currency: data.currency,
                  language: data.language,
                  planningPeriod: data.planningPeriod || 3
                });
                
                if (data.companyName === "CyberLabs") {
                  const demoData = createCyberLabsDemoData();
                  Object.keys(demoData).forEach(key => {
                    updateFinancialData(key as keyof FinancialData, demoData[key as keyof FinancialData]);
                  });
                }
                
                setActiveTab("income-statement");
                setForceShowChoices(false);
              }} />
            )}
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <div className="bg-white rounded-lg p-4 shadow-sm border flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-800">{companyData?.companyName || "Company Name"}</h2>
                    <p className="text-sm text-slate-600 capitalize">{companyData?.industry || industry} • {companyData?.businessStage || "Growth Stage"}</p>
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-xs text-slate-500">Founder</p>
                    <p className="text-sm font-medium text-slate-700">{companyData?.founderName || "N/A"}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">Stage</p>
                    <p className="text-sm font-medium text-slate-700 capitalize">{companyData?.fundingStage || "N/A"}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => setForceShowChoices(true)}
                >
                  <Bot className="w-4 h-4" />
                  AI Agent
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={handleResetSetup}
                >
                  <Settings className="w-4 h-4" />
                  Reset Setup
                </Button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-slate-200/60 p-2">
              <TabsList className="grid w-full grid-cols-7 bg-transparent gap-1">
                <TabsTrigger 
                  value="income-statement" 
                  className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200 rounded-lg px-3 py-2.5"
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Income Statement</span>
                  <span className="sm:hidden">Income</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="balance-sheet" 
                  className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200 rounded-lg px-3 py-2.5"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Balance Sheet</span>
                  <span className="sm:hidden">Balance</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="valuation" 
                  className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200 rounded-lg px-3 py-2.5"
                >
                  <Target className="w-4 h-4" />
                  <span className="hidden sm:inline">Valuation</span>
                  <span className="sm:hidden">Value</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="cap-table" 
                  className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200 rounded-lg px-3 py-2.5"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Cap Table</span>
                  <span className="sm:hidden">Cap</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="fund-utilization" 
                  className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200 rounded-lg px-3 py-2.5"
                >
                  <DollarSign className="w-4 h-4" />
                  <span className="hidden sm:inline">Fund Utilization</span>
                  <span className="sm:hidden">Funds</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="analysis" 
                  className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200 rounded-lg px-3 py-2.5"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Analysis</span>
                  <span className="sm:hidden">Stats</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="report" 
                  className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200 rounded-lg px-3 py-2.5"
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Report</span>
                  <span className="sm:hidden">Report</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="income-statement">
              <IncomeStatement 
                data={financialData}
                onUpdateData={updateFinancialData}
                financialModelId={currentModelId || ''}
                userId={user?.id || ''}
              />
            </TabsContent>

            <TabsContent value="balance-sheet">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-xl">
                  <CardTitle className="flex items-center gap-3 text-slate-800">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-primary" />
                    </div>
                    Balance Sheet
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Assets, liabilities, and equity projections
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <BalanceSheet 
                    data={financialData.costs.balanceSheet}
                    onChange={(data) => updateFinancialData('costs', {
                      ...financialData.costs,
                      balanceSheet: data
                    })}
                    revenueStreams={financialData.revenueStreams}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="valuation">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-xl">
                  <CardTitle className="flex items-center gap-3 text-slate-800">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Target className="w-4 h-4 text-emerald-600" />
                    </div>
                    Company Valuation
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Multiple valuation methods including revenue multiples, EBITDA multiples, DCF analysis, and football field comparison
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <Valuation financialData={financialData} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cap-table">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-xl">
                  <CardTitle className="flex items-center gap-3 text-slate-800">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-purple-600" />
                    </div>
                    Capitalization Table
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Share ownership, investments, and dilution analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ValuationModel />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fund-utilization">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-t-xl">
                  <CardTitle className="flex items-center gap-3 text-slate-800">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-orange-600" />
                    </div>
                    Fund Utilization & Runway Analysis
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Fund allocation planning, runway scenarios, and milestone tracking
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <FundUtilization />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
                  <CardTitle className="flex items-center gap-3 text-slate-800">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                    Financial Analysis & Performance Ratios
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Comprehensive business analysis with key financial ratios, performance metrics, and strategic insights
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <Analysis data={financialData} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="report">
              <Report data={financialData} companyData={companyData} />
            </TabsContent>
          </Tabs>
        )}

        <DebugPanel
          authDebug={authDebug}
          financialDebug={financialDebug}
          onRefresh={handleRefreshData}
          onReset={handleResetSetup}
        />
      </div>
    </div>
  );
};

export default Index;
