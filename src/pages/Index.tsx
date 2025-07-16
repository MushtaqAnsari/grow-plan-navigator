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
import { BarChart3, FileText, TrendingUp, Users, DollarSign, Target, Building2, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFinancialData } from "@/hooks/useFinancialData";

export interface FinancialData {
  revenueStreams: {
    name: string;
    type: 'saas' | 'ecommerce' | 'advertising' | 'one-time' | 'consulting' | 'commission' | 'freemium';
    year1: number;
    year2: number;
    year3: number;
    growthRate: number;
    arDays: number; // Individual AR days per revenue stream
  }[];
  costs: {
    revenueStreamCosts: {
      [key: string]: {
        directCosts: {
          cogs: { year1: number; year2: number; year3: number; };
          processing: { year1: number; year2: number; year3: number; };
          fulfillment: { year1: number; year2: number; year3: number; };
          support: { year1: number; year2: number; year3: number; };
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
        domesticTripsRatio: number; // percentage of domestic vs international
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
          usefulLife: number; // in years
          assetClass: 'tangible' | 'intangible';
          isFromCapitalizedPayroll?: boolean;
          linkedEmployeeId?: string;
        }[];
        year1: number; year2: number; year3: number;
      };
      accountsReceivable: {
        revenueStreamARs: {
          [key: string]: { // revenue stream name as key
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
    isCapitalized?: boolean; // For technology department
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
  const { user, signOut } = useAuth();
  const { financialData, loading, updateFinancialData } = useFinancialData(user?.id);
  const [industry, setIndustry] = useState<string>("");
  const [companyData, setCompanyData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("income-statement");

  // Show loading while data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  // Show message if no financial data yet
  if (!financialData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Unable to load financial data. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
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

        {/* Company Setup or Main Content */}
        {!companyData ? (
          <CompanySetup onSetupComplete={(data) => {
            setCompanyData(data);
            setIndustry(data.industry);
            setActiveTab("income-statement");
          }} />
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
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
                onClick={() => {
                  setCompanyData(null);
                  setIndustry("");
                }}
              >
                <Settings className="w-4 h-4" />
                Edit Setup
              </Button>
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
                onUpdateData={(newData) => {
                  // Update the entire financial data object
                  Object.keys(newData).forEach(key => {
                    updateFinancialData(key as keyof FinancialData, newData[key as keyof FinancialData]);
                  });
                }}
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
      </div>
    </div>
  );
};

export default Index;