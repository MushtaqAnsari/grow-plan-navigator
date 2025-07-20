import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialData } from "@/pages/Index";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RevenueStreams from "./RevenueStreams";
import DirectCosts from "./DirectCosts";
import GrossProfit from "./GrossProfit";
import OperationalExpenses from "./OperationalExpenses";
import EBITDA from "./EBITDA";
import LoansAndFinancing from "./LoansAndFinancing";
import Taxation from "./Taxation";
import NetProfit from "./NetProfit";
import { TrendingUp, DollarSign, BarChart3, Users, FileText, Calculator, Receipt, Award } from "lucide-react";

interface IncomeStatementProps {
  data: FinancialData;
  onUpdateData: (section: keyof FinancialData, data: any) => void;
  financialModelId: string;
  userId: string;
}

const IncomeStatement: React.FC<IncomeStatementProps> = ({ data, onUpdateData, financialModelId, userId }) => {
  const updateFinancialData = (field: string, value: any) => {
    onUpdateData(field as keyof FinancialData, value);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid w-full grid-cols-8 bg-white shadow-sm">
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
          <TabsTrigger value="loans" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Loans
          </TabsTrigger>
          <TabsTrigger value="taxation" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Taxation
          </TabsTrigger>
          <TabsTrigger value="net-profit" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Net Profit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Revenue Streams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueStreams 
                data={data.revenueStreams}
                industry="edtech"
                onChange={(streams) => updateFinancialData('revenueStreams', streams)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="direct-costs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Direct Costs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DirectCosts 
                data={data.costs.revenueStreamCosts}
                revenueStreams={data.revenueStreams}
                financialModelId={financialModelId}
                userId={userId}
                onChange={(costs) => updateFinancialData('costs', {
                  ...data.costs,
                  revenueStreamCosts: costs
                })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gross-profit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Gross Profit Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GrossProfit data={data} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operational">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Operational Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OperationalExpenses 
                data={data.costs}
                revenueStreams={data.revenueStreams}
                balanceSheetData={data.costs.balanceSheet}
                planningPeriod={data.companyData?.planningPeriod || 3}
                onChange={(costsData) => updateFinancialData('costs', {
                  ...data.costs,
                  team: costsData.team,
                  admin: costsData.admin,
                  marketing: costsData.marketing
                })}
                onAddIntangibleAsset={(assetName, cost) => {
                  const newAsset = {
                    id: `asset-${Date.now()}`,
                    name: assetName,
                    cost: cost,
                    usefulLife: 5,
                    assetClass: 'intangible' as const,
                    isFromCapitalizedPayroll: true
                  };
                  updateFinancialData('costs', {
                    ...data.costs,
                    balanceSheet: {
                      ...data.costs.balanceSheet,
                      fixedAssets: {
                        ...data.costs.balanceSheet.fixedAssets,
                        assets: [...data.costs.balanceSheet.fixedAssets.assets, newAsset]
                      }
                    }
                  });
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ebitda">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                EBITDA Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EBITDA data={data} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loans">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Loans & Financing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LoansAndFinancing 
                data={data.loansAndFinancing}
                onChange={(loansData) => updateFinancialData('loansAndFinancing', loansData)}
                financialData={data}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taxation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Taxation & Zakat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Taxation 
                data={data}
                onUpdateData={(newData) => {
                  // Only update taxation section to prevent cascading updates
                  if (newData.taxation && JSON.stringify(newData.taxation) !== JSON.stringify(data.taxation)) {
                    updateFinancialData('taxation', newData.taxation);
                  }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="net-profit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Net Profit Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NetProfit data={data} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IncomeStatement;