import IncomeStatement from "@/components/IncomeStatement";
import Analysis from "@/components/Analysis";
import ValuationModel from "@/components/ValuationModel";
import FundUtilization from "@/components/FundUtilization";
import Valuation from "@/components/Valuation";
import Report from "@/components/Report";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import BalanceSheet from "@/components/BalanceSheet";
import ConversationalSetup from "@/components/ConversationalSetup";
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
      salaryIncreases?: { year1: number; year2: number; year3: number; year4: number; year5: number; };
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
  } = useFinancialData(null);
  
  const dataError = financialDebug?.error;
  const [activeTab, setActiveTab] = useState("income-statement");
  const [showSetup, setShowSetup] = useState(true);
  const [autoStartTimer, setAutoStartTimer] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!financialData) {
        setShowSetup(true);
      }
    }, 2000);
    
    setAutoStartTimer(timer);
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  console.log('🎯 Index: Render state', {
    loading,
    financialData: !!financialData,
    companyData: !!companyData,
    showSetup
  });

  const handleSetupComplete = async (generatedData: any) => {
    try {
      console.log('✅ Setup Complete:', generatedData);
      
      if (generatedData.companyData) {
        setCompanyData(generatedData.companyData);
        setIndustry(generatedData.companyData.industry);
      }

      if (generatedData.revenueStreams) {
        await updateFinancialData('revenueStreams', generatedData.revenueStreams);
      }

      if (generatedData.costs) {
        await updateFinancialData('costs', generatedData.costs);
      }

      if (generatedData.funding) {
        const fundingWithCalculatedAmounts = {
          ...generatedData.funding,
          useOfFunds: generatedData.funding.useOfFunds.map((item: any) => ({
            ...item,
            amount: (item.percentage / 100) * generatedData.funding.totalFunding
          }))
        };
        await updateFinancialData('funding', fundingWithCalculatedAmounts);
      }

      setShowSetup(false);
      setActiveTab("income-statement");
      
      toast({
        title: "Success! 🎉",
        description: "Your financial model is ready to explore!",
      });
      
    } catch (error) {
      console.error('Error saving setup data:', error);
      toast({
        title: "Error",
        description: "Failed to save your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResetSetup = () => {
    console.log('🔄 Resetting setup');
    resetSetup();
    setShowSetup(true);
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

        {showSetup || !financialData ? (
          <ConversationalSetup onComplete={handleSetupComplete} />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">{/* ... keep existing code */}
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
                  onClick={() => setShowSetup(true)}
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
