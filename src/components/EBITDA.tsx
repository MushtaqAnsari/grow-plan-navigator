import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialData } from "@/pages/Index";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { formatCurrency, formatPercentage } from "@/lib/utils";

interface EBITDAProps {
  data: FinancialData;
}

const EBITDA: React.FC<EBITDAProps> = ({ data }) => {
  const calculateTotalRevenue = (year: 'year1' | 'year2' | 'year3') => {
    return data.revenueStreams.reduce((sum, stream) => sum + stream[year], 0);
  };

  const calculateDirectCosts = (year: 'year1' | 'year2' | 'year3') => {
    return Object.values(data.costs.revenueStreamCosts).reduce((sum, stream) => {
      return sum + Object.values(stream.directCosts).reduce((streamSum, cost) => streamSum + cost[year], 0);
    }, 0);
  };

  const calculateGrossProfit = (year: 'year1' | 'year2' | 'year3') => {
    return calculateTotalRevenue(year) - calculateDirectCosts(year);
  };

  const calculateOperationalExpenses = (year: 'year1' | 'year2' | 'year3') => {
    // Calculate team costs from employees and consultants with salary increases
    let employeeCosts = data.costs.team.employees?.reduce((sum, emp) => sum + emp.salary, 0) || 0;
    
    // Apply salary increases if they exist
    if (data.costs.admin.salaryIncreases) {
      if (year === 'year2' && data.costs.admin.salaryIncreases.year2) {
        employeeCosts = data.costs.admin.salaryIncreases.year2;
      } else if (year === 'year3' && data.costs.admin.salaryIncreases.year3) {
        employeeCosts = data.costs.admin.salaryIncreases.year3;
      }
    }
    
    const consultantCosts = data.costs.team.consultants?.reduce((sum, cons) => sum + (cons.monthlyCost * 12), 0) || 0;
    const benefitsCosts = ((employeeCosts + consultantCosts) * (data.costs.team.healthCare.percentage + data.costs.team.benefits.percentage) / 100) + 
                         (data.costs.team.healthCare.amount + data.costs.team.benefits.amount + data.costs.team.iqama.amount) * 12;
    const recruitmentCosts = data.costs.team.recruitment[year] || 0;
    const teamCosts = employeeCosts + consultantCosts + benefitsCosts + recruitmentCosts;
    
    // Calculate admin costs
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
    return calculateGrossProfit(year) - calculateOperationalExpenses(year);
  };

  const calculateEBITDAMargin = (year: 'year1' | 'year2' | 'year3') => {
    const revenue = calculateTotalRevenue(year);
    const ebitda = calculateEBITDA(year);
    return revenue > 0 ? (ebitda / revenue) * 100 : 0;
  };

  const calculateGrossMargin = (year: 'year1' | 'year2' | 'year3') => {
    const revenue = calculateTotalRevenue(year);
    const grossProfit = calculateGrossProfit(year);
    return revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  };

  // Prepare chart data
  const ebitdaChartData = [1, 2, 3].map(year => {
    const yearKey = `year${year}` as 'year1' | 'year2' | 'year3';
    return {
      year: `Year ${year}`,
      revenue: calculateTotalRevenue(yearKey),
      grossProfit: calculateGrossProfit(yearKey),
      ebitda: calculateEBITDA(yearKey),
      ebitdaMargin: calculateEBITDAMargin(yearKey),
      grossMargin: calculateGrossMargin(yearKey)
    };
  });

  const expenseBreakdownData = [1, 2, 3].map(year => {
    const yearKey = `year${year}` as 'year1' | 'year2' | 'year3';
    
    // Calculate team costs properly with salary increases
    let employeeCosts = data.costs.team.employees?.reduce((sum, emp) => sum + emp.salary, 0) || 0;
    
    // Apply salary increases if they exist
    if (data.costs.admin.salaryIncreases) {
      if (yearKey === 'year2' && data.costs.admin.salaryIncreases.year2) {
        employeeCosts = data.costs.admin.salaryIncreases.year2;
      } else if (yearKey === 'year3' && data.costs.admin.salaryIncreases.year3) {
        employeeCosts = data.costs.admin.salaryIncreases.year3;
      }
    }
    
    const consultantCosts = data.costs.team.consultants?.reduce((sum, cons) => sum + (cons.monthlyCost * 12), 0) || 0;
    const benefitsCosts = ((employeeCosts + consultantCosts) * (data.costs.team.healthCare.percentage + data.costs.team.benefits.percentage) / 100) + 
                         (data.costs.team.healthCare.amount + data.costs.team.benefits.amount + data.costs.team.iqama.amount) * 12;
    const recruitmentCosts = data.costs.team.recruitment[yearKey] || 0;
    const teamCosts = employeeCosts + consultantCosts + benefitsCosts + recruitmentCosts;
    
    // Calculate admin costs properly
    const adminCosts = (data.costs.admin.rent[yearKey] || 0) + 
                      (data.costs.admin.travel[yearKey] || 0) + 
                      (data.costs.admin.insurance[yearKey] || 0) + 
                      (data.costs.admin.legal[yearKey] || 0) + 
                      (data.costs.admin.accounting[yearKey] || 0) + 
                      (data.costs.admin.software[yearKey] || 0) + 
                      (data.costs.admin.other[yearKey] || 0);
    
    const marketingCosts = data.costs.marketing.isPercentageOfRevenue 
      ? calculateTotalRevenue(yearKey) * (data.costs.marketing.percentageOfRevenue / 100)
      : (data.costs.marketing.manualBudget?.[yearKey] || 0);
    
    return {
      year: `Year ${year}`,
      team: teamCosts,
      admin: adminCosts,
      marketing: marketingCosts,
      direct: calculateDirectCosts(yearKey)
    };
  });

  return (
    <div className="space-y-6">
      {/* EBITDA Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(year => {
          const yearKey = `year${year}` as 'year1' | 'year2' | 'year3';
          const revenue = calculateTotalRevenue(yearKey);
          const ebitda = calculateEBITDA(yearKey);
          const ebitdaMargin = calculateEBITDAMargin(yearKey);
          const isPositive = ebitda >= 0;
          
          return (
            <Card key={year} className={`border-l-4 ${isPositive ? 'border-l-green-500' : 'border-l-red-500'}`}>
              <CardHeader>
                <CardTitle className="text-lg">Year {year} EBITDA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Revenue:</span>
                    <span className="font-medium">{formatCurrency(revenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Gross Profit:</span>
                    <span className="font-medium text-green-600">{formatCurrency(calculateGrossProfit(yearKey))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Operating Expenses:</span>
                    <span className="font-medium text-red-600">-{formatCurrency(calculateOperationalExpenses(yearKey))}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">EBITDA:</span>
                    <span className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(ebitda)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">EBITDA Margin:</span>
                    <span className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercentage(ebitdaMargin)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* EBITDA Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>EBITDA Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ebitdaChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                <Bar dataKey="revenue" fill="#e2e8f0" name="Revenue" />
                <Bar dataKey="grossProfit" fill="#22c55e" name="Gross Profit" />
                <Bar dataKey="ebitda" fill="#3b82f6" name="EBITDA" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Margin Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Margin Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ebitdaChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip formatter={(value: number) => [formatPercentage(value), '']} />
                <Line 
                  type="monotone" 
                  dataKey="grossMargin" 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  name="Gross Margin"
                  dot={{ fill: '#22c55e', strokeWidth: 2, r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="ebitdaMargin" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name="EBITDA Margin"
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Expense Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Structure Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseBreakdownData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                <Bar dataKey="direct" stackId="a" fill="#ef4444" name="Direct Costs" />
                <Bar dataKey="team" stackId="a" fill="#8b5cf6" name="Team Costs" />
                <Bar dataKey="admin" stackId="a" fill="#f59e0b" name="Admin Costs" />
                <Bar dataKey="marketing" stackId="a" fill="#10b981" name="Marketing Costs" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Key Performance Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatPercentage(calculateEBITDAMargin('year3'))}
              </div>
              <div className="text-sm text-gray-600">Year 3 EBITDA Margin</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatPercentage(calculateGrossMargin('year3'))}
              </div>
              <div className="text-sm text-gray-600">Year 3 Gross Margin</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(calculateTotalRevenue('year3') / 12)}
              </div>
              <div className="text-sm text-gray-600">Year 3 Monthly Revenue</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(calculateOperationalExpenses('year3') / 12)}
              </div>
              <div className="text-sm text-gray-600">Year 3 Monthly OpEx</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EBITDA;