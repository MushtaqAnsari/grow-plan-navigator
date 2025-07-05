
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import RevenueStreams from "@/components/RevenueStreams";
import CostStructure from "@/components/CostStructure";
import EmployeePlanning from "@/components/EmployeePlanning";
import FinancialStatements from "@/components/FinancialStatements";
import ValuationModel from "@/components/ValuationModel";
import FundUtilization from "@/components/FundUtilization";
import { BarChart3, TrendingUp, Users, DollarSign, FileText, Target } from "lucide-react";

export interface FinancialData {
  revenueStreams: {
    name: string;
    year1: number;
    year2: number;
    year3: number;
    growthRate: number;
  }[];
  costs: {
    cogs: { year1: number; year2: number; year3: number; };
    payroll: { year1: number; year2: number; year3: number; };
    admin: { year1: number; year2: number; year3: number; };
    marketing: { year1: number; year2: number; year3: number; };
    other: { year1: number; year2: number; year3: number; };
  };
  employees: {
    role: string;
    count: number;
    salary: number;
    year: number;
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
  const [financialData, setFinancialData] = useState<FinancialData>({
    revenueStreams: [],
    costs: {
      cogs: { year1: 0, year2: 0, year3: 0 },
      payroll: { year1: 0, year2: 0, year3: 0 },
      admin: { year1: 0, year2: 0, year3: 0 },
      marketing: { year1: 0, year2: 0, year3: 0 },
      other: { year1: 0, year2: 0, year3: 0 }
    },
    employees: [],
    funding: {
      totalFunding: 0,
      burnRate: 0,
      useOfFunds: []
    }
  });

  const [activeTab, setActiveTab] = useState("revenue");

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

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white shadow-sm">
            <TabsTrigger value="revenue" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Revenue
            </TabsTrigger>
            <TabsTrigger value="costs" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Costs
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team
            </TabsTrigger>
            <TabsTrigger value="statements" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Statements
            </TabsTrigger>
            <TabsTrigger value="valuation" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Valuation
            </TabsTrigger>
            <TabsTrigger value="funding" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Funding
            </TabsTrigger>
          </TabsList>

          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Streams</CardTitle>
                <CardDescription>
                  Define your various revenue sources and growth projections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueStreams 
                  data={financialData.revenueStreams}
                  onChange={(data) => updateFinancialData('revenueStreams', data)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="costs">
            <Card>
              <CardHeader>
                <CardTitle>Cost Structure</CardTitle>
                <CardDescription>
                  Break down your cost structure across different categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CostStructure 
                  data={financialData.costs}
                  onChange={(data) => updateFinancialData('costs', data)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees">
            <Card>
              <CardHeader>
                <CardTitle>Employee Planning</CardTitle>
                <CardDescription>
                  Plan your team growth and compensation structure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmployeePlanning 
                  data={financialData.employees}
                  onChange={(data) => updateFinancialData('employees', data)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statements">
            <FinancialStatements data={financialData} />
          </TabsContent>

          <TabsContent value="valuation">
            <ValuationModel data={financialData} />
          </TabsContent>

          <TabsContent value="funding">
            <Card>
              <CardHeader>
                <CardTitle>Fund Utilization</CardTitle>
                <CardDescription>
                  Plan how you'll use your funding and track burn rate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FundUtilization 
                  data={financialData.funding}
                  onChange={(data) => updateFinancialData('funding', data)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
