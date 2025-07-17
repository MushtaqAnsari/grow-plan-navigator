import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Percent, BarChart3, FileText, Calculator } from 'lucide-react';
import { FinancialData } from "@/pages/Index";
import { formatCurrency, formatPercentage } from "@/lib/utils";

interface FinancialStatementsProps {
  data: FinancialData;
}

const FinancialStatements: React.FC<FinancialStatementsProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState("profit-loss");

  // Calculate totals for P&L
  const calculatePLData = () => {
    const years = ['year1', 'year2', 'year3'] as const;
    
    return years.map((year, index) => {
      // Revenue
      const totalRevenue = data.revenueStreams.reduce((sum, stream) => sum + stream[year], 0);
      
      // Direct Costs
      const totalDirectCosts = Object.values(data.costs.revenueStreamCosts).reduce((sum, streamCosts) => {
        return sum + Object.values(streamCosts.directCosts).reduce((subSum, cost) => subSum + cost[year], 0);
      }, 0);
      
      // Gross Profit
      const grossProfit = totalRevenue - totalDirectCosts;
      
      // Team Costs
      const teamSalaries = data.costs.team.employees.reduce((sum, emp) => sum + (emp.isCapitalized ? 0 : emp.salary), 0);
      const consultantCosts = data.costs.team.consultants.reduce((sum, consultant) => sum + (consultant.monthlyCost * 12), 0);
      const employeeCount = data.costs.team.employees.length;
      const healthCareCost = (data.costs.team.healthCare.amount + (teamSalaries * data.costs.team.healthCare.percentage / 100)) * employeeCount;
      const benefitsCost = (data.costs.team.benefits.amount + (teamSalaries * data.costs.team.benefits.percentage / 100)) * employeeCount;
      const iqamaCost = (data.costs.team.iqama.amount + (teamSalaries * data.costs.team.iqama.percentage / 100)) * employeeCount;
      const totalTeamCosts = teamSalaries + consultantCosts + healthCareCost + benefitsCost + iqamaCost + data.costs.team.recruitment[year];
      
      // Admin Costs
      const totalAdminCosts = Object.values(data.costs.admin).reduce((sum, item) => {
        if (typeof item === 'object' && year in item) {
          return sum + item[year];
        }
        return sum;
      }, 0);
      
      // Marketing Costs
      const marketingBudget = data.costs.marketing.isPercentageOfRevenue 
        ? (totalRevenue * data.costs.marketing.percentageOfRevenue / 100)
        : data.costs.marketing.manualBudget[year];
      const totalMarketingCosts = marketingBudget + Object.entries(data.costs.marketing)
        .filter(([key]) => key !== 'isPercentageOfRevenue' && key !== 'percentageOfRevenue' && key !== 'manualBudget')
        .reduce((sum, [, value]) => sum + (typeof value === 'object' ? value[year] : 0), 0);
      
      // EBITDA
      const ebitda = grossProfit - totalTeamCosts - totalAdminCosts - totalMarketingCosts;
      
      return {
        year: `Year ${index + 1}`,
        revenue: totalRevenue,
        directCosts: totalDirectCosts,
        grossProfit,
        teamCosts: totalTeamCosts,
        adminCosts: totalAdminCosts,
        marketingCosts: totalMarketingCosts,
        ebitda,
        grossMargin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
        ebitdaMargin: totalRevenue > 0 ? (ebitda / totalRevenue) * 100 : 0
      };
    });
  };

  // Calculate Balance Sheet data
  const calculateBalanceSheetData = () => {
    const years = ['year1', 'year2', 'year3'] as const;
    
    return years.map((year, index) => {
      // Assets
      const fixedAssets = data.costs.balanceSheet.fixedAssets[year];
      const accountsReceivable = data.costs.balanceSheet.accountsReceivable[`total${year.charAt(0).toUpperCase() + year.slice(1)}` as 'totalYear1' | 'totalYear2' | 'totalYear3'];
      const cashAndBank = data.costs.balanceSheet.cashAndBank[year];
      const inventory = data.costs.balanceSheet.inventory[year];
      const otherAssets = data.costs.balanceSheet.otherAssets[year];
      const totalAssets = fixedAssets + accountsReceivable + cashAndBank + inventory + otherAssets;
      
      // Liabilities
      const accountsPayable = data.costs.balanceSheet.accountsPayable[year];
      const otherLiabilities = data.costs.balanceSheet.otherLiabilities[year];
      const totalLiabilities = accountsPayable + otherLiabilities;
      
      // Equity
      const equity = totalAssets - totalLiabilities;
      
      return {
        year: `Year ${index + 1}`,
        fixedAssets,
        accountsReceivable,
        cashAndBank,
        inventory,
        otherAssets,
        totalAssets,
        accountsPayable,
        otherLiabilities,
        totalLiabilities,
        equity,
        debtToEquity: equity > 0 ? totalLiabilities / equity : 0,
        currentRatio: (accountsReceivable + cashAndBank + inventory) / (accountsPayable || 1)
      };
    });
  };

  // Calculate Cash Flow data
  const calculateCashFlowData = () => {
    const plData = calculatePLData();
    const bsData = calculateBalanceSheetData();
    
    return plData.map((pl, index) => {
      const bs = bsData[index];
      const prevBs = index > 0 ? bsData[index - 1] : null;
      
      // Operating Cash Flow (simplified)
      const operatingCashFlow = pl.ebitda + (prevBs ? (prevBs.accountsReceivable - bs.accountsReceivable) : 0);
      
      // Investing Cash Flow
      const investingCashFlow = prevBs ? (prevBs.fixedAssets - bs.fixedAssets) : -bs.fixedAssets;
      
      // Financing Cash Flow (simplified)
      const financingCashFlow = index === 0 ? data.funding.totalFunding : 0;
      
      // Net Cash Flow
      const netCashFlow = operatingCashFlow + investingCashFlow + financingCashFlow;
      
      return {
        year: pl.year,
        operatingCashFlow,
        investingCashFlow,
        financingCashFlow,
        netCashFlow,
        cashPosition: bs.cashAndBank
      };
    });
  };

  const plData = calculatePLData();
  const bsData = calculateBalanceSheetData();
  const cfData = calculateCashFlowData();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Financial Statements</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profit-loss" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Profit & Loss
          </TabsTrigger>
          <TabsTrigger value="balance-sheet" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Balance Sheet
          </TabsTrigger>
          <TabsTrigger value="cash-flow" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Cash Flow
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profit-loss">
          <div className="space-y-6">
            {/* P&L Statement */}
            <Card>
              <CardHeader>
                <CardTitle>Profit & Loss Statement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Item</th>
                        <th className="text-right py-2">Year 1</th>
                        <th className="text-right py-2">Year 2</th>
                        <th className="text-right py-2">Year 3</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 font-medium">Revenue</td>
                        <td className="text-right py-2">{formatCurrency(plData[0]?.revenue)}</td>
                        <td className="text-right py-2">{formatCurrency(plData[1]?.revenue)}</td>
                        <td className="text-right py-2">{formatCurrency(plData[2]?.revenue)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Direct Costs</td>
                        <td className="text-right py-2 text-red-600">-{formatCurrency(plData[0]?.directCosts)}</td>
                        <td className="text-right py-2 text-red-600">-{formatCurrency(plData[1]?.directCosts)}</td>
                        <td className="text-right py-2 text-red-600">-{formatCurrency(plData[2]?.directCosts)}</td>
                      </tr>
                      <tr className="border-b bg-gray-50">
                        <td className="py-2 font-medium">Gross Profit</td>
                        <td className="text-right py-2 font-medium">{formatCurrency(plData[0]?.grossProfit)}</td>
                        <td className="text-right py-2 font-medium">{formatCurrency(plData[1]?.grossProfit)}</td>
                        <td className="text-right py-2 font-medium">{formatCurrency(plData[2]?.grossProfit)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Team Costs</td>
                        <td className="text-right py-2 text-red-600">-{formatCurrency(plData[0]?.teamCosts)}</td>
                        <td className="text-right py-2 text-red-600">-{formatCurrency(plData[1]?.teamCosts)}</td>
                        <td className="text-right py-2 text-red-600">-{formatCurrency(plData[2]?.teamCosts)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Admin Costs</td>
                        <td className="text-right py-2 text-red-600">-{formatCurrency(plData[0]?.adminCosts)}</td>
                        <td className="text-right py-2 text-red-600">-{formatCurrency(plData[1]?.adminCosts)}</td>
                        <td className="text-right py-2 text-red-600">-{formatCurrency(plData[2]?.adminCosts)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Marketing Costs</td>
                        <td className="text-right py-2 text-red-600">-{formatCurrency(plData[0]?.marketingCosts)}</td>
                        <td className="text-right py-2 text-red-600">-{formatCurrency(plData[1]?.marketingCosts)}</td>
                        <td className="text-right py-2 text-red-600">-{formatCurrency(plData[2]?.marketingCosts)}</td>
                      </tr>
                      <tr className="border-b bg-blue-50">
                        <td className="py-2 font-bold">EBITDA</td>
                        <td className={`text-right py-2 font-bold ${plData[0]?.ebitda >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(plData[0]?.ebitda)}
                        </td>
                        <td className={`text-right py-2 font-bold ${plData[1]?.ebitda >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(plData[1]?.ebitda)}
                        </td>
                        <td className={`text-right py-2 font-bold ${plData[2]?.ebitda >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(plData[2]?.ebitda)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* P&L Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue & EBITDA Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={plData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => [formatCurrency(value)]} />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} name="Revenue" />
                      <Line type="monotone" dataKey="ebitda" stroke="#82ca9d" strokeWidth={2} name="EBITDA" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cost Breakdown (Year 3)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Direct Costs', value: plData[2]?.directCosts },
                          { name: 'Team Costs', value: plData[2]?.teamCosts },
                          { name: 'Admin Costs', value: plData[2]?.adminCosts },
                          { name: 'Marketing Costs', value: plData[2]?.marketingCosts }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {plData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [formatCurrency(value)]} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* P&L Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    <div className="ml-2">
                      <p className="text-xs font-medium text-muted-foreground">Avg Gross Margin</p>
                       <p className="text-2xl font-bold">
                        {formatPercentage((plData[0]?.grossMargin + plData[1]?.grossMargin + plData[2]?.grossMargin) / 3)}
                       </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <div className="ml-2">
                      <p className="text-xs font-medium text-muted-foreground">Revenue Growth</p>
                       <p className="text-2xl font-bold">
                        {plData[1]?.revenue > 0 ? formatPercentage(((plData[2]?.revenue - plData[0]?.revenue) / plData[0]?.revenue) * 100) : "0%"}
                       </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div className="ml-2">
                      <p className="text-xs font-medium text-muted-foreground">Year 3 EBITDA</p>
                       <p className={`text-2xl font-bold ${plData[2]?.ebitda >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(plData[2]?.ebitda)}
                       </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <div className="ml-2">
                      <p className="text-xs font-medium text-muted-foreground">EBITDA Margin Y3</p>
                       <p className="text-2xl font-bold">
                        {formatPercentage(plData[2]?.ebitdaMargin)}
                       </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* P&L Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Profit & Loss Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-2">
                    <Badge variant={plData[2]?.grossMargin > 70 ? "default" : plData[2]?.grossMargin > 50 ? "secondary" : "destructive"}>
                      Gross Margin
                    </Badge>
                    <p>
                      Your gross margin of {formatPercentage(plData[2]?.grossMargin)} in Year 3 is{" "}
                      {plData[2]?.grossMargin > 70 ? "excellent" : plData[2]?.grossMargin > 50 ? "healthy" : "concerning"}.
                      {plData[2]?.grossMargin > 70 && " This indicates strong pricing power and efficient cost management."}
                      {plData[2]?.grossMargin > 50 && plData[2]?.grossMargin <= 70 && " Focus on optimizing direct costs for improvement."}
                      {plData[2]?.grossMargin <= 50 && " Consider reviewing pricing strategy and cost structure."}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant={plData[2]?.ebitda > 0 ? "default" : "destructive"}>
                      Profitability
                    </Badge>
                    <p>
                      {plData[2]?.ebitda > 0 
                        ? `Achieving positive EBITDA of ${formatCurrency(plData[2]?.ebitda)} demonstrates operational efficiency and path to profitability.`
                        : `Current EBITDA of ${formatCurrency(plData[2]?.ebitda)} indicates need for revenue growth or cost optimization.`
                      }
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline">Growth</Badge>
                    <p>
                      Revenue growth trajectory shows{" "}
                      {formatPercentage((plData[2]?.revenue - plData[0]?.revenue) / plData[0]?.revenue * 100)} total growth over 3 years.
                      {((plData[2]?.revenue - plData[0]?.revenue) / plData[0]?.revenue * 100) > 100 
                        ? " This strong growth rate positions the company well for scaling."
                        : " Consider strategies to accelerate revenue growth."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="balance-sheet">
          <div className="space-y-6">
            {/* Balance Sheet Statement */}
            <Card>
              <CardHeader>
                <CardTitle>Balance Sheet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Assets */}
                  <div>
                    <h4 className="font-semibold mb-3 text-blue-600">ASSETS</h4>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Asset</th>
                          <th className="text-right py-2">Year 1</th>
                          <th className="text-right py-2">Year 2</th>
                          <th className="text-right py-2">Year 3</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2">Fixed Assets</td>
                          <td className="text-right py-2">{formatCurrency(bsData[0]?.fixedAssets)}</td>
                          <td className="text-right py-2">{formatCurrency(bsData[1]?.fixedAssets)}</td>
                          <td className="text-right py-2">{formatCurrency(bsData[2]?.fixedAssets)}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Accounts Receivable</td>
                          <td className="text-right py-2">{formatCurrency(bsData[0]?.accountsReceivable)}</td>
                          <td className="text-right py-2">{formatCurrency(bsData[1]?.accountsReceivable)}</td>
                          <td className="text-right py-2">{formatCurrency(bsData[2]?.accountsReceivable)}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Cash & Bank</td>
                          <td className="text-right py-2">${bsData[0]?.cashAndBank.toLocaleString()}</td>
                          <td className="text-right py-2">${bsData[1]?.cashAndBank.toLocaleString()}</td>
                          <td className="text-right py-2">${bsData[2]?.cashAndBank.toLocaleString()}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Inventory</td>
                          <td className="text-right py-2">${bsData[0]?.inventory.toLocaleString()}</td>
                          <td className="text-right py-2">${bsData[1]?.inventory.toLocaleString()}</td>
                          <td className="text-right py-2">${bsData[2]?.inventory.toLocaleString()}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Other Assets</td>
                          <td className="text-right py-2">${bsData[0]?.otherAssets.toLocaleString()}</td>
                          <td className="text-right py-2">${bsData[1]?.otherAssets.toLocaleString()}</td>
                          <td className="text-right py-2">${bsData[2]?.otherAssets.toLocaleString()}</td>
                        </tr>
                        <tr className="border-b bg-blue-50">
                          <td className="py-2 font-bold">TOTAL ASSETS</td>
                          <td className="text-right py-2 font-bold">{formatCurrency(bsData[0]?.totalAssets)}</td>
                          <td className="text-right py-2 font-bold">{formatCurrency(bsData[1]?.totalAssets)}</td>
                          <td className="text-right py-2 font-bold">{formatCurrency(bsData[2]?.totalAssets)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Liabilities & Equity */}
                  <div>
                    <h4 className="font-semibold mb-3 text-red-600">LIABILITIES & EQUITY</h4>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Item</th>
                          <th className="text-right py-2">Year 1</th>
                          <th className="text-right py-2">Year 2</th>
                          <th className="text-right py-2">Year 3</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2">Accounts Payable</td>
                          <td className="text-right py-2">${bsData[0]?.accountsPayable.toLocaleString()}</td>
                          <td className="text-right py-2">${bsData[1]?.accountsPayable.toLocaleString()}</td>
                          <td className="text-right py-2">${bsData[2]?.accountsPayable.toLocaleString()}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Other Liabilities</td>
                          <td className="text-right py-2">${bsData[0]?.otherLiabilities.toLocaleString()}</td>
                          <td className="text-right py-2">${bsData[1]?.otherLiabilities.toLocaleString()}</td>
                          <td className="text-right py-2">${bsData[2]?.otherLiabilities.toLocaleString()}</td>
                        </tr>
                        <tr className="border-b bg-red-50">
                          <td className="py-2 font-medium">Total Liabilities</td>
                          <td className="text-right py-2 font-medium">${bsData[0]?.totalLiabilities.toLocaleString()}</td>
                          <td className="text-right py-2 font-medium">${bsData[1]?.totalLiabilities.toLocaleString()}</td>
                          <td className="text-right py-2 font-medium">${bsData[2]?.totalLiabilities.toLocaleString()}</td>
                        </tr>
                        <tr className="border-b bg-green-50">
                          <td className="py-2 font-bold">Equity</td>
                          <td className="text-right py-2 font-bold">${bsData[0]?.equity.toLocaleString()}</td>
                          <td className="text-right py-2 font-bold">${bsData[1]?.equity.toLocaleString()}</td>
                          <td className="text-right py-2 font-bold">${bsData[2]?.equity.toLocaleString()}</td>
                        </tr>
                        <tr className="border-b bg-gray-50">
                          <td className="py-2 font-bold">TOTAL LIAB. & EQUITY</td>
                          <td className="text-right py-2 font-bold">${(bsData[0]?.totalLiabilities + bsData[0]?.equity).toLocaleString()}</td>
                          <td className="text-right py-2 font-bold">${(bsData[1]?.totalLiabilities + bsData[1]?.equity).toLocaleString()}</td>
                          <td className="text-right py-2 font-bold">${(bsData[2]?.totalLiabilities + bsData[2]?.equity).toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Balance Sheet Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Asset Composition (Year 3)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Fixed Assets', value: bsData[2]?.fixedAssets },
                          { name: 'A/R', value: bsData[2]?.accountsReceivable },
                          { name: 'Cash', value: bsData[2]?.cashAndBank },
                          { name: 'Inventory', value: bsData[2]?.inventory },
                          { name: 'Other', value: bsData[2]?.otherAssets }
                        ].filter(item => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {bsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [formatCurrency(value)]} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Assets vs Liabilities Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={bsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => [formatCurrency(value)]} />
                      <Legend />
                      <Bar dataKey="totalAssets" fill="#8884d8" name="Total Assets" />
                      <Bar dataKey="totalLiabilities" fill="#ff7300" name="Total Liabilities" />
                      <Bar dataKey="equity" fill="#00C49F" name="Equity" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Balance Sheet Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    <div className="ml-2">
                      <p className="text-xs font-medium text-muted-foreground">Debt to Equity</p>
                      <p className="text-2xl font-bold">
                        {bsData[2]?.debtToEquity.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <div className="ml-2">
                      <p className="text-xs font-medium text-muted-foreground">Current Ratio</p>
                      <p className="text-2xl font-bold">
                        {bsData[2]?.currentRatio.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div className="ml-2">
                      <p className="text-xs font-medium text-muted-foreground">Total Assets Y3</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(bsData[2]?.totalAssets)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <div className="ml-2">
                      <p className="text-xs font-medium text-muted-foreground">Equity %</p>
                      <p className="text-2xl font-bold">
                        {bsData[2]?.totalAssets > 0 ? ((bsData[2]?.equity / bsData[2]?.totalAssets) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Balance Sheet Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Balance Sheet Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-2">
                    <Badge variant={bsData[2]?.currentRatio > 2 ? "default" : bsData[2]?.currentRatio > 1 ? "secondary" : "destructive"}>
                      Liquidity
                    </Badge>
                    <p>
                      Current ratio of {bsData[2]?.currentRatio.toFixed(2)} indicates{" "}
                      {bsData[2]?.currentRatio > 2 ? "strong liquidity position" : bsData[2]?.currentRatio > 1 ? "adequate liquidity" : "potential liquidity concerns"}.
                      {bsData[2]?.currentRatio > 2 && " The company can easily meet short-term obligations."}
                      {bsData[2]?.currentRatio > 1 && bsData[2]?.currentRatio <= 2 && " Monitor cash flow and receivables collection."}
                      {bsData[2]?.currentRatio <= 1 && " Consider improving cash position or extending payment terms."}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant={bsData[2]?.debtToEquity < 0.5 ? "default" : bsData[2]?.debtToEquity < 1 ? "secondary" : "destructive"}>
                      Leverage
                    </Badge>
                    <p>
                      Debt-to-equity ratio of {bsData[2]?.debtToEquity.toFixed(2)} shows{" "}
                      {bsData[2]?.debtToEquity < 0.5 ? "conservative financial structure" : bsData[2]?.debtToEquity < 1 ? "moderate leverage" : "high leverage"}.
                      {bsData[2]?.debtToEquity < 0.5 && " Low debt levels provide financial flexibility."}
                      {bsData[2]?.debtToEquity >= 0.5 && bsData[2]?.debtToEquity < 1 && " Balanced approach to debt financing."}
                      {bsData[2]?.debtToEquity >= 1 && " High debt levels may limit future borrowing capacity."}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline">Asset Quality</Badge>
                    <p>
                      Asset composition shows{" "}
                      {((bsData[2]?.cashAndBank / bsData[2]?.totalAssets) * 100).toFixed(1)}% in cash,{" "}
                      {((bsData[2]?.fixedAssets / bsData[2]?.totalAssets) * 100).toFixed(1)}% in fixed assets.
                      {(bsData[2]?.cashAndBank / bsData[2]?.totalAssets) > 0.3 
                        ? " Strong cash position provides operational flexibility."
                        : " Consider optimizing cash management for better returns."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cash-flow">
          <div className="space-y-6">
            {/* Cash Flow Statement */}
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Statement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Cash Flow Item</th>
                        <th className="text-right py-2">Year 1</th>
                        <th className="text-right py-2">Year 2</th>
                        <th className="text-right py-2">Year 3</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b bg-blue-50">
                        <td className="py-2 font-medium text-blue-700">Operating Activities</td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 pl-4">Operating Cash Flow</td>
                        <td className={`text-right py-2 ${cfData[0]?.operatingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${cfData[0]?.operatingCashFlow.toLocaleString()}
                        </td>
                        <td className={`text-right py-2 ${cfData[1]?.operatingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${cfData[1]?.operatingCashFlow.toLocaleString()}
                        </td>
                        <td className={`text-right py-2 ${cfData[2]?.operatingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${cfData[2]?.operatingCashFlow.toLocaleString()}
                        </td>
                      </tr>
                      <tr className="border-b bg-orange-50">
                        <td className="py-2 font-medium text-orange-700">Investing Activities</td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 pl-4">Investing Cash Flow</td>
                        <td className="text-right py-2 text-red-600">${cfData[0]?.investingCashFlow.toLocaleString()}</td>
                        <td className="text-right py-2 text-red-600">${cfData[1]?.investingCashFlow.toLocaleString()}</td>
                        <td className="text-right py-2 text-red-600">${cfData[2]?.investingCashFlow.toLocaleString()}</td>
                      </tr>
                      <tr className="border-b bg-green-50">
                        <td className="py-2 font-medium text-green-700">Financing Activities</td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 pl-4">Financing Cash Flow</td>
                        <td className="text-right py-2 text-green-600">${cfData[0]?.financingCashFlow.toLocaleString()}</td>
                        <td className="text-right py-2">${cfData[1]?.financingCashFlow.toLocaleString()}</td>
                        <td className="text-right py-2">${cfData[2]?.financingCashFlow.toLocaleString()}</td>
                      </tr>
                      <tr className="border-b bg-gray-100">
                        <td className="py-2 font-bold">Net Cash Flow</td>
                        <td className={`text-right py-2 font-bold ${cfData[0]?.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${cfData[0]?.netCashFlow.toLocaleString()}
                        </td>
                        <td className={`text-right py-2 font-bold ${cfData[1]?.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${cfData[1]?.netCashFlow.toLocaleString()}
                        </td>
                        <td className={`text-right py-2 font-bold ${cfData[2]?.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${cfData[2]?.netCashFlow.toLocaleString()}
                        </td>
                      </tr>
                      <tr className="border-b bg-blue-100">
                        <td className="py-2 font-bold">Cash Position</td>
                        <td className="text-right py-2 font-bold">${cfData[0]?.cashPosition.toLocaleString()}</td>
                        <td className="text-right py-2 font-bold">${cfData[1]?.cashPosition.toLocaleString()}</td>
                        <td className="text-right py-2 font-bold">${cfData[2]?.cashPosition.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Cash Flow Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cash Flow Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={cfData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                      <Legend />
                      <Line type="monotone" dataKey="operatingCashFlow" stroke="#8884d8" strokeWidth={2} name="Operating CF" />
                      <Line type="monotone" dataKey="netCashFlow" stroke="#82ca9d" strokeWidth={2} name="Net CF" />
                      <Line type="monotone" dataKey="cashPosition" stroke="#ffc658" strokeWidth={2} name="Cash Position" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cash Flow Breakdown (Year 3)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[cfData[2]]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="operatingCashFlow" fill="#8884d8" name="Operating" />
                      <Bar dataKey="investingCashFlow" fill="#ff7300" name="Investing" />
                      <Bar dataKey="financingCashFlow" fill="#00C49F" name="Financing" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Cash Flow Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div className="ml-2">
                      <p className="text-xs font-medium text-muted-foreground">Operating CF Y3</p>
                      <p className={`text-2xl font-bold ${cfData[2]?.operatingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${cfData[2]?.operatingCashFlow.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <div className="ml-2">
                      <p className="text-xs font-medium text-muted-foreground">Net CF Y3</p>
                      <p className={`text-2xl font-bold ${cfData[2]?.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${cfData[2]?.netCashFlow.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <div className="ml-2">
                      <p className="text-xs font-medium text-muted-foreground">Cash Position</p>
                      <p className="text-2xl font-bold">
                        ${cfData[2]?.cashPosition.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    <div className="ml-2">
                      <p className="text-xs font-medium text-muted-foreground">Burn Rate</p>
                      <p className="text-2xl font-bold">
                        ${data.funding.burnRate.toLocaleString()}/mo
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cash Flow Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-2">
                    <Badge variant={cfData[2]?.operatingCashFlow > 0 ? "default" : "destructive"}>
                      Operating CF
                    </Badge>
                    <p>
                      {cfData[2]?.operatingCashFlow > 0 
                        ? `Positive operating cash flow of $${cfData[2]?.operatingCashFlow.toLocaleString()} demonstrates the business generates cash from operations.`
                        : `Negative operating cash flow indicates the business requires funding to maintain operations.`
                      }
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant={cfData[2]?.cashPosition > data.funding.burnRate * 12 ? "default" : cfData[2]?.cashPosition > data.funding.burnRate * 6 ? "secondary" : "destructive"}>
                      Runway
                    </Badge>
                    <p>
                      Current cash position of ${cfData[2]?.cashPosition.toLocaleString()} provides approximately{" "}
                      {data.funding.burnRate > 0 ? Math.round(cfData[2]?.cashPosition / data.funding.burnRate) : "∞"} months of runway
                      at current burn rate.
                      {cfData[2]?.cashPosition > data.funding.burnRate * 12 && " Strong runway provides growth opportunities."}
                      {cfData[2]?.cashPosition <= data.funding.burnRate * 6 && " Consider fundraising or cost optimization."}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline">Cash Management</Badge>
                    <p>
                      {cfData.filter(cf => cf.operatingCashFlow > 0).length >= 2 
                        ? "Consistent positive operating cash flow trend indicates strong cash generation capability."
                        : "Focus on achieving positive operating cash flow through revenue growth and cost management."
                      }
                      {cfData[2]?.netCashFlow > 0 && " Net positive cash flow strengthens financial position."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialStatements;