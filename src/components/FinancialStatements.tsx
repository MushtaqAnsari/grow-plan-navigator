
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialData } from "@/pages/Index";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface FinancialStatementsProps {
  data: FinancialData;
}

const FinancialStatements: React.FC<FinancialStatementsProps> = ({ data }) => {
  // Calculate financial metrics
  const calculateTotalRevenue = (year: number) => {
    const yearKey = `year${year}` as 'year1' | 'year2' | 'year3';
    return data.revenueStreams.reduce((sum, stream) => sum + stream[yearKey], 0);
  };

  const calculateTotalCosts = (year: number) => {
    const yearKey = `year${year}` as 'year1' | 'year2' | 'year3';
    
    // Sum all direct costs from revenue streams
    const directCosts = Object.values(data.costs.revenueStreamCosts).reduce((sum, stream) => {
      return sum + Object.values(stream.directCosts).reduce((streamSum, cost) => streamSum + cost[yearKey], 0);
    }, 0);
    
    // Sum team costs
    const teamCosts = Object.values(data.costs.team).reduce((sum, cost) => sum + cost[yearKey], 0);
    
    // Sum admin costs
    const adminCosts = Object.values(data.costs.admin).reduce((sum, cost) => sum + cost[yearKey], 0);
    
    // Calculate marketing costs
    const getTotalRevenue = () => data.revenueStreams.reduce((sum, stream) => sum + stream[yearKey], 0);
    const marketingCosts = data.costs.marketing.isPercentageOfRevenue 
      ? getTotalRevenue() * (data.costs.marketing.percentageOfRevenue / 100)
      : data.costs.marketing.manualBudget[yearKey];
    
    return directCosts + teamCosts + adminCosts + marketingCosts;
  };

  const calculatePayroll = (year: number) => {
    return data.employees
      .filter(emp => emp.year <= year)
      .reduce((sum, emp) => sum + (emp.count * emp.salary), 0);
  };

  const calculateDirectCosts = (year: number) => {
    const yearKey = `year${year}` as 'year1' | 'year2' | 'year3';
    return Object.values(data.costs.revenueStreamCosts).reduce((sum, stream) => {
      return sum + Object.values(stream.directCosts).reduce((streamSum, cost) => streamSum + cost[yearKey], 0);
    }, 0);
  };

  // Prepare data for charts
  const chartData = [1, 2, 3].map(year => ({
    year: `Year ${year}`,
    revenue: calculateTotalRevenue(year),
    costs: calculateTotalCosts(year),
    payroll: calculatePayroll(year),
    netIncome: calculateTotalRevenue(year) - calculateTotalCosts(year) - calculatePayroll(year)
  }));

  const profitLossData = [1, 2, 3].map(year => {
    const revenue = calculateTotalRevenue(year);
    const directCosts = calculateDirectCosts(year);
    const costs = calculateTotalCosts(year);
    const payroll = calculatePayroll(year);
    const grossProfit = revenue - directCosts;
    const operatingExpenses = costs - directCosts + payroll;
    const netIncome = grossProfit - operatingExpenses;

    return {
      year,
      revenue,
      cogs: directCosts,
      grossProfit,
      operatingExpenses,
      netIncome,
      grossMargin: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
      netMargin: revenue > 0 ? (netIncome / revenue) * 100 : 0
    };
  });

  const cashFlowData = [1, 2, 3].map((year, index) => {
    const netIncome = profitLossData[index].netIncome;
    const operatingCashFlow = netIncome; // Simplified
    const investingCashFlow = 0; // Placeholder
    const financingCashFlow = index === 0 ? data.funding.totalFunding : 0;
    const netCashFlow = operatingCashFlow + investingCashFlow + financingCashFlow;
    
    return {
      year,
      operatingCashFlow,
      investingCashFlow,
      financingCashFlow,
      netCashFlow
    };
  });

  return (
    <div className="space-y-6">
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="pnl">P&L Statement</TabsTrigger>
          <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue vs Costs Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Costs</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                    <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                    <Bar dataKey="costs" fill="#ef4444" name="Total Costs" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Net Income Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Net Income Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                    <Line 
                      type="monotone" 
                      dataKey="netIncome" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      name="Net Income"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Key Financial Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {profitLossData.map((yearData) => (
                    <div key={yearData.year} className="text-center p-4 bg-slate-50 rounded-lg">
                      <h3 className="font-semibold text-lg mb-3">Year {yearData.year}</h3>
                      <div className="space-y-2">
                        <div>
                          <p className="text-2xl font-bold text-green-600">
                            ${yearData.revenue.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">Revenue</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-blue-600">
                            {yearData.grossMargin.toFixed(1)}%
                          </p>
                          <p className="text-xs text-gray-600">Gross Margin</p>
                        </div>
                        <div>
                          <p className={`text-lg font-semibold ${yearData.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${yearData.netIncome.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-600">Net Income</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pnl">
          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss Statement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-2 px-4 font-semibold">Item</th>
                      <th className="text-right py-2 px-4 font-semibold">Year 1</th>
                      <th className="text-right py-2 px-4 font-semibold">Year 2</th>
                      <th className="text-right py-2 px-4 font-semibold">Year 3</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-1">
                    <tr className="border-b">
                      <td className="py-2 px-4 font-semibold text-green-700">Total Revenue</td>
                      {profitLossData.map(year => (
                        <td key={year.year} className="text-right py-2 px-4 font-semibold text-green-700">
                          ${year.revenue.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-4">Cost of Goods Sold</td>
                      {profitLossData.map(year => (
                        <td key={year.year} className="text-right py-2 px-4">
                          ${year.cogs.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b bg-gray-50">
                      <td className="py-2 px-4 font-semibold">Gross Profit</td>
                      {profitLossData.map(year => (
                        <td key={year.year} className="text-right py-2 px-4 font-semibold">
                          ${year.grossProfit.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-4">Operating Expenses</td>
                      {profitLossData.map(year => (
                        <td key={year.year} className="text-right py-2 px-4">
                          ${year.operatingExpenses.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b-2 border-gray-300 bg-blue-50">
                      <td className="py-2 px-4 font-bold">Net Income</td>
                      {profitLossData.map(year => (
                        <td key={year.year} className={`text-right py-2 px-4 font-bold ${year.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${year.netIncome.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance">
          <Card>
            <CardHeader>
              <CardTitle>Balance Sheet (Simplified)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>Balance Sheet will be calculated based on:</p>
                <ul className="list-disc list-inside mt-4 space-y-2">
                  <li>Cash and cash equivalents from funding and operations</li>
                  <li>Accounts receivable from revenue projections</li>
                  <li>Property, plant & equipment assumptions</li>
                  <li>Accounts payable and accrued expenses</li>
                  <li>Equity from funding and retained earnings</li>
                </ul>
                <p className="mt-4 text-sm">
                  This will be enhanced with additional asset and liability inputs in future versions.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Statement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-2 px-4 font-semibold">Cash Flow Item</th>
                      <th className="text-right py-2 px-4 font-semibold">Year 1</th>
                      <th className="text-right py-2 px-4 font-semibold">Year 2</th>
                      <th className="text-right py-2 px-4 font-semibold">Year 3</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b bg-blue-50">
                      <td className="py-2 px-4 font-semibold">Operating Cash Flow</td>
                      {cashFlowData.map(year => (
                        <td key={year.year} className="text-right py-2 px-4 font-semibold">
                          ${year.operatingCashFlow.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-4">Investing Cash Flow</td>
                      {cashFlowData.map(year => (
                        <td key={year.year} className="text-right py-2 px-4">
                          ${year.investingCashFlow.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b bg-green-50">
                      <td className="py-2 px-4 font-semibold">Financing Cash Flow</td>
                      {cashFlowData.map(year => (
                        <td key={year.year} className="text-right py-2 px-4 font-semibold text-green-600">
                          ${year.financingCashFlow.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b-2 border-gray-300 bg-gray-100">
                      <td className="py-2 px-4 font-bold">Net Cash Flow</td>
                      {cashFlowData.map(year => (
                        <td key={year.year} className={`text-right py-2 px-4 font-bold ${year.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${year.netCashFlow.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialStatements;
