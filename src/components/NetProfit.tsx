import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialData } from "@/pages/Index";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';

interface NetProfitProps {
  data: FinancialData;
}

const NetProfit: React.FC<NetProfitProps> = ({ data }) => {
  const calculateTotalRevenue = (year: 'year1' | 'year2' | 'year3') => {
    return data.revenueStreams.reduce((sum, stream) => sum + stream[year], 0);
  };

  const calculateDirectCosts = (year: 'year1' | 'year2' | 'year3') => {
    return Object.values(data.costs.revenueStreamCosts).reduce((sum, stream) => {
      return sum + Object.values(stream.directCosts).reduce((streamSum, cost) => streamSum + cost[year], 0);
    }, 0);
  };

  const calculateOperationalExpenses = (year: 'year1' | 'year2' | 'year3') => {
    // Calculate team costs properly
    const employeeCosts = data.costs.team.employees?.reduce((sum, emp) => sum + emp.salary, 0) || 0;
    const consultantCosts = data.costs.team.consultants?.reduce((sum, cons) => sum + (cons.monthlyCost * 12), 0) || 0;
    const benefitsCosts = ((employeeCosts + consultantCosts) * (data.costs.team.healthCare.percentage + data.costs.team.benefits.percentage) / 100) + 
                         (data.costs.team.healthCare.amount + data.costs.team.benefits.amount + data.costs.team.iqama.amount) * 12;
    const recruitmentCosts = data.costs.team.recruitment[year] || 0;
    const teamCosts = employeeCosts + consultantCosts + benefitsCosts + recruitmentCosts;
    
    // Calculate admin costs properly
    const adminCosts = (data.costs.admin.rent[year] || 0) + 
                      (data.costs.admin.travel[year] || 0) + 
                      (data.costs.admin.insurance[year] || 0) + 
                      (data.costs.admin.legal[year] || 0) + 
                      (data.costs.admin.accounting[year] || 0) + 
                      (data.costs.admin.software[year] || 0) + 
                      (data.costs.admin.other[year] || 0);
    
    const marketingCosts = data.costs.marketing.isPercentageOfRevenue 
      ? calculateTotalRevenue(year) * (data.costs.marketing.percentageOfRevenue / 100)
      : (data.costs.marketing.manualBudget?.[year] || 0);
    
    return teamCosts + adminCosts + marketingCosts;
  };

  const calculateEBITDA = (year: 'year1' | 'year2' | 'year3') => {
    return calculateTotalRevenue(year) - calculateDirectCosts(year) - calculateOperationalExpenses(year);
  };

  const calculateInterestExpense = (year: 'year1' | 'year2' | 'year3') => {
    return data.loansAndFinancing?.totalInterestExpense?.[year] || 0;
  };

  const calculateProfitBeforeTax = (year: 'year1' | 'year2' | 'year3') => {
    return calculateEBITDA(year) - calculateInterestExpense(year);
  };

  const calculateTaxes = (year: 'year1' | 'year2' | 'year3') => {
    const taxationData = data.taxation || {
      incomeTax: { enabled: false, corporateRate: 20 },
      zakat: { enabled: false, rate: 2.5, calculationMethod: 'net-worth' }
    };

    let incomeTax = 0;
    let zakat = 0;

    if (taxationData.incomeTax.enabled) {
      const profitBeforeTax = calculateProfitBeforeTax(year);
      incomeTax = profitBeforeTax > 0 ? profitBeforeTax * (taxationData.incomeTax.corporateRate / 100) : 0;
    }

    if (taxationData.zakat.enabled) {
      if (taxationData.zakat.calculationMethod === 'profit') {
        const profitBeforeTax = calculateProfitBeforeTax(year);
        zakat = profitBeforeTax > 0 ? profitBeforeTax * (taxationData.zakat.rate / 100) : 0;
      } else {
        const cash = data.costs.balanceSheet.cashAndBank[year];
        const ar = data.costs.balanceSheet.accountsReceivable[`total${year.charAt(0).toUpperCase() + year.slice(1)}`];
        const inventory = data.costs.balanceSheet.inventory[year];
        const zakatableAssets = cash + ar + inventory;
        zakat = zakatableAssets * (taxationData.zakat.rate / 100);
      }
    }

    return { incomeTax, zakat, total: incomeTax + zakat };
  };

  const calculateNetProfit = (year: 'year1' | 'year2' | 'year3') => {
    const profitBeforeTax = calculateProfitBeforeTax(year);
    const taxes = calculateTaxes(year);
    return profitBeforeTax - taxes.total;
  };

  const calculateNetProfitMargin = (year: 'year1' | 'year2' | 'year3') => {
    const revenue = calculateTotalRevenue(year);
    const netProfit = calculateNetProfit(year);
    return revenue > 0 ? (netProfit / revenue) * 100 : 0;
  };

  const calculateReturnOnRevenue = (year: 'year1' | 'year2' | 'year3') => {
    return calculateNetProfitMargin(year);
  };

  // Prepare chart data
  const profitAnalysisData = [1, 2, 3].map(year => {
    const yearKey = `year${year}` as 'year1' | 'year2' | 'year3';
    const taxes = calculateTaxes(yearKey);
    return {
      year: `Year ${year}`,
      revenue: calculateTotalRevenue(yearKey),
      directCosts: calculateDirectCosts(yearKey),
      operatingExpenses: calculateOperationalExpenses(yearKey),
      ebitda: calculateEBITDA(yearKey),
      interestExpense: calculateInterestExpense(yearKey),
      profitBeforeTax: calculateProfitBeforeTax(yearKey),
      taxes: taxes.total,
      netProfit: calculateNetProfit(yearKey),
      netProfitMargin: calculateNetProfitMargin(yearKey)
    };
  });

  const waterfallData = (() => {
    const year3Data = profitAnalysisData[2];
    return [
      { name: 'Revenue', value: year3Data.revenue, cumulative: year3Data.revenue },
      { name: 'Direct Costs', value: -year3Data.directCosts, cumulative: year3Data.revenue - year3Data.directCosts },
      { name: 'Operating Expenses', value: -year3Data.operatingExpenses, cumulative: year3Data.ebitda },
      { name: 'Interest Expense', value: -year3Data.interestExpense, cumulative: year3Data.profitBeforeTax },
      { name: 'Taxes', value: -year3Data.taxes, cumulative: year3Data.netProfit },
      { name: 'Net Profit', value: year3Data.netProfit, cumulative: year3Data.netProfit }
    ];
  })();

  const profitabilityMetrics = [
    {
      title: 'Net Profit Margin',
      value: calculateNetProfitMargin('year3'),
      format: 'percentage',
      icon: Percent,
      color: 'text-blue-600'
    },
    {
      title: 'Return on Revenue',
      value: calculateReturnOnRevenue('year3'),
      format: 'percentage',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Profit Growth (Y2-Y3)',
      value: ((calculateNetProfit('year3') - calculateNetProfit('year2')) / Math.abs(calculateNetProfit('year2'))) * 100,
      format: 'percentage',
      icon: calculateNetProfit('year3') > calculateNetProfit('year2') ? TrendingUp : TrendingDown,
      color: calculateNetProfit('year3') > calculateNetProfit('year2') ? 'text-green-600' : 'text-red-600'
    },
    {
      title: 'Cumulative Net Profit',
      value: calculateNetProfit('year1') + calculateNetProfit('year2') + calculateNetProfit('year3'),
      format: 'currency',
      icon: DollarSign,
      color: 'text-purple-600'
    }
  ];

  const year3BreakdownData = [
    { name: 'Direct Costs', value: Math.abs(profitAnalysisData[2].directCosts), color: '#ef4444' },
    { name: 'Operating Expenses', value: Math.abs(profitAnalysisData[2].operatingExpenses), color: '#f59e0b' },
    { name: 'Interest Expense', value: Math.abs(profitAnalysisData[2].interestExpense), color: '#8b5cf6' },
    { name: 'Taxes', value: Math.abs(profitAnalysisData[2].taxes), color: '#10b981' },
    { name: 'Net Profit', value: Math.abs(profitAnalysisData[2].netProfit), color: '#3b82f6' }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Net Profit Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(year => {
          const yearKey = `year${year}` as 'year1' | 'year2' | 'year3';
          const netProfit = calculateNetProfit(yearKey);
          const netProfitMargin = calculateNetProfitMargin(yearKey);
          const taxes = calculateTaxes(yearKey);
          const isPositive = netProfit >= 0;
          
          return (
            <Card key={year} className={`border-l-4 ${isPositive ? 'border-l-green-500' : 'border-l-red-500'}`}>
              <CardHeader>
                <CardTitle className="text-lg">Year {year} Net Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Revenue:</span>
                    <span className="font-medium">${calculateTotalRevenue(yearKey).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">EBITDA:</span>
                    <span className="font-medium text-blue-600">${calculateEBITDA(yearKey).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Interest:</span>
                    <span className="font-medium text-red-600">-${calculateInterestExpense(yearKey).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Taxes:</span>
                    <span className="font-medium text-red-600">-${taxes.total.toLocaleString()}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Net Profit:</span>
                    <span className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      ${netProfit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Net Margin:</span>
                    <span className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {netProfitMargin.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Key Profitability Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Key Profitability Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {profitabilityMetrics.map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-center mb-2">
                    <IconComponent className={`h-6 w-6 ${metric.color}`} />
                  </div>
                  <div className={`text-2xl font-bold ${metric.color}`}>
                    {metric.format === 'percentage' 
                      ? `${metric.value.toFixed(1)}%`
                      : `$${metric.value.toLocaleString()}`
                    }
                  </div>
                  <div className="text-sm text-gray-600">{metric.title}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Profit Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Profit Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={profitAnalysisData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stackId="1" 
                  stroke="#e2e8f0" 
                  fill="#e2e8f0" 
                  name="Revenue"
                />
                <Area 
                  type="monotone" 
                  dataKey="ebitda" 
                  stackId="2" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  name="EBITDA"
                />
                <Line 
                  type="monotone" 
                  dataKey="netProfit" 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  name="Net Profit"
                  dot={{ fill: '#22c55e', strokeWidth: 2, r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Net Profit Margin Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Net Profit Margin Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={profitAnalysisData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, '']} />
                <Line 
                  type="monotone" 
                  dataKey="netProfitMargin" 
                  stroke="#8b5cf6" 
                  strokeWidth={4}
                  name="Net Profit Margin"
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Waterfall Chart Simulation */}
      <Card>
        <CardHeader>
          <CardTitle>Year 3 Profit Waterfall Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterfallData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                <Bar 
                  dataKey="value" 
                  fill="#3b82f6"
                  name="Amount"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Year 3 Cost Breakdown */}
      {year3BreakdownData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Year 3 Cost and Profit Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={year3BreakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    dataKey="value"
                    label={({ name, value }) => `${name}: $${value.toLocaleString()}`}
                  >
                    {year3BreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profitability Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Profitability Analysis & Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800">Profitability Trend</h4>
                <p className="text-sm text-blue-600">
                  {calculateNetProfit('year3') > calculateNetProfit('year1') 
                    ? "Growing profitability over the 3-year period" 
                    : "Declining profitability trend requires attention"}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800">Break-even Status</h4>
                <p className="text-sm text-green-600">
                  {calculateNetProfit('year3') > 0 
                    ? "Profitable by Year 3" 
                    : "Still working towards profitability"}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800">Margin Health</h4>
                <p className="text-sm text-purple-600">
                  {calculateNetProfitMargin('year3') > 10 
                    ? "Healthy profit margins" 
                    : calculateNetProfitMargin('year3') > 0 
                      ? "Modest profit margins" 
                      : "Negative margins need improvement"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetProfit;