import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialData } from "@/pages/Index";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Target, DollarSign, Percent, Calendar, Brain, Loader2 } from 'lucide-react';
import { formatCurrency, formatPercentage, formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface AnalysisProps {
  data: FinancialData;
}

const Analysis: React.FC<AnalysisProps> = ({ data }) => {
  const [aiInsights, setAiInsights] = useState<string>('');
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  
  const getAIInsights = async () => {
    setIsLoadingInsights(true);
    try {
      const { data: response, error } = await supabase.functions.invoke('analyze-financial-data', {
        body: { financialData: data }
      });
      
      if (error) throw error;
      setAiInsights(response.insights);
    } catch (error) {
      console.error('Error getting AI insights:', error);
      setAiInsights('Unable to generate AI insights. Please check your API key configuration.');
    } finally {
      setIsLoadingInsights(false);
    }
  };

  // Financial calculations
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
    const employeeCosts = data.costs.team.employees?.reduce((sum, emp) => sum + emp.salary, 0) || 0;
    const consultantCosts = data.costs.team.consultants?.reduce((sum, cons) => sum + (cons.monthlyCost * 12), 0) || 0;
    const benefitsCosts = ((employeeCosts + consultantCosts) * (data.costs.team.healthCare.percentage + data.costs.team.benefits.percentage) / 100);
    const teamCosts = employeeCosts + consultantCosts + benefitsCosts + (data.costs.team.recruitment[year] || 0);
    
    const adminCosts = (data.costs.admin.rent[year] || 0) + 
                      (data.costs.admin.travel[year] || 0) + 
                      (data.costs.admin.insurance[year] || 0) + 
                      (data.costs.admin.legal[year] || 0) + 
                      (data.costs.admin.accounting[year] || 0) + 
                      (data.costs.admin.software[year] || 0) + 
                      (data.costs.admin.other[year] || 0);
    
    const marketingCosts = data.costs.marketing.isPercentageOfRevenue 
      ? calculateTotalRevenue(year) * (data.costs.marketing.percentageOfRevenue / 100)
      : data.costs.marketing.manualBudget[year];
    
    return teamCosts + adminCosts + marketingCosts;
  };

  const calculateEBITDA = (year: 'year1' | 'year2' | 'year3') => {
    return calculateGrossProfit(year) - calculateOperationalExpenses(year);
  };

  const calculateNetProfit = (year: 'year1' | 'year2' | 'year3') => {
    const ebitda = calculateEBITDA(year);
    const interestExpense = data.loansAndFinancing?.totalInterestExpense?.[year] || 0;
    const taxationData = data.taxation || { incomeTax: { enabled: false }, zakat: { enabled: false } };
    
    let taxes = 0;
    if (taxationData.incomeTax.enabled) {
      const profitBeforeTax = ebitda - interestExpense;
      taxes += profitBeforeTax > 0 ? profitBeforeTax * (taxationData.incomeTax.corporateRate / 100) : 0;
    }
    if (taxationData.zakat.enabled) {
      taxes += calculateTotalRevenue(year) * (taxationData.zakat.rate / 100);
    }
    
    return ebitda - interestExpense - taxes;
  };

  // Financial Ratios
  const calculateRatios = () => {
    const ratios = {
      profitability: {
        grossMargin: {
          year1: calculateTotalRevenue('year1') > 0 ? (calculateGrossProfit('year1') / calculateTotalRevenue('year1')) * 100 : 0,
          year2: calculateTotalRevenue('year2') > 0 ? (calculateGrossProfit('year2') / calculateTotalRevenue('year2')) * 100 : 0,
          year3: calculateTotalRevenue('year3') > 0 ? (calculateGrossProfit('year3') / calculateTotalRevenue('year3')) * 100 : 0,
        },
        ebitdaMargin: {
          year1: calculateTotalRevenue('year1') > 0 ? (calculateEBITDA('year1') / calculateTotalRevenue('year1')) * 100 : 0,
          year2: calculateTotalRevenue('year2') > 0 ? (calculateEBITDA('year2') / calculateTotalRevenue('year2')) * 100 : 0,
          year3: calculateTotalRevenue('year3') > 0 ? (calculateEBITDA('year3') / calculateTotalRevenue('year3')) * 100 : 0,
        },
        netMargin: {
          year1: calculateTotalRevenue('year1') > 0 ? (calculateNetProfit('year1') / calculateTotalRevenue('year1')) * 100 : 0,
          year2: calculateTotalRevenue('year2') > 0 ? (calculateNetProfit('year2') / calculateTotalRevenue('year2')) * 100 : 0,
          year3: calculateTotalRevenue('year3') > 0 ? (calculateNetProfit('year3') / calculateTotalRevenue('year3')) * 100 : 0,
        }
      },
      growth: {
        revenueGrowth: {
          year2: calculateTotalRevenue('year1') > 0 ? ((calculateTotalRevenue('year2') - calculateTotalRevenue('year1')) / calculateTotalRevenue('year1')) * 100 : 0,
          year3: calculateTotalRevenue('year2') > 0 ? ((calculateTotalRevenue('year3') - calculateTotalRevenue('year2')) / calculateTotalRevenue('year2')) * 100 : 0,
        },
        profitGrowth: {
          year2: calculateNetProfit('year1') !== 0 ? ((calculateNetProfit('year2') - calculateNetProfit('year1')) / Math.abs(calculateNetProfit('year1'))) * 100 : 0,
          year3: calculateNetProfit('year2') !== 0 ? ((calculateNetProfit('year3') - calculateNetProfit('year2')) / Math.abs(calculateNetProfit('year2'))) * 100 : 0,
        }
      },
      efficiency: {
        costToRevenue: {
          year1: calculateTotalRevenue('year1') > 0 ? (calculateOperationalExpenses('year1') / calculateTotalRevenue('year1')) * 100 : 0,
          year2: calculateTotalRevenue('year2') > 0 ? (calculateOperationalExpenses('year2') / calculateTotalRevenue('year2')) * 100 : 0,
          year3: calculateTotalRevenue('year3') > 0 ? (calculateOperationalExpenses('year3') / calculateTotalRevenue('year3')) * 100 : 0,
        }
      }
    };
    
    return ratios;
  };

  const ratios = calculateRatios();

  // Chart data preparation
  const performanceData = [1, 2, 3].map(year => {
    const yearKey = `year${year}` as 'year1' | 'year2' | 'year3';
    return {
      year: `Year ${year}`,
      revenue: calculateTotalRevenue(yearKey),
      grossProfit: calculateGrossProfit(yearKey),
      ebitda: calculateEBITDA(yearKey),
      netProfit: calculateNetProfit(yearKey),
      grossMargin: ratios.profitability.grossMargin[yearKey],
      ebitdaMargin: ratios.profitability.ebitdaMargin[yearKey],
      netMargin: ratios.profitability.netMargin[yearKey]
    };
  });

  const ratioTrendData = [
    { metric: 'Gross Margin', year1: ratios.profitability.grossMargin.year1, year2: ratios.profitability.grossMargin.year2, year3: ratios.profitability.grossMargin.year3 },
    { metric: 'EBITDA Margin', year1: ratios.profitability.ebitdaMargin.year1, year2: ratios.profitability.ebitdaMargin.year2, year3: ratios.profitability.ebitdaMargin.year3 },
    { metric: 'Net Margin', year1: ratios.profitability.netMargin.year1, year2: ratios.profitability.netMargin.year2, year3: ratios.profitability.netMargin.year3 }
  ];

  const businessHealthData = [
    { subject: 'Profitability', A: Math.min(ratios.profitability.netMargin.year3 / 10, 10), fullMark: 10 },
    { subject: 'Growth', A: Math.min(ratios.growth.revenueGrowth.year3 / 10, 10), fullMark: 10 },
    { subject: 'Efficiency', A: Math.min((100 - ratios.efficiency.costToRevenue.year3) / 10, 10), fullMark: 10 },
    { subject: 'Revenue Size', A: Math.min(calculateTotalRevenue('year3') / 100000, 10), fullMark: 10 },
    { subject: 'Margin Stability', A: Math.min(Math.abs(ratios.profitability.grossMargin.year3 - ratios.profitability.grossMargin.year1) < 5 ? 8 : 4, 10), fullMark: 10 }
  ];

  // Performance insights
  const generateInsights = () => {
    const insights = [];
    
    // Profitability insights
    if (ratios.profitability.netMargin.year3 > 15) {
      insights.push({ type: 'positive', text: 'Excellent net profit margin above 15%, indicating strong profitability.' });
    } else if (ratios.profitability.netMargin.year3 > 5) {
      insights.push({ type: 'neutral', text: 'Moderate net profit margin. Consider optimizing costs for better profitability.' });
    } else if (ratios.profitability.netMargin.year3 < 0) {
      insights.push({ type: 'negative', text: 'Negative net margin indicates losses. Urgent cost optimization needed.' });
    }

    // Growth insights
    if (ratios.growth.revenueGrowth.year3 > 50) {
      insights.push({ type: 'positive', text: 'Exceptional revenue growth rate indicates strong market demand.' });
    } else if (ratios.growth.revenueGrowth.year3 > 20) {
      insights.push({ type: 'positive', text: 'Healthy revenue growth rate shows business expansion.' });
    } else if (ratios.growth.revenueGrowth.year3 < 10) {
      insights.push({ type: 'warning', text: 'Low revenue growth. Consider new market opportunities or product development.' });
    }

    // Efficiency insights
    if (ratios.efficiency.costToRevenue.year3 < 60) {
      insights.push({ type: 'positive', text: 'Efficient cost structure with operational costs below 60% of revenue.' });
    } else if (ratios.efficiency.costToRevenue.year3 > 80) {
      insights.push({ type: 'negative', text: 'High operational costs consuming over 80% of revenue. Cost reduction needed.' });
    }

    return insights;
  };

  const insights = generateInsights();
  const keyMetrics = [
    {
      title: 'Revenue CAGR',
      value: Math.pow(calculateTotalRevenue('year3') / calculateTotalRevenue('year1'), 1/2) - 1,
      format: 'percentage',
      icon: TrendingUp,
      color: 'text-blue-600'
    },
    {
      title: 'Avg Net Margin',
      value: (ratios.profitability.netMargin.year1 + ratios.profitability.netMargin.year2 + ratios.profitability.netMargin.year3) / 3,
      format: 'percentage',
      icon: Percent,
      color: 'text-green-600'
    },
    {
      title: 'Break-even Point',
      value: calculateNetProfit('year1') > 0 ? 1 : calculateNetProfit('year2') > 0 ? 2 : calculateNetProfit('year3') > 0 ? 3 : 4,
      format: 'year',
      icon: Calendar,
      color: 'text-purple-600'
    },
    {
      title: 'Total 3-Year Profit',
      value: calculateNetProfit('year1') + calculateNetProfit('year2') + calculateNetProfit('year3'),
      format: 'currency',
      icon: DollarSign,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Key Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Key Performance Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {keyMetrics.map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-center mb-2">
                    <IconComponent className={`h-6 w-6 ${metric.color}`} />
                  </div>
                  <div className={`text-2xl font-bold ${metric.color}`}>
                    {metric.format === 'percentage' 
                      ? formatPercentage(metric.value * 100)
                      : metric.format === 'currency'
                      ? formatCurrency(metric.value)
                      : metric.format === 'year'
                      ? metric.value <= 3 ? `Year ${metric.value}` : 'Beyond Y3'
                      : formatNumber(metric.value)
                    }
                  </div>
                  <div className="text-sm text-gray-600">{metric.title}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Business Health Radar */}
      <Card>
        <CardHeader>
          <CardTitle>Business Health Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={businessHealthData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={90} domain={[0, 10]} />
                <Radar name="Business Health" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Financial Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#e2e8f0" fill="#e2e8f0" name="Revenue" />
                <Area type="monotone" dataKey="grossProfit" stackId="2" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} name="Gross Profit" />
                <Area type="monotone" dataKey="ebitda" stackId="3" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="EBITDA" />
                <Line type="monotone" dataKey="netProfit" stroke="#8b5cf6" strokeWidth={3} name="Net Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Profitability Ratios Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Profitability Ratios Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip formatter={(value: number) => [formatPercentage(value), '']} />
                <Line type="monotone" dataKey="grossMargin" stroke="#22c55e" strokeWidth={3} name="Gross Margin" />
                <Line type="monotone" dataKey="ebitdaMargin" stroke="#3b82f6" strokeWidth={3} name="EBITDA Margin" />
                <Line type="monotone" dataKey="netMargin" stroke="#8b5cf6" strokeWidth={3} name="Net Margin" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Financial Ratios Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Ratios Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Profitability Ratios</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Gross Margin (Y3):</span>
                  <span className="font-medium">{formatPercentage(ratios.profitability.grossMargin.year3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>EBITDA Margin (Y3):</span>
                  <span className="font-medium">{formatPercentage(ratios.profitability.ebitdaMargin.year3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Net Margin (Y3):</span>
                  <span className="font-medium">{formatPercentage(ratios.profitability.netMargin.year3)}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Growth Ratios</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Revenue Growth (Y2):</span>
                  <span className="font-medium">{formatPercentage(ratios.growth.revenueGrowth.year2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Revenue Growth (Y3):</span>
                  <span className="font-medium">{formatPercentage(ratios.growth.revenueGrowth.year3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Profit Growth (Y3):</span>
                  <span className="font-medium">{formatPercentage(ratios.growth.profitGrowth.year3)}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Efficiency Ratios</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>OpEx to Revenue (Y3):</span>
                  <span className="font-medium">{formatPercentage(ratios.efficiency.costToRevenue.year3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Revenue per Employee:</span>
                  <span className="font-medium">{formatCurrency(calculateTotalRevenue('year3') / (data.costs.team.employees?.length || 1))}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Business Performance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const getIcon = () => {
                switch (insight.type) {
                  case 'positive': return <CheckCircle className="h-5 w-5 text-green-600" />;
                  case 'negative': return <AlertCircle className="h-5 w-5 text-red-600" />;
                  case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
                  default: return <AlertCircle className="h-5 w-5 text-blue-600" />;
                }
              };

              const getBgColor = () => {
                switch (insight.type) {
                  case 'positive': return 'bg-green-50 border-green-200';
                  case 'negative': return 'bg-red-50 border-red-200';
                  case 'warning': return 'bg-yellow-50 border-yellow-200';
                  default: return 'bg-blue-50 border-blue-200';
                }
              };

              return (
                <div key={index} className={`p-4 rounded-lg border ${getBgColor()}`}>
                  <div className="flex items-start gap-3">
                    {getIcon()}
                    <p className="text-sm">{insight.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI-Powered Insights */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" />
                AI-Powered Financial Analysis
              </h4>
              <Button 
                onClick={getAIInsights} 
                disabled={isLoadingInsights}
                variant="outline" 
                size="sm"
              >
                {isLoadingInsights ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Get AI Insights'
                )}
              </Button>
            </div>
            {aiInsights && (
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="text-sm whitespace-pre-line">{aiInsights}</div>
              </div>
            )}
            {!aiInsights && !isLoadingInsights && (
              <p className="text-sm text-gray-600">Click "Get AI Insights" to receive advanced analysis and strategic recommendations powered by ChatGPT.</p>
            )}
          </div>

          <div className="mt-6 space-y-4">
            <h4 className="font-semibold text-lg">Strategic Recommendations</h4>
            <div className="space-y-3">
              {calculateNetProfit('year3') < 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm">📊 Focus on achieving profitability by optimizing operational costs and improving revenue streams.</p>
                </div>
              )}
              {ratios.growth.revenueGrowth.year3 < 20 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm">🚀 Consider expanding market reach or developing new products to accelerate revenue growth.</p>
                </div>
              )}
              {ratios.profitability.grossMargin.year3 > 60 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm">💡 Strong gross margins indicate good pricing power. Consider scaling operations to maximize this advantage.</p>
                </div>
              )}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm">📈 Monitor key metrics regularly and adjust strategies based on performance trends and market conditions.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analysis;