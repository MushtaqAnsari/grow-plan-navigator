
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FinancialData } from "@/pages/Index";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface ValuationModelProps {
  data: FinancialData;
}

const ValuationModel: React.FC<ValuationModelProps> = ({ data }) => {
  const [industry, setIndustry] = useState('saas');
  const [customMultiple, setCustomMultiple] = useState<number>(0);

  // Industry multiples (Price to Revenue ratios)
  const industryMultiples = {
    saas: { name: 'SaaS/Software', multiple: 8 },
    ecommerce: { name: 'E-commerce', multiple: 3 },
    fintech: { name: 'FinTech', multiple: 6 },
    healthtech: { name: 'HealthTech', multiple: 7 },
    marketplace: { name: 'Marketplace', multiple: 5 },
    hardware: { name: 'Hardware', multiple: 2 },
    consulting: { name: 'Consulting/Services', multiple: 1.5 },
    custom: { name: 'Custom Multiple', multiple: customMultiple }
  };

  const calculateTotalRevenue = (year: number) => {
    const yearKey = `year${year}` as 'year1' | 'year2' | 'year3';
    return data.revenueStreams.reduce((sum, stream) => sum + stream[yearKey], 0);
  };

  const calculateTotalCosts = (year: number) => {
    const yearKey = `year${year}` as 'year1' | 'year2' | 'year3';
    return Object.values(data.costs).reduce((sum, category) => sum + category[yearKey], 0);
  };

  const calculatePayroll = (year: number) => {
    return data.costs.team.employees
      .reduce((sum, emp) => sum + emp.salary, 0);
  };

  // Calculate key metrics for valuation
  const year3Revenue = calculateTotalRevenue(3);
  const year3Costs = calculateTotalCosts(3);
  const year3Payroll = calculatePayroll(3);
  const year3NetIncome = year3Revenue - year3Costs - year3Payroll;
  
  const selectedMultiple = industryMultiples[industry as keyof typeof industryMultiples];
  const revenueMultipleValuation = year3Revenue * selectedMultiple.multiple;
  
  // DCF calculation (simplified)
  const discountRate = 0.12; // 12% discount rate
  const terminalGrowthRate = 0.03; // 3% terminal growth
  
  const cashFlows = [1, 2, 3].map(year => {
    const revenue = calculateTotalRevenue(year);
    const costs = calculateTotalCosts(year);
    const payroll = calculatePayroll(year);
    return revenue - costs - payroll;
  });

  const presentValues = cashFlows.map((cf, index) => cf / Math.pow(1 + discountRate, index + 1));
  const terminalValue = (cashFlows[2] * (1 + terminalGrowthRate)) / (discountRate - terminalGrowthRate);
  const presentValueTerminal = terminalValue / Math.pow(1 + discountRate, 3);
  const dcfValuation = presentValues.reduce((sum, pv) => sum + pv, 0) + presentValueTerminal;

  // Risk assessment based on financial health
  const getRiskLevel = () => {
    const totalRevenue = year3Revenue;
    const profitMargin = totalRevenue > 0 ? (year3NetIncome / totalRevenue) * 100 : 0;
    const hasConsistentGrowth = calculateTotalRevenue(3) > calculateTotalRevenue(2) && calculateTotalRevenue(2) > calculateTotalRevenue(1);
    
    if (profitMargin > 20 && hasConsistentGrowth && totalRevenue > 1000000) return 'Low';
    if (profitMargin > 10 && hasConsistentGrowth) return 'Medium';
    if (profitMargin > 0) return 'Medium-High';
    return 'High';
  };

  const riskLevel = getRiskLevel();
  const riskAdjustment = {
    'Low': 1.0,
    'Medium': 0.85,
    'Medium-High': 0.7,
    'High': 0.5
  }[riskLevel];

  const adjustedValuation = revenueMultipleValuation * riskAdjustment;

  // Valuation comparison data
  const valuationMethods = [
    { method: 'Revenue Multiple', value: revenueMultipleValuation, color: '#3b82f6' },
    { method: 'Risk Adjusted', value: adjustedValuation, color: '#10b981' },
    { method: 'DCF Model', value: Math.max(0, dcfValuation), color: '#f59e0b' }
  ];

  // Funding needs analysis
  const cumulativeCashFlow = cashFlows.reduce((acc, cf, index) => {
    const prev = index > 0 ? acc[index - 1] : data.funding.totalFunding;
    acc.push(prev + cf);
    return acc;
  }, [] as number[]);

  const fundingGap = Math.min(...cumulativeCashFlow);
  const additionalFundingNeeded = fundingGap < 0 ? Math.abs(fundingGap) : 0;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* Valuation Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>Valuation Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="industry-select">Industry Sector</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(industryMultiples).map(([key, value]) => {
                    if (key === 'custom') return null;
                    return (
                      <SelectItem key={key} value={key}>
                        {value.name} ({value.multiple}x Revenue)
                      </SelectItem>
                    );
                  })}
                  <SelectItem value="custom">Custom Multiple</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {industry === 'custom' && (
              <div>
                <Label htmlFor="custom-multiple">Custom Revenue Multiple</Label>
                <Input
                  id="custom-multiple"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 5.0"
                  value={customMultiple || ''}
                  onChange={(e) => setCustomMultiple(Number(e.target.value))}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Valuation Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Company Valuation</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={valuationMethods}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="method" />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Valuation Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={valuationMethods}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ method, value }) => `${method}: $${(value/1000000).toFixed(1)}M`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {valuationMethods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Key Valuation Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Key Valuation Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                ${adjustedValuation.toLocaleString()}
              </p>
              <p className="text-sm text-blue-700">Recommended Valuation</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {selectedMultiple.multiple}x
              </p>
              <p className="text-sm text-green-700">Revenue Multiple</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className={`text-2xl font-bold ${riskLevel === 'Low' ? 'text-green-600' : riskLevel === 'High' ? 'text-red-600' : 'text-yellow-600'}`}>
                {riskLevel}
              </p>
              <p className="text-sm text-gray-700">Risk Level</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {year3Revenue > 0 ? ((year3NetIncome / year3Revenue) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-sm text-purple-700">Net Margin (Y3)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Funding Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Funding Requirements Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-xl font-bold text-slate-700">
                ${data.funding.totalFunding.toLocaleString()}
              </p>
              <p className="text-sm text-slate-600">Current Funding</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-xl font-bold text-red-600">
                ${additionalFundingNeeded.toLocaleString()}
              </p>
              <p className="text-sm text-red-700">Additional Funding Needed</p>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <p className="text-xl font-bold text-indigo-600">
                {data.funding.totalFunding > 0 && data.funding.burnRate > 0 
                  ? Math.floor(data.funding.totalFunding / (data.funding.burnRate * 12))
                  : 'N/A'
                }
              </p>
              <p className="text-sm text-indigo-700">Runway (Years)</p>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="font-semibold mb-3">Valuation Summary</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                Based on your {selectedMultiple.name.toLowerCase()} business model and {selectedMultiple.multiple}x revenue multiple:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Year 3 projected revenue: ${year3Revenue.toLocaleString()}</li>
                <li>Risk adjustment factor: {(riskAdjustment * 100).toFixed(0)}% (Risk level: {riskLevel})</li>
                <li>Recommended valuation range: ${(adjustedValuation * 0.8).toLocaleString()} - ${(adjustedValuation * 1.2).toLocaleString()}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ValuationModel;
