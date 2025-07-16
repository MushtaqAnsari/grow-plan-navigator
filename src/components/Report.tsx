import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Download, TrendingUp, BarChart3, PieChart, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, ComposedChart, Area, AreaChart } from 'recharts';
import { ChartContainer } from './ui/chart';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { FinancialData } from '../pages/Index';

interface ReportProps {
  data: FinancialData;
}

interface ReportData {
  companyName: string;
  industry: string;
  revenueStreams: Array<{
    name: string;
    year1: number;
    year2: number;
    year3: number;
  }>;
  directCosts: Array<{
    name: string;
    year1: number;
    year2: number;
    year3: number;
  }>;
  operationalExpenses: Array<{
    category: string;
    year1: number;
    year2: number;
    year3: number;
  }>;
  loans: Array<{
    name: string;
    amount: number;
    interestRate: number;
    term: number;
  }>;
  taxation: {
    corporateTaxRate: number;
  };
}

const Report: React.FC<ReportProps> = ({ data }) => {
  // Convert FinancialData to ReportData format
  const convertToReportData = (financialData: FinancialData): ReportData => {
    // Calculate direct costs from revenue stream costs
    const directCosts = Object.entries(financialData.costs.revenueStreamCosts).map(([streamName, costs]) => ({
      name: streamName,
      year1: Object.values(costs.directCosts).reduce((sum, cost) => sum + cost.year1, 0),
      year2: Object.values(costs.directCosts).reduce((sum, cost) => sum + cost.year2, 0),
      year3: Object.values(costs.directCosts).reduce((sum, cost) => sum + cost.year3, 0)
    }));

    // Calculate operational expenses
    const operationalExpenses = [
      { category: 'Team Costs', year1: calculateTeamCosts('year1'), year2: calculateTeamCosts('year2'), year3: calculateTeamCosts('year3') },
      { category: 'Admin Costs', year1: calculateAdminCosts('year1'), year2: calculateAdminCosts('year2'), year3: calculateAdminCosts('year3') },
      { category: 'Marketing', year1: calculateMarketingCosts('year1'), year2: calculateMarketingCosts('year2'), year3: calculateMarketingCosts('year3') }
    ];

    return {
      companyName: 'EduLearn Platform',
      industry: 'Technology',
      revenueStreams: financialData.revenueStreams,
      directCosts,
      operationalExpenses,
      loans: financialData.loansAndFinancing.loans.map(loan => ({
        name: loan.name,
        amount: loan.principalAmount,
        interestRate: loan.interestRate,
        term: loan.termMonths
      })),
      taxation: {
        corporateTaxRate: financialData.taxation?.incomeTax.corporateRate || 20
      }
    };
  };

  const calculateTeamCosts = (year: 'year1' | 'year2' | 'year3') => {
    const salaries = data.costs.team.employees.reduce((sum, emp) => sum + emp.salary, 0);
    const consultants = data.costs.team.consultants.reduce((sum, cons) => sum + (cons.monthlyCost * 12), 0);
    const benefits = (salaries * (data.costs.team.healthCare.percentage + data.costs.team.benefits.percentage)) / 100;
    return salaries + consultants + benefits + data.costs.team.recruitment[year];
  };

  const calculateAdminCosts = (year: 'year1' | 'year2' | 'year3') => {
    return data.costs.admin.rent[year] + 
           data.costs.admin.travel[year] + 
           data.costs.admin.insurance[year] + 
           data.costs.admin.legal[year] + 
           data.costs.admin.accounting[year] + 
           data.costs.admin.software[year] + 
           data.costs.admin.other[year];
  };

  const calculateMarketingCosts = (year: 'year1' | 'year2' | 'year3') => {
    if (data.costs.marketing.isPercentageOfRevenue) {
      const revenue = data.revenueStreams.reduce((sum, stream) => sum + stream[year], 0);
      return revenue * (data.costs.marketing.percentageOfRevenue / 100);
    }
    return data.costs.marketing.manualBudget[year];
  };

  const reportData = convertToReportData(data);

  // Financial calculations
  const calculateTotalRevenue = (year: 'year1' | 'year2' | 'year3') => {
    return reportData.revenueStreams.reduce((sum, stream) => sum + (stream[year] || 0), 0);
  };

  const calculateTotalCosts = (year: 'year1' | 'year2' | 'year3') => {
    const directCosts = reportData.directCosts.reduce((sum, cost) => sum + (cost[year] || 0), 0);
    const opexCosts = reportData.operationalExpenses.reduce((sum, expense) => sum + (expense[year] || 0), 0);
    return directCosts + opexCosts;
  };

  const calculateEBITDA = (year: 'year1' | 'year2' | 'year3') => {
    return calculateTotalRevenue(year) - calculateTotalCosts(year);
  };

  const calculateNetProfit = (year: 'year1' | 'year2' | 'year3') => {
    const ebitda = calculateEBITDA(year);
    const interestExpense = reportData.loans.reduce((sum, loan) => sum + (loan.amount * loan.interestRate / 100), 0);
    const taxableIncome = Math.max(0, ebitda - interestExpense);
    const taxes = taxableIncome * (reportData.taxation.corporateTaxRate / 100);
    return taxableIncome - taxes;
  };

  // Valuation calculations (simplified)
  const calculateValuation = () => {
    const year3Revenue = calculateTotalRevenue('year3');
    const year3EBITDA = calculateEBITDA('year3');
    
    // Revenue multiple (industry average: 3-5x)
    const revenueMultiple = year3Revenue * 4;
    
    // EBITDA multiple (industry average: 8-12x)
    const ebitdaMultiple = year3EBITDA * 10;
    
    // Simple DCF (using year 3 cash flow)
    const terminalValue = calculateNetProfit('year3') * 15; // 15x P/E
    const dcfValue = terminalValue / Math.pow(1.12, 3); // 12% discount rate
    
    return {
      revenue: revenueMultiple,
      ebitda: ebitdaMultiple,
      dcf: dcfValue,
      average: (revenueMultiple + ebitdaMultiple + dcfValue) / 3
    };
  };

  const valuation = calculateValuation();

  // Chart data
  const revenueData = [
    { year: 'Year 1', revenue: calculateTotalRevenue('year1'), costs: calculateTotalCosts('year1'), profit: calculateNetProfit('year1') },
    { year: 'Year 2', revenue: calculateTotalRevenue('year2'), costs: calculateTotalCosts('year2'), profit: calculateNetProfit('year2') },
    { year: 'Year 3', revenue: calculateTotalRevenue('year3'), costs: calculateTotalCosts('year3'), profit: calculateNetProfit('year3') }
  ];

  const valuationData = [
    { method: 'Revenue Multiple', value: valuation.revenue },
    { method: 'EBITDA Multiple', value: valuation.ebitda },
    { method: 'DCF Analysis', value: valuation.dcf }
  ];

  const pieData = [
    { name: 'Year 1 Revenue', value: calculateTotalRevenue('year1'), fill: 'hsl(var(--chart-1))' },
    { name: 'Year 2 Revenue', value: calculateTotalRevenue('year2'), fill: 'hsl(var(--chart-2))' },
    { name: 'Year 3 Revenue', value: calculateTotalRevenue('year3'), fill: 'hsl(var(--chart-3))' }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const exportToPDF = async () => {
    const element = document.getElementById('financial-report');
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${reportData.companyName}-financial-report.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Financial Report</h2>
          <p className="text-muted-foreground">Comprehensive financial analysis and valuation</p>
        </div>
        <Button onClick={exportToPDF} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      <div id="financial-report" className="space-y-8 bg-background p-8">
        {/* Header */}
        <div className="text-center border-b pb-6">
          <h1 className="text-4xl font-bold text-primary mb-2">{reportData.companyName}</h1>
          <h2 className="text-2xl text-muted-foreground mb-4">Financial Valuation Report</h2>
          <p className="text-lg">Industry: {reportData.industry} | Report Date: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Executive Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{formatCurrency(valuation.average)}</div>
                <div className="text-sm text-muted-foreground">Average Valuation</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">{formatCurrency(calculateTotalRevenue('year3'))}</div>
                <div className="text-sm text-muted-foreground">Year 3 Revenue</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(calculateEBITDA('year3'))}</div>
                <div className="text-sm text-muted-foreground">Year 3 EBITDA</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {((calculateEBITDA('year3') / calculateTotalRevenue('year3')) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">EBITDA Margin</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed">
              Based on comprehensive financial analysis, {reportData.companyName} demonstrates strong growth potential with projected 
              Year 3 revenues of {formatCurrency(calculateTotalRevenue('year3'))} and an EBITDA margin of{' '}
              {((calculateEBITDA('year3') / calculateTotalRevenue('year3')) * 100).toFixed(1)}%. 
              The valuation analysis using multiple methodologies suggests a fair enterprise value of {formatCurrency(valuation.average)}.
            </p>
          </CardContent>
        </Card>

        {/* Financial Performance Charts */}
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Revenue vs Costs Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{
                revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
                costs: { label: "Costs", color: "hsl(var(--chart-2))" },
                profit: { label: "Net Profit", color: "hsl(var(--chart-3))" }
              }} className="h-[300px]">
                <ComposedChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="revenue" fill="var(--color-revenue)" />
                  <Bar dataKey="costs" fill="var(--color-costs)" />
                  <Line type="monotone" dataKey="profit" stroke="var(--color-profit)" strokeWidth={3} />
                </ComposedChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Revenue Growth Projection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{
                year1: { label: "Year 1", color: "hsl(var(--chart-1))" },
                year2: { label: "Year 2", color: "hsl(var(--chart-2))" },
                year3: { label: "Year 3", color: "hsl(var(--chart-3))" }
              }} className="h-[300px]">
                <RechartsPieChart>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </RechartsPieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Valuation Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Valuation Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{
              value: { label: "Valuation", color: "hsl(var(--chart-1))" }
            }} className="h-[250px] mb-6">
              <BarChart data={valuationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="method" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="value" fill="var(--color-value)" />
              </BarChart>
            </ChartContainer>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold">Revenue Multiple</div>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(valuation.revenue)}</div>
                <div className="text-sm text-muted-foreground">4.0x Revenue</div>
              </div>
              <div>
                <div className="text-lg font-semibold">EBITDA Multiple</div>
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(valuation.ebitda)}</div>
                <div className="text-sm text-muted-foreground">10.0x EBITDA</div>
              </div>
              <div>
                <div className="text-lg font-semibold">DCF Valuation</div>
                <div className="text-2xl font-bold text-purple-600">{formatCurrency(valuation.dcf)}</div>
                <div className="text-sm text-muted-foreground">12% Discount Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Table */}
        <Card>
          <CardHeader>
            <CardTitle>Key Financial Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Metric</th>
                    <th className="text-right p-3">Year 1</th>
                    <th className="text-right p-3">Year 2</th>
                    <th className="text-right p-3">Year 3</th>
                    <th className="text-right p-3">Growth (Y1-Y3)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Total Revenue</td>
                    <td className="text-right p-3">{formatCurrency(calculateTotalRevenue('year1'))}</td>
                    <td className="text-right p-3">{formatCurrency(calculateTotalRevenue('year2'))}</td>
                    <td className="text-right p-3">{formatCurrency(calculateTotalRevenue('year3'))}</td>
                    <td className="text-right p-3 text-green-600">
                      {(((calculateTotalRevenue('year3') - calculateTotalRevenue('year1')) / calculateTotalRevenue('year1')) * 100).toFixed(1)}%
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">EBITDA</td>
                    <td className="text-right p-3">{formatCurrency(calculateEBITDA('year1'))}</td>
                    <td className="text-right p-3">{formatCurrency(calculateEBITDA('year2'))}</td>
                    <td className="text-right p-3">{formatCurrency(calculateEBITDA('year3'))}</td>
                    <td className="text-right p-3 text-green-600">
                      {calculateEBITDA('year1') > 0 ? (((calculateEBITDA('year3') - calculateEBITDA('year1')) / calculateEBITDA('year1')) * 100).toFixed(1) : 'N/A'}%
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Net Profit</td>
                    <td className="text-right p-3">{formatCurrency(calculateNetProfit('year1'))}</td>
                    <td className="text-right p-3">{formatCurrency(calculateNetProfit('year2'))}</td>
                    <td className="text-right p-3">{formatCurrency(calculateNetProfit('year3'))}</td>
                    <td className="text-right p-3 text-green-600">
                      {calculateNetProfit('year1') > 0 ? (((calculateNetProfit('year3') - calculateNetProfit('year1')) / calculateNetProfit('year1')) * 100).toFixed(1) : 'N/A'}%
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">EBITDA Margin</td>
                    <td className="text-right p-3">{((calculateEBITDA('year1') / calculateTotalRevenue('year1')) * 100).toFixed(1)}%</td>
                    <td className="text-right p-3">{((calculateEBITDA('year2') / calculateTotalRevenue('year2')) * 100).toFixed(1)}%</td>
                    <td className="text-right p-3">{((calculateEBITDA('year3') / calculateTotalRevenue('year3')) * 100).toFixed(1)}%</td>
                    <td className="text-right p-3 text-blue-600">
                      {(((calculateEBITDA('year3') / calculateTotalRevenue('year3')) - (calculateEBITDA('year1') / calculateTotalRevenue('year1'))) * 100).toFixed(1)}pp
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Risk Assessment */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-red-600">Key Risks</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Market competition and pricing pressure</li>
                  <li>• Revenue concentration in early years</li>
                  <li>• Operating leverage and cost structure</li>
                  <li>• Economic and industry cyclicality</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-green-600">Growth Opportunities</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Strong revenue growth trajectory</li>
                  <li>• Improving operational efficiency</li>
                  <li>• Market expansion potential</li>
                  <li>• Technology and innovation advantages</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground border-t pt-4">
          This report was generated on {new Date().toLocaleDateString()} | 
          For investment purposes only - not financial advice |
          All figures in USD
        </div>
      </div>
    </div>
  );
};

export default Report;