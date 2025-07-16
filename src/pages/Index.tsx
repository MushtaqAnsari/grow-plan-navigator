
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import RevenueStreams from "@/components/RevenueStreams";
import DirectCosts from "@/components/DirectCosts";
import GrossProfit from "@/components/GrossProfit";
import OperationalExpenses from "@/components/OperationalExpenses";
import EBITDA from "@/components/EBITDA";
import Summary from "@/components/Summary";
import IndustrySelector from "@/components/IndustrySelector";
import { BarChart3, TrendingUp, Users, DollarSign, FileText, Target } from "lucide-react";

export interface FinancialData {
  revenueStreams: {
    name: string;
    type: 'saas' | 'ecommerce' | 'advertising' | 'one-time' | 'consulting' | 'commission' | 'freemium';
    year1: number;
    year2: number;
    year3: number;
    growthRate: number;
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
      rent: { year1: number; year2: number; year3: number; };
      utilities: { year1: number; year2: number; year3: number; };
      domesticTravel: { year1: number; year2: number; year3: number; };
      internationalTravel: { year1: number; year2: number; year3: number; };
      insurance: { year1: number; year2: number; year3: number; };
      legal: { year1: number; year2: number; year3: number; };
      accounting: { year1: number; year2: number; year3: number; };
      software: { year1: number; year2: number; year3: number; };
      equipment: { year1: number; year2: number; year3: number; };
      other: { year1: number; year2: number; year3: number; };
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
  const [industry, setIndustry] = useState<string>("");
  const [financialData, setFinancialData] = useState<FinancialData>({
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
        rent: { year1: 0, year2: 0, year3: 0 },
        utilities: { year1: 0, year2: 0, year3: 0 },
        domesticTravel: { year1: 0, year2: 0, year3: 0 },
        internationalTravel: { year1: 0, year2: 0, year3: 0 },
        insurance: { year1: 0, year2: 0, year3: 0 },
        legal: { year1: 0, year2: 0, year3: 0 },
        accounting: { year1: 0, year2: 0, year3: 0 },
        software: { year1: 0, year2: 0, year3: 0 },
        equipment: { year1: 0, year2: 0, year3: 0 },
        other: { year1: 0, year2: 0, year3: 0 }
      },
      marketing: {
        isPercentageOfRevenue: true,
        percentageOfRevenue: 10,
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
    employees: [],
    funding: {
      totalFunding: 0,
      burnRate: 0,
      useOfFunds: []
    }
  });

  const [activeTab, setActiveTab] = useState("industry");

  const updateFinancialData = (section: keyof FinancialData, data: any) => {
    setFinancialData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Financial Modeling Platform
          </h1>
          <p className="text-lg text-slate-600">
            Build comprehensive financial models for your startup across any sector
          </p>
        </div>

        {/* Industry Selection or Main Content */}
        {!industry ? (
          <IndustrySelector onIndustrySelect={(selectedIndustry) => {
            setIndustry(selectedIndustry);
            setActiveTab("revenue");
          }} />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Industry:</span>
                <span className="font-medium text-slate-800 capitalize">{industry}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIndustry("")}
                >
                  Change Industry
                </Button>
              </div>
            </div>
            
            <TabsList className="grid w-full grid-cols-6 bg-white shadow-sm">
              <TabsTrigger value="revenue" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Revenue
              </TabsTrigger>
              <TabsTrigger value="direct-costs" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Direct Costs
              </TabsTrigger>
              <TabsTrigger value="gross-profit" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Gross Profit
              </TabsTrigger>
              <TabsTrigger value="operational" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Operational
              </TabsTrigger>
              <TabsTrigger value="ebitda" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                EBITDA
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Summary
              </TabsTrigger>
            </TabsList>

            <TabsContent value="revenue">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Streams</CardTitle>
                  <CardDescription>
                    Define your various revenue sources and growth projections for {industry}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RevenueStreams 
                    data={financialData.revenueStreams}
                    onChange={(data) => updateFinancialData('revenueStreams', data)}
                    industry={industry}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="direct-costs">
              <Card>
                <CardHeader>
                  <CardTitle>Direct Costs</CardTitle>
                  <CardDescription>
                    Define direct costs associated with each revenue stream
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DirectCosts 
                    data={financialData.costs.revenueStreamCosts}
                    onChange={(data) => updateFinancialData('costs', {
                      ...financialData.costs,
                      revenueStreamCosts: data
                    })}
                    revenueStreams={financialData.revenueStreams}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gross-profit">
              <Card>
                <CardHeader>
                  <CardTitle>Gross Profit Analysis</CardTitle>
                  <CardDescription>
                    Analyze gross profit margins and trends by revenue stream
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <GrossProfit data={financialData} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="operational">
              <Card>
                <CardHeader>
                  <CardTitle>Operational Expenses</CardTitle>
                  <CardDescription>
                    Plan team, administrative, and marketing expenses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <OperationalExpenses 
                    data={{
                      team: financialData.costs.team,
                      admin: financialData.costs.admin,
                      marketing: financialData.costs.marketing
                    }}
                    onChange={(data) => updateFinancialData('costs', {
                      ...financialData.costs,
                      ...data
                    })}
                    revenueStreams={financialData.revenueStreams}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ebitda">
              <Card>
                <CardHeader>
                  <CardTitle>EBITDA Analysis</CardTitle>
                  <CardDescription>
                    Monitor earnings before interest, taxes, depreciation, and amortization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EBITDA data={financialData} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="summary">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Summary</CardTitle>
                  <CardDescription>
                    Key metrics, ratios, and performance indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Summary data={financialData} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Index;
