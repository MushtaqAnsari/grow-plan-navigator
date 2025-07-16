import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Download, TrendingUp, BarChart3, PieChart, DollarSign, Award, Target, AlertTriangle, CheckCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, ComposedChart, AreaChart, Area, ResponsiveContainer } from 'recharts';
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
    const directCosts = Object.entries(financialData.costs.revenueStreamCosts).map(([streamName, costs]) => ({
      name: streamName,
      year1: Object.values(costs.directCosts).reduce((sum, cost) => sum + cost.year1, 0),
      year2: Object.values(costs.directCosts).reduce((sum, cost) => sum + cost.year2, 0),
      year3: Object.values(costs.directCosts).reduce((sum, cost) => sum + cost.year3, 0)
    }));

    const operationalExpenses = [
      { category: 'Team Costs', year1: calculateTeamCosts('year1'), year2: calculateTeamCosts('year2'), year3: calculateTeamCosts('year3') },
      { category: 'Admin Costs', year1: calculateAdminCosts('year1'), year2: calculateAdminCosts('year2'), year3: calculateAdminCosts('year3') },
      { category: 'Marketing', year1: calculateMarketingCosts('year1'), year2: calculateMarketingCosts('year2'), year3: calculateMarketingCosts('year3') }
    ];

    return {
      companyName: 'EduLearn Platform',
      industry: 'Technology & Education',
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

  // Valuation calculations
  const calculateValuation = () => {
    const year3Revenue = calculateTotalRevenue('year3');
    const year3EBITDA = calculateEBITDA('year3');
    
    const revenueMultiple = year3Revenue * 4.2;
    const ebitdaMultiple = year3EBITDA * 12;
    const terminalValue = calculateNetProfit('year3') * 18;
    const dcfValue = terminalValue / Math.pow(1.12, 3);
    
    return {
      revenue: revenueMultiple,
      ebitda: ebitdaMultiple,
      dcf: dcfValue,
      average: (revenueMultiple + ebitdaMultiple + dcfValue) / 3
    };
  };

  const valuation = calculateValuation();

  // Enhanced chart data with better formatting
  const revenueData = [
    { 
      year: 'Year 1', 
      revenue: calculateTotalRevenue('year1'), 
      costs: calculateTotalCosts('year1'), 
      profit: calculateNetProfit('year1'),
      ebitda: calculateEBITDA('year1')
    },
    { 
      year: 'Year 2', 
      revenue: calculateTotalRevenue('year2'), 
      costs: calculateTotalCosts('year2'), 
      profit: calculateNetProfit('year2'),
      ebitda: calculateEBITDA('year2')
    },
    { 
      year: 'Year 3', 
      revenue: calculateTotalRevenue('year3'), 
      costs: calculateTotalCosts('year3'), 
      profit: calculateNetProfit('year3'),
      ebitda: calculateEBITDA('year3')
    }
  ];

  const valuationData = [
    { method: 'Revenue\nMultiple', value: valuation.revenue, color: '#3b82f6' },
    { method: 'EBITDA\nMultiple', value: valuation.ebitda, color: '#10b981' },
    { method: 'DCF\nAnalysis', value: valuation.dcf, color: '#8b5cf6' }
  ];

  const revenueBreakdown = reportData.revenueStreams.map((stream, index) => ({
    name: stream.name.length > 20 ? stream.name.substring(0, 17) + '...' : stream.name,
    year1: stream.year1,
    year2: stream.year2,
    year3: stream.year3,
    fill: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4]
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatLargeCurrency = (value: number) => {
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
      allowTaint: true,
      backgroundColor: '#ffffff'
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

  // Calculate growth rates and trends
  const revenueGrowth = ((calculateTotalRevenue('year3') - calculateTotalRevenue('year1')) / calculateTotalRevenue('year1') * 100);
  const ebitdaGrowth = calculateEBITDA('year1') > 0 ? ((calculateEBITDA('year3') - calculateEBITDA('year1')) / calculateEBITDA('year1') * 100) : 0;

  return (
    <div className="font-inter bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header with Export Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-playfair font-bold text-slate-800 mb-2">Financial Report</h1>
            <p className="text-lg text-slate-600">Comprehensive financial analysis and valuation assessment</p>
          </div>
          <Button onClick={exportToPDF} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 font-medium">
            <Download className="h-5 w-5" />
            Export PDF Report
          </Button>
        </div>

        <div id="financial-report" className="space-y-8 bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Professional Header */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-20"></div>
            <div className="relative z-10">
              <div className="inline-block p-4 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm">
                <Award className="h-12 w-12 text-white mx-auto" />
              </div>
              <h1 className="text-5xl font-playfair font-bold mb-4">{reportData.companyName}</h1>
              <h2 className="text-2xl font-light mb-6 text-blue-100">Financial Valuation & Analysis Report</h2>
              <div className="flex justify-center items-center gap-6 text-lg">
                <span className="px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">
                  Industry: {reportData.industry}
                </span>
                <span className="px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">
                  {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Executive Summary Dashboard */}
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-playfair font-bold text-slate-800 mb-3">Executive Summary</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-blue-700 mb-1">{formatCurrency(valuation.average)}</div>
                  <div className="text-sm font-medium text-blue-600">Enterprise Valuation</div>
                  <div className="text-xs text-slate-500 mt-1">Average of 3 methods</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-green-700 mb-1">{formatCurrency(calculateTotalRevenue('year3'))}</div>
                  <div className="text-sm font-medium text-green-600">Year 3 Revenue</div>
                  <div className="text-xs text-green-500 mt-1 flex items-center justify-center gap-1">
                    <ArrowUp className="h-3 w-3" />
                    {revenueGrowth.toFixed(0)}% growth
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-purple-700 mb-1">{formatCurrency(calculateEBITDA('year3'))}</div>
                  <div className="text-sm font-medium text-purple-600">Year 3 EBITDA</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {((calculateEBITDA('year3') / calculateTotalRevenue('year3')) * 100).toFixed(1)}% margin
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-amber-700 mb-1">{formatCurrency(calculateNetProfit('year3'))}</div>
                  <div className="text-sm font-medium text-amber-600">Year 3 Net Profit</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {((calculateNetProfit('year3') / calculateTotalRevenue('year3')) * 100).toFixed(1)}% margin
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Insights */}
            <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Key Financial Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-2">Growth Trajectory</h4>
                    <p className="text-slate-600 leading-relaxed">
                      {reportData.companyName} exhibits robust growth with projected Year 3 revenues of {formatLargeCurrency(calculateTotalRevenue('year3'))}, 
                      representing a {revenueGrowth.toFixed(0)}% increase from Year 1. The company maintains healthy profitability 
                      with an EBITDA margin of {((calculateEBITDA('year3') / calculateTotalRevenue('year3')) * 100).toFixed(1)}%.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-2">Valuation Assessment</h4>
                    <p className="text-slate-600 leading-relaxed">
                      Multiple valuation methodologies converge on an enterprise value of {formatLargeCurrency(valuation.average)}, 
                      indicating strong market positioning within the {reportData.industry.toLowerCase()} sector. 
                      The DCF analysis supports sustainable long-term value creation.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Performance Charts */}
          <div className="p-8 bg-gradient-to-br from-gray-50 to-white">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-playfair font-bold text-slate-800 mb-3">Financial Performance Analysis</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Revenue vs Costs Analysis */}
              <Card className="shadow-xl border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5" />
                    Revenue & Profitability Trends
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ChartContainer 
                    config={{
                      revenue: { label: "Revenue", color: "#3b82f6" },
                      costs: { label: "Total Costs", color: "#ef4444" },
                      ebitda: { label: "EBITDA", color: "#10b981" },
                      profit: { label: "Net Profit", color: "#8b5cf6" }
                    }} 
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} tickFormatter={formatCurrency} />
                        <Tooltip 
                          formatter={(value: number) => [formatLargeCurrency(value), '']}
                          labelStyle={{ color: '#1e293b' }}
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                        />
                        <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="costs" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        <Line type="monotone" dataKey="ebitda" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} />
                        <Line type="monotone" dataKey="profit" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 6 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Revenue Breakdown */}
              <Card className="shadow-xl border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <PieChart className="h-5 w-5" />
                    Revenue Stream Distribution (Year 3)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ChartContainer 
                    config={{
                      revenue: { label: "Revenue", color: "#3b82f6" }
                    }} 
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Tooltip 
                          formatter={(value: number) => [formatLargeCurrency(value), 'Revenue']}
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                        />
                        <Pie
                          data={revenueBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="year3"
                          fontSize={11}
                        >
                          {revenueBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Valuation Analysis */}
            <Card className="shadow-xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Target className="h-6 w-6" />
                  Enterprise Valuation Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Chart */}
                  <div>
                    <ChartContainer 
                      config={{
                        value: { label: "Valuation", color: "#3b82f6" }
                      }} 
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={valuationData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="method" 
                            stroke="#64748b" 
                            fontSize={11}
                            interval={0}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis stroke="#64748b" fontSize={12} tickFormatter={formatCurrency} />
                          <Tooltip 
                            formatter={(value: number) => [formatLargeCurrency(value), 'Valuation']}
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                          />
                          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                            {valuationData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>

                  {/* Valuation Summary */}
                  <div className="space-y-6">
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <div className="text-3xl font-bold text-blue-700 mb-2">{formatLargeCurrency(valuation.average)}</div>
                      <div className="text-sm font-medium text-blue-600">Weighted Average Valuation</div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                        <div>
                          <div className="font-semibold text-blue-800">Revenue Multiple</div>
                          <div className="text-sm text-blue-600">4.2x Year 3 Revenue</div>
                        </div>
                        <div className="text-xl font-bold text-blue-700">{formatCurrency(valuation.revenue)}</div>
                      </div>

                      <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                        <div>
                          <div className="font-semibold text-green-800">EBITDA Multiple</div>
                          <div className="text-sm text-green-600">12.0x Year 3 EBITDA</div>
                        </div>
                        <div className="text-xl font-bold text-green-700">{formatCurrency(valuation.ebitda)}</div>
                      </div>

                      <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                        <div>
                          <div className="font-semibold text-purple-800">DCF Analysis</div>
                          <div className="text-sm text-purple-600">12% Discount Rate</div>
                        </div>
                        <div className="text-xl font-bold text-purple-700">{formatCurrency(valuation.dcf)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Financial Table */}
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-playfair font-bold text-slate-800 mb-3">Detailed Financial Metrics</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full"></div>
            </div>

            <Card className="shadow-xl border-0 overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                      <tr>
                        <th className="text-left p-4 font-semibold">Financial Metric</th>
                        <th className="text-right p-4 font-semibold">Year 1</th>
                        <th className="text-right p-4 font-semibold">Year 2</th>
                        <th className="text-right p-4 font-semibold">Year 3</th>
                        <th className="text-right p-4 font-semibold">3-Year Growth</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-200 hover:bg-blue-50 transition-colors">
                        <td className="p-4 font-semibold text-slate-800">Total Revenue</td>
                        <td className="text-right p-4 text-slate-700">{formatLargeCurrency(calculateTotalRevenue('year1'))}</td>
                        <td className="text-right p-4 text-slate-700">{formatLargeCurrency(calculateTotalRevenue('year2'))}</td>
                        <td className="text-right p-4 text-slate-700">{formatLargeCurrency(calculateTotalRevenue('year3'))}</td>
                        <td className="text-right p-4">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            <ArrowUp className="h-3 w-3" />
                            {revenueGrowth.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200 hover:bg-blue-50 transition-colors">
                        <td className="p-4 font-semibold text-slate-800">EBITDA</td>
                        <td className="text-right p-4 text-slate-700">{formatLargeCurrency(calculateEBITDA('year1'))}</td>
                        <td className="text-right p-4 text-slate-700">{formatLargeCurrency(calculateEBITDA('year2'))}</td>
                        <td className="text-right p-4 text-slate-700">{formatLargeCurrency(calculateEBITDA('year3'))}</td>
                        <td className="text-right p-4">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            <ArrowUp className="h-3 w-3" />
                            {ebitdaGrowth.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200 hover:bg-blue-50 transition-colors">
                        <td className="p-4 font-semibold text-slate-800">Net Profit</td>
                        <td className="text-right p-4 text-slate-700">{formatLargeCurrency(calculateNetProfit('year1'))}</td>
                        <td className="text-right p-4 text-slate-700">{formatLargeCurrency(calculateNetProfit('year2'))}</td>
                        <td className="text-right p-4 text-slate-700">{formatLargeCurrency(calculateNetProfit('year3'))}</td>
                        <td className="text-right p-4">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            <ArrowUp className="h-3 w-3" />
                            {calculateNetProfit('year1') > 0 ? (((calculateNetProfit('year3') - calculateNetProfit('year1')) / calculateNetProfit('year1')) * 100).toFixed(1) : 'N/A'}%
                          </span>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200 hover:bg-blue-50 transition-colors">
                        <td className="p-4 font-semibold text-slate-800">EBITDA Margin</td>
                        <td className="text-right p-4 text-slate-700">{((calculateEBITDA('year1') / calculateTotalRevenue('year1')) * 100).toFixed(1)}%</td>
                        <td className="text-right p-4 text-slate-700">{((calculateEBITDA('year2') / calculateTotalRevenue('year2')) * 100).toFixed(1)}%</td>
                        <td className="text-right p-4 text-slate-700">{((calculateEBITDA('year3') / calculateTotalRevenue('year3')) * 100).toFixed(1)}%</td>
                        <td className="text-right p-4">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            {(((calculateEBITDA('year3') / calculateTotalRevenue('year3')) - (calculateEBITDA('year1') / calculateTotalRevenue('year1'))) * 100).toFixed(1)}pp
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="p-4 font-semibold text-slate-800">Net Margin</td>
                        <td className="text-right p-4 text-slate-700">{((calculateNetProfit('year1') / calculateTotalRevenue('year1')) * 100).toFixed(1)}%</td>
                        <td className="text-right p-4 text-slate-700">{((calculateNetProfit('year2') / calculateTotalRevenue('year2')) * 100).toFixed(1)}%</td>
                        <td className="text-right p-4 text-slate-700">{((calculateNetProfit('year3') / calculateTotalRevenue('year3')) * 100).toFixed(1)}%</td>
                        <td className="text-right p-4">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            {(((calculateNetProfit('year3') / calculateTotalRevenue('year3')) - (calculateNetProfit('year1') / calculateTotalRevenue('year1'))) * 100).toFixed(1)}pp
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Assessment */}
          <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-playfair font-bold text-slate-800 mb-3">Strategic Assessment</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-orange-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="shadow-xl border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-red-500 to-pink-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Risk Factors & Mitigation
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                      <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-red-800 mb-1">Market Competition</div>
                        <div className="text-sm text-red-700">Intensifying competitive landscape may pressure pricing and market share</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-orange-800 mb-1">Revenue Concentration</div>
                        <div className="text-sm text-orange-700">Heavy reliance on subscription model requires consistent customer retention</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-yellow-800 mb-1">Operational Leverage</div>
                        <div className="text-sm text-yellow-700">High fixed costs create sensitivity to revenue fluctuations</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <AlertTriangle className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-purple-800 mb-1">Technology Disruption</div>
                        <div className="text-sm text-purple-700">Rapid technological changes require continuous innovation investment</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Growth Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-green-800 mb-1">Strong Growth Trajectory</div>
                        <div className="text-sm text-green-700">Consistent {revenueGrowth.toFixed(0)}% revenue growth demonstrates market demand validation</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-blue-800 mb-1">Operational Efficiency</div>
                        <div className="text-sm text-blue-700">Improving margins indicate successful cost optimization and economies of scale</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                      <CheckCircle className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-indigo-800 mb-1">Market Expansion</div>
                        <div className="text-sm text-indigo-700">Untapped international markets present significant scaling opportunities</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 bg-teal-50 rounded-lg border border-teal-200">
                      <CheckCircle className="h-5 w-5 text-teal-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-teal-800 mb-1">Innovation Pipeline</div>
                        <div className="text-sm text-teal-700">Strong R&D capabilities enable competitive moat and premium positioning</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-8 text-center">
            <div className="flex justify-center items-center gap-4 mb-4">
              <Award className="h-6 w-6 text-blue-400" />
              <span className="text-lg font-semibold">Professional Financial Analysis</span>
              <Award className="h-6 w-6 text-blue-400" />
            </div>
            <div className="text-slate-300 text-sm space-y-1">
              <p>Report generated on {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p>This report is for investment analysis purposes only and does not constitute financial advice</p>
              <p>All financial figures are presented in USD • Analysis based on projected financial statements</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;