import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialData } from "@/pages/Index";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from "@/lib/utils";

interface TaxationProps {
  data: FinancialData;
  onUpdateData: (data: FinancialData) => void;
}

const Taxation: React.FC<TaxationProps> = ({ data, onUpdateData }) => {
  // Initialize taxation data if it doesn't exist
  const taxationData = data.taxation || {
    incomeTax: {
      enabled: true,
      corporateRate: 20, // Saudi corporate tax rate
      year1: 0,
      year2: 0,
      year3: 0
    },
    zakat: {
      enabled: true,
      rate: 2.5, // Standard zakat rate
      calculationMethod: 'net-worth', // 'net-worth' or 'profit'
      year1: 0,
      year2: 0,
      year3: 0
    }
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

  const calculateTotalRevenue = (year: 'year1' | 'year2' | 'year3') => {
    return data.revenueStreams.reduce((sum, stream) => sum + (stream[year] || 0), 0);
  };

  const calculateDirectCosts = (year: 'year1' | 'year2' | 'year3') => {
    return Object.values(data.costs.revenueStreamCosts).reduce((sum, stream) => {
      return sum + Object.values(stream.directCosts).reduce((streamSum, cost) => streamSum + (cost[year] || 0), 0);
    }, 0);
  };

  const calculateEBITDA = (year: 'year1' | 'year2' | 'year3') => {
    const totalRevenue = calculateTotalRevenue(year);
    const directCosts = calculateDirectCosts(year);
    const operationalExpenses = calculateOperationalExpenses(year);
    return totalRevenue - directCosts - operationalExpenses;
  };

  const calculateInterestExpense = (year: 'year1' | 'year2' | 'year3') => {
    return data.loansAndFinancing?.totalInterestExpense?.[year] || 0;
  };

  const calculateProfitBeforeTax = (year: 'year1' | 'year2' | 'year3') => {
    return calculateEBITDA(year) - calculateInterestExpense(year);
  };

  const calculateIncomeTax = (year: 'year1' | 'year2' | 'year3') => {
    if (!taxationData.incomeTax.enabled) return 0;
    const profitBeforeTax = calculateProfitBeforeTax(year);
    return profitBeforeTax > 0 ? profitBeforeTax * (taxationData.incomeTax.corporateRate / 100) : 0;
  };

  const calculateZakat = (year: 'year1' | 'year2' | 'year3') => {
    if (!taxationData.zakat.enabled) return 0;
    
    if (taxationData.zakat.calculationMethod === 'profit') {
      const profitBeforeTax = calculateProfitBeforeTax(year);
      return profitBeforeTax > 0 ? profitBeforeTax * (taxationData.zakat.rate / 100) : 0;
    } else {
      // Net worth method - simplified calculation based on cash and receivables
      const cash = data.costs.balanceSheet.cashAndBank[year];
      const ar = data.costs.balanceSheet.accountsReceivable[`total${year.charAt(0).toUpperCase() + year.slice(1)}`];
      const inventory = data.costs.balanceSheet.inventory[year];
      const zakatableAssets = cash + ar + inventory;
      return zakatableAssets * (taxationData.zakat.rate / 100);
    }
  };

  const updateTaxation = (field: string, value: any) => {
    const updatedData = {
      ...data,
      taxation: {
        ...taxationData,
        [field]: {
          ...taxationData[field],
          ...value
        }
      }
    };
    onUpdateData(updatedData);
  };

  // Prepare chart data - only taxation related
  const taxChartData = [1, 2, 3].map(year => {
    const yearKey = `year${year}` as 'year1' | 'year2' | 'year3';
    return {
      year: `Year ${year}`,
      incomeTax: calculateIncomeTax(yearKey),
      zakat: calculateZakat(yearKey),
      totalTax: calculateIncomeTax(yearKey) + calculateZakat(yearKey)
    };
  });

  const year3TaxBreakdown = [
    { name: 'Income Tax', value: calculateIncomeTax('year3'), color: '#ef4444' },
    { name: 'Zakat', value: calculateZakat('year3'), color: '#22c55e' },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Tax Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Income Tax Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={taxationData.incomeTax.enabled}
                onCheckedChange={(checked) => updateTaxation('incomeTax', { enabled: checked })}
              />
              <Label>Enable Income Tax</Label>
            </div>
            <div>
              <Label>Corporate Tax Rate (%)</Label>
              <Input
                type="number"
                value={taxationData.incomeTax.corporateRate}
                onChange={(e) => updateTaxation('incomeTax', { corporateRate: parseFloat(e.target.value) || 0 })}
                disabled={!taxationData.incomeTax.enabled}
              />
              <p className="text-sm text-gray-500 mt-1">Saudi Arabia corporate tax rate: 20%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Zakat Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={taxationData.zakat.enabled}
                onCheckedChange={(checked) => updateTaxation('zakat', { enabled: checked })}
              />
              <Label>Enable Zakat</Label>
            </div>
            <div>
              <Label>Zakat Rate (%)</Label>
              <Input
                type="number"
                value={taxationData.zakat.rate}
                onChange={(e) => updateTaxation('zakat', { rate: parseFloat(e.target.value) || 0 })}
                disabled={!taxationData.zakat.enabled}
              />
              <p className="text-sm text-gray-500 mt-1">Standard zakat rate: 2.5%</p>
            </div>
            <div>
              <Label>Calculation Method</Label>
              <select
                className="w-full p-2 border rounded"
                value={taxationData.zakat.calculationMethod}
                onChange={(e) => updateTaxation('zakat', { calculationMethod: e.target.value })}
                disabled={!taxationData.zakat.enabled}
              >
                <option value="net-worth">Net Worth Method</option>
                <option value="profit">Profit Method</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Net Worth: Applied on cash, receivables, and inventory<br/>
                Profit: Applied on profit before tax
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tax Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(year => {
          const yearKey = `year${year}` as 'year1' | 'year2' | 'year3';
          const incomeTax = calculateIncomeTax(yearKey);
          const zakat = calculateZakat(yearKey);
          const totalTax = incomeTax + zakat;
          
          return (
            <Card key={year} className="border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="text-lg">Year {year} Tax Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Income Tax:</span>
                    <span className="font-medium text-red-600">{formatCurrency(incomeTax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Zakat:</span>
                    <span className="font-medium text-red-600">{formatCurrency(zakat)}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Tax Liability:</span>
                    <span className="font-bold text-red-600">{formatCurrency(totalTax)}</span>
                  </div>
                  <div className="text-center mt-3 p-2 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500">
                      Tax Rate: {taxationData.incomeTax.enabled ? `${taxationData.incomeTax.corporateRate}%` : '0%'} Income Tax
                      {taxationData.zakat.enabled && ` + ${taxationData.zakat.rate}% Zakat`}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tax Analysis Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Liability Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taxChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                <Bar dataKey="incomeTax" fill="#ef4444" name="Income Tax" />
                <Bar dataKey="zakat" fill="#22c55e" name="Zakat" />
                <Bar dataKey="totalTax" fill="#f97316" name="Total Tax" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Year 3 Tax Breakdown */}
      {year3TaxBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Year 3 Tax Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={year3TaxBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                  >
                    {year3TaxBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tax Rates Information */}
      <Card>
        <CardHeader>
          <CardTitle>Saudi Arabia Tax Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Income Tax</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Corporate tax rate: 20% (for non-Saudi companies)</li>
                <li>• Applied on taxable income/profit</li>
                <li>• Withholding tax on certain payments</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Zakat</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Rate: 2.5% (for Saudi/GCC companies)</li>
                <li>• Applied on net worth or profit</li>
                <li>• Based on Islamic principles</li>
                <li>• Calculated on zakatable assets</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Taxation;