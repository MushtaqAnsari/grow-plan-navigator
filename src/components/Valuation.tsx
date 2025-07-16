import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BarChart3, Calculator, Target } from "lucide-react";
import { FinancialData } from "@/pages/Index";

interface ValuationProps {
  financialData: FinancialData;
}

interface ValuationInputs {
  ebitdaMultiples: {
    low: number;
    high: number;
  };
  revenueMultiples: {
    low: number;
    high: number;
  };
  dcf: {
    discountRate: number;
    terminalGrowthRate: number;
    years: number;
  };
}

const Valuation: React.FC<ValuationProps> = ({ financialData }) => {
  const [inputs, setInputs] = useState<ValuationInputs>({
    ebitdaMultiples: { low: 12, high: 18 }, // Adjusted for EdTech SaaS
    revenueMultiples: { low: 5.5, high: 7.5 }, // Adjusted for $15M target on $2.4M revenue
    dcf: { discountRate: 12, terminalGrowthRate: 3, years: 5 }
  });

  // Calculate financial metrics
  const financialMetrics = useMemo(() => {
    const totalRevenue = {
      year1: financialData.revenueStreams.reduce((sum, stream) => sum + stream.year1, 0),
      year2: financialData.revenueStreams.reduce((sum, stream) => sum + stream.year2, 0),
      year3: financialData.revenueStreams.reduce((sum, stream) => sum + stream.year3, 0)
    };

    // Calculate total costs for EBITDA calculation
    const totalCosts = {
      year1: 0,
      year2: 0,
      year3: 0
    };

    // Add direct costs
    Object.values(financialData.costs.revenueStreamCosts).forEach(streamCosts => {
      ['year1', 'year2', 'year3'].forEach(year => {
        totalCosts[year as keyof typeof totalCosts] += 
          streamCosts.directCosts.cogs[year as keyof typeof streamCosts.directCosts.cogs] +
          streamCosts.directCosts.processing[year as keyof typeof streamCosts.directCosts.processing] +
          streamCosts.directCosts.fulfillment[year as keyof typeof streamCosts.directCosts.fulfillment];
      });
    });

    // Add employee costs
    const totalEmployeeCosts = financialData.costs.team.employees.reduce((sum, emp) => sum + emp.salary, 0);
    const totalConsultantCosts = financialData.costs.team.consultants.reduce((sum, cons) => sum + (cons.monthlyCost * 12), 0);
    
    ['year1', 'year2', 'year3'].forEach(year => {
      const yearKey = year as 'year1' | 'year2' | 'year3';
      totalCosts[yearKey] += totalEmployeeCosts + totalConsultantCosts;
      totalCosts[yearKey] += financialData.costs.admin.rent[yearKey];
      totalCosts[yearKey] += financialData.costs.admin.travel[yearKey];
      totalCosts[yearKey] += financialData.costs.admin.insurance[yearKey];
      totalCosts[yearKey] += financialData.costs.admin.legal[yearKey];
      totalCosts[yearKey] += financialData.costs.admin.accounting[yearKey];
      totalCosts[yearKey] += financialData.costs.admin.software[yearKey];
      totalCosts[yearKey] += financialData.costs.admin.other[yearKey];
    });

    // Calculate EBITDA (excluding interest, taxes, depreciation, amortization)
    const ebitda = {
      year1: totalRevenue.year1 - totalCosts.year1,
      year2: totalRevenue.year2 - totalCosts.year2,
      year3: totalRevenue.year3 - totalCosts.year3
    };

    // Use latest year (Year 3) for valuation
    const latestRevenue = totalRevenue.year3;
    const latestEbitda = ebitda.year3;

    return {
      totalRevenue,
      ebitda,
      latestRevenue,
      latestEbitda
    };
  }, [financialData]);

  // Calculate valuations
  const valuations = useMemo(() => {
    const { latestRevenue, latestEbitda } = financialMetrics;

    // Revenue Multiple Valuation
    const revenueValuation = {
      low: latestRevenue * inputs.revenueMultiples.low,
      high: latestRevenue * inputs.revenueMultiples.high
    };

    // EBITDA Multiple Valuation
    const ebitdaValuation = {
      low: latestEbitda * inputs.ebitdaMultiples.low,
      high: latestEbitda * inputs.ebitdaMultiples.high
    };

    // DCF Calculation (simplified)
    const projectedCashFlows = [];
    const growthRate = 0.25; // 25% growth assumption
    let currentCashFlow = latestEbitda;

    for (let i = 1; i <= inputs.dcf.years; i++) {
      currentCashFlow = currentCashFlow * (1 + growthRate / Math.pow(1.2, i)); // Decreasing growth
      const presentValue = currentCashFlow / Math.pow(1 + inputs.dcf.discountRate / 100, i);
      projectedCashFlows.push(presentValue);
    }

    const terminalValue = (currentCashFlow * (1 + inputs.dcf.terminalGrowthRate / 100)) / 
                         (inputs.dcf.discountRate / 100 - inputs.dcf.terminalGrowthRate / 100);
    const terminalPV = terminalValue / Math.pow(1 + inputs.dcf.discountRate / 100, inputs.dcf.years);
    
    const dcfValuation = projectedCashFlows.reduce((sum, cf) => sum + cf, 0) + terminalPV;

    return {
      revenue: revenueValuation,
      ebitda: ebitdaValuation,
      dcf: dcfValuation
    };
  }, [inputs, financialMetrics]);

  // Football Field Analysis
  const footballField = useMemo(() => {
    const methods = [
      { name: 'Revenue Multiple', low: valuations.revenue.low, high: valuations.revenue.high },
      { name: 'EBITDA Multiple', low: valuations.ebitda.low, high: valuations.ebitda.high },
      { name: 'DCF', low: valuations.dcf * 0.85, high: valuations.dcf * 1.15 }
    ];

    const overallLow = Math.min(...methods.map(m => m.low));
    const overallHigh = Math.max(...methods.map(m => m.high));
    const midpoint = (overallLow + overallHigh) / 2;

    return { methods, overallLow, overallHigh, midpoint };
  }, [valuations]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenue Multiple
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="revenue-low">Low Multiple</Label>
                <Input
                  id="revenue-low"
                  type="number"
                  value={inputs.revenueMultiples.low}
                  onChange={(e) => setInputs(prev => ({
                    ...prev,
                    revenueMultiples: { ...prev.revenueMultiples, low: Number(e.target.value) }
                  }))}
                  step="0.1"
                />
              </div>
              <div>
                <Label htmlFor="revenue-high">High Multiple</Label>
                <Input
                  id="revenue-high"
                  type="number"
                  value={inputs.revenueMultiples.high}
                  onChange={(e) => setInputs(prev => ({
                    ...prev,
                    revenueMultiples: { ...prev.revenueMultiples, high: Number(e.target.value) }
                  }))}
                  step="0.1"
                />
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="text-sm text-muted-foreground mb-2">
                Based on Year 3 Revenue: {formatNumber(financialMetrics.latestRevenue)}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Low Valuation:</span>
                  <Badge variant="outline">{formatCurrency(valuations.revenue.low)}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>High Valuation:</span>
                  <Badge variant="outline">{formatCurrency(valuations.revenue.high)}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              EBITDA Multiple
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ebitda-low">Low Multiple</Label>
                <Input
                  id="ebitda-low"
                  type="number"
                  value={inputs.ebitdaMultiples.low}
                  onChange={(e) => setInputs(prev => ({
                    ...prev,
                    ebitdaMultiples: { ...prev.ebitdaMultiples, low: Number(e.target.value) }
                  }))}
                  step="0.1"
                />
              </div>
              <div>
                <Label htmlFor="ebitda-high">High Multiple</Label>
                <Input
                  id="ebitda-high"
                  type="number"
                  value={inputs.ebitdaMultiples.high}
                  onChange={(e) => setInputs(prev => ({
                    ...prev,
                    ebitdaMultiples: { ...prev.ebitdaMultiples, high: Number(e.target.value) }
                  }))}
                  step="0.1"
                />
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="text-sm text-muted-foreground mb-2">
                Based on Year 3 EBITDA: {formatNumber(financialMetrics.latestEbitda)}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Low Valuation:</span>
                  <Badge variant="outline">{formatCurrency(valuations.ebitda.low)}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>High Valuation:</span>
                  <Badge variant="outline">{formatCurrency(valuations.ebitda.high)}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              DCF Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="discount-rate">Discount Rate (%)</Label>
              <Input
                id="discount-rate"
                type="number"
                value={inputs.dcf.discountRate}
                onChange={(e) => setInputs(prev => ({
                  ...prev,
                  dcf: { ...prev.dcf, discountRate: Number(e.target.value) }
                }))}
                step="0.1"
              />
            </div>
            <div>
              <Label htmlFor="terminal-growth">Terminal Growth Rate (%)</Label>
              <Input
                id="terminal-growth"
                type="number"
                value={inputs.dcf.terminalGrowthRate}
                onChange={(e) => setInputs(prev => ({
                  ...prev,
                  dcf: { ...prev.dcf, terminalGrowthRate: Number(e.target.value) }
                }))}
                step="0.1"
              />
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between text-sm">
                <span>DCF Valuation:</span>
                <Badge variant="default">{formatCurrency(valuations.dcf)}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Football Field Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Football Field Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-destructive">
                  {formatCurrency(footballField.overallLow)}
                </div>
                <div className="text-sm text-muted-foreground">Low Range</div>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(footballField.midpoint)}
                </div>
                <div className="text-sm text-muted-foreground">Midpoint</div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-success">
                  {formatCurrency(footballField.overallHigh)}
                </div>
                <div className="text-sm text-muted-foreground">High Range</div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Valuation Methods Comparison</h4>
              {footballField.methods.map((method, index) => {
                const range = method.high - method.low;
                const position = ((method.low - footballField.overallLow) / (footballField.overallHigh - footballField.overallLow)) * 100;
                const width = (range / (footballField.overallHigh - footballField.overallLow)) * 100;

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{method.name}</span>
                      <span className="text-muted-foreground">
                        {formatCurrency(method.low)} - {formatCurrency(method.high)}
                      </span>
                    </div>
                    <div className="relative h-8 bg-muted rounded">
                      <div
                        className="absolute h-full bg-primary rounded"
                        style={{
                          left: `${position}%`,
                          width: `${width}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-lg font-semibold">
                  {formatNumber((footballField.overallHigh - footballField.overallLow))}
                </div>
                <div className="text-sm text-muted-foreground">Valuation Range</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">
                  {(((footballField.overallHigh - footballField.overallLow) / footballField.midpoint) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Range as % of Midpoint</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">
                  {footballField.methods.length}
                </div>
                <div className="text-sm text-muted-foreground">Valuation Methods</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Valuation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Method</th>
                  <th className="text-right py-2">Low Valuation</th>
                  <th className="text-right py-2">High Valuation</th>
                  <th className="text-right py-2">Midpoint</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Revenue Multiple</td>
                  <td className="text-right py-2">{formatNumber(valuations.revenue.low)}</td>
                  <td className="text-right py-2">{formatNumber(valuations.revenue.high)}</td>
                  <td className="text-right py-2">{formatNumber((valuations.revenue.low + valuations.revenue.high) / 2)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">EBITDA Multiple</td>
                  <td className="text-right py-2">{formatNumber(valuations.ebitda.low)}</td>
                  <td className="text-right py-2">{formatNumber(valuations.ebitda.high)}</td>
                  <td className="text-right py-2">{formatNumber((valuations.ebitda.low + valuations.ebitda.high) / 2)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">DCF Analysis</td>
                  <td className="text-right py-2">{formatNumber(valuations.dcf * 0.85)}</td>
                  <td className="text-right py-2">{formatNumber(valuations.dcf * 1.15)}</td>
                  <td className="text-right py-2">{formatNumber(valuations.dcf)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Valuation;