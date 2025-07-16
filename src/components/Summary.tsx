import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialData } from "@/pages/Index";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface SummaryProps {
  data: FinancialData;
}

const Summary: React.FC<SummaryProps> = ({ data }) => {
  const calculateTotalRevenue = (year: 'year1' | 'year2' | 'year3') => {
    return data.revenueStreams.reduce((sum, stream) => sum + stream[year], 0);
  };

  const calculateDirectCosts = (year: 'year1' | 'year2' | 'year3') => {
    return Object.values(data.costs.revenueStreamCosts).reduce((sum, stream) => {
      return sum + Object.values(stream.directCosts).reduce((streamSum, cost) => streamSum + cost[year], 0);
    }, 0);
  };

  const calculateOperationalExpenses = (year: 'year1' | 'year2' | 'year3') => {
    const teamCosts = Object.values(data.costs.team).reduce((sum, cost) => sum + cost[year], 0);
    const adminCosts = Object.values(data.costs.admin).reduce((sum, cost) => sum + cost[year], 0);
    
    const marketingCosts = data.costs.marketing.isPercentageOfRevenue 
      ? calculateTotalRevenue(year) * (data.costs.marketing.percentageOfRevenue / 100)
      : data.costs.marketing.manualBudget[year];
    
    return teamCosts + adminCosts + marketingCosts;
  };

  const calculateEBITDA = (year: 'year1' | 'year2' | 'year3') => {
    const revenue = calculateTotalRevenue(year);
    const directCosts = calculateDirectCosts(year);
    const opEx = calculateOperationalExpenses(year);
    return revenue - directCosts - opEx;
  };

  // Customer Acquisition Cost (CAC) - simplified calculation
  const calculateCAC = (year: 'year1' | 'year2' | 'year3') => {
    const marketingCosts = data.costs.marketing.isPercentageOfRevenue 
      ? calculateTotalRevenue(year) * (data.costs.marketing.percentageOfRevenue / 100)
      : data.costs.marketing.manualBudget[year];
    
    const revenue = calculateTotalRevenue(year);
    // Assuming average revenue per customer for different business models
    const avgRevenuePerCustomer = 1000; // This could be made configurable
    const customersAcquired = revenue / avgRevenuePerCustomer;
    
    return customersAcquired > 0 ? marketingCosts / customersAcquired : 0;
  };

  // Customer Lifetime Value (LTV) - simplified calculation
  const calculateLTV = () => {
    const year3Revenue = calculateTotalRevenue('year3');
    const avgRevenuePerCustomer = 1000; // This could be made configurable
    const customers = year3Revenue / avgRevenuePerCustomer;
    const avgCustomerLifetime = 3; // years
    return avgRevenuePerCustomer * avgCustomerLifetime;
  };

  // LTV/CAC Ratio
  const calculateLTVCACRatio = () => {
    const ltv = calculateLTV();
    const cac = calculateCAC('year3');
    return cac > 0 ? ltv / cac : 0;
  };

  // Revenue Growth Rate
  const calculateRevenueGrowthRate = () => {
    const year1Revenue = calculateTotalRevenue('year1');
    const year3Revenue = calculateTotalRevenue('year3');
    return year1Revenue > 0 ? ((year3Revenue - year1Revenue) / year1Revenue) * 100 : 0;
  };

  // Gross Margin
  const calculateGrossMargin = (year: 'year1' | 'year2' | 'year3') => {
    const revenue = calculateTotalRevenue(year);
    const directCosts = calculateDirectCosts(year);
    return revenue > 0 ? ((revenue - directCosts) / revenue) * 100 : 0;
  };

  // Operating Margin
  const calculateOperatingMargin = (year: 'year1' | 'year2' | 'year3') => {
    const revenue = calculateTotalRevenue(year);
    const ebitda = calculateEBITDA(year);
    return revenue > 0 ? (ebitda / revenue) * 100 : 0;
  };

  // Prepare chart data
  const revenueComposition = data.revenueStreams.map((stream, index) => ({
    name: stream.name,
    value: stream.year3,
    color: ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'][index % 6]
  }));

  const profitabilityData = [1, 2, 3].map(year => {
    const yearKey = `year${year}` as 'year1' | 'year2' | 'year3';
    return {
      year: `Year ${year}`,
      revenue: calculateTotalRevenue(yearKey),
      grossProfit: calculateTotalRevenue(yearKey) - calculateDirectCosts(yearKey),
      ebitda: calculateEBITDA(yearKey),
      grossMargin: calculateGrossMargin(yearKey),
      operatingMargin: calculateOperatingMargin(yearKey)
    };
  });

  const keyMetrics = [
    {
      title: "LTV/CAC Ratio",
      value: calculateLTVCACRatio().toFixed(1),
      target: "3.0+",
      status: calculateLTVCACRatio() >= 3 ? "good" : "warning",
      description: "Customer lifetime value to acquisition cost ratio"
    },
    {
      title: "Gross Margin (Y3)",
      value: calculateGrossMargin('year3').toFixed(1) + "%",
      target: "70%+",
      status: calculateGrossMargin('year3') >= 70 ? "good" : "warning",
      description: "Year 3 gross profit margin"
    },
    {
      title: "Operating Margin (Y3)",
      value: calculateOperatingMargin('year3').toFixed(1) + "%",
      target: "20%+",
      status: calculateOperatingMargin('year3') >= 20 ? "good" : "warning",
      description: "Year 3 operating profit margin"
    },
    {
      title: "Revenue Growth",
      value: calculateRevenueGrowthRate().toFixed(0) + "%",
      target: "100%+",
      status: calculateRevenueGrowthRate() >= 100 ? "good" : "warning",
      description: "3-year total revenue growth"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                ${calculateTotalRevenue('year3').toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Year 3 Revenue</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                ${calculateEBITDA('year3').toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Year 3 EBITDA</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {calculateLTVCACRatio().toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">LTV/CAC Ratio</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {calculateRevenueGrowthRate().toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Revenue Growth</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Key Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {keyMetrics.map((metric, index) => (
              <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{metric.title}</h4>
                  <p className="text-sm text-gray-600">{metric.description}</p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${metric.status === 'good' ? 'text-green-600' : 'text-orange-600'}`}>
                    {metric.value}
                  </div>
                  <div className="text-sm text-gray-500">Target: {metric.target}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Composition (Year 3)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueComposition}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {revenueComposition.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profitability Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profitabilityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                  <Bar dataKey="revenue" fill="#e2e8f0" name="Revenue" />
                  <Bar dataKey="grossProfit" fill="#22c55e" name="Gross Profit" />
                  <Bar dataKey="ebitda" fill="#3b82f6" name="EBITDA" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Ratios */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Ratios & Benchmarks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-3">Profitability Ratios</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Gross Margin (Y3):</span>
                  <span className="font-medium">{calculateGrossMargin('year3').toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Operating Margin (Y3):</span>
                  <span className="font-medium">{calculateOperatingMargin('year3').toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">EBITDA Margin (Y3):</span>
                  <span className="font-medium">{calculateOperatingMargin('year3').toFixed(1)}%</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Growth Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Revenue CAGR:</span>
                  <span className="font-medium">{(Math.pow(calculateTotalRevenue('year3') / calculateTotalRevenue('year1'), 1/2) - 1).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Growth:</span>
                  <span className="font-medium">{calculateRevenueGrowthRate().toFixed(0)}%</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Customer Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">CAC (Y3):</span>
                  <span className="font-medium">${calculateCAC('year3').toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">LTV:</span>
                  <span className="font-medium">${calculateLTV().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">LTV/CAC:</span>
                  <span className="font-medium">{calculateLTVCACRatio().toFixed(1)}x</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Summary;