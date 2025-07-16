import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialData } from "@/pages/Index";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface GrossProfitProps {
  data: FinancialData;
}

const GrossProfit: React.FC<GrossProfitProps> = ({ data }) => {
  const calculateGrossProfitByStream = (streamName: string, year: 'year1' | 'year2' | 'year3') => {
    const stream = data.revenueStreams.find(s => s.name === streamName);
    const streamRevenue = stream ? stream[year] : 0;
    
    const streamCosts = data.costs.revenueStreamCosts[streamName];
    const directCosts = streamCosts ? 
      Object.values(streamCosts.directCosts).reduce((sum, cost) => sum + cost[year], 0) : 0;
    
    return streamRevenue - directCosts;
  };

  const calculateGrossProfitMargin = (streamName: string, year: 'year1' | 'year2' | 'year3') => {
    const stream = data.revenueStreams.find(s => s.name === streamName);
    const streamRevenue = stream ? stream[year] : 0;
    const grossProfit = calculateGrossProfitByStream(streamName, year);
    
    return streamRevenue > 0 ? (grossProfit / streamRevenue) * 100 : 0;
  };

  const calculateTotalGrossProfit = (year: 'year1' | 'year2' | 'year3') => {
    return data.revenueStreams.reduce((sum, stream) => {
      return sum + calculateGrossProfitByStream(stream.name, year);
    }, 0);
  };

  const calculateTotalRevenue = (year: 'year1' | 'year2' | 'year3') => {
    return data.revenueStreams.reduce((sum, stream) => sum + stream[year], 0);
  };

  const calculateOverallGrossMargin = (year: 'year1' | 'year2' | 'year3') => {
    const totalRevenue = calculateTotalRevenue(year);
    const totalGrossProfit = calculateTotalGrossProfit(year);
    return totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;
  };

  // Prepare chart data
  const grossProfitChartData = [1, 2, 3].map(year => {
    const yearKey = `year${year}` as 'year1' | 'year2' | 'year3';
    return {
      year: `Year ${year}`,
      revenue: calculateTotalRevenue(yearKey),
      grossProfit: calculateTotalGrossProfit(yearKey),
      margin: calculateOverallGrossMargin(yearKey)
    };
  });

  const streamComparisonData = data.revenueStreams.map(stream => {
    return {
      name: stream.name,
      year1Margin: calculateGrossProfitMargin(stream.name, 'year1'),
      year2Margin: calculateGrossProfitMargin(stream.name, 'year2'),
      year3Margin: calculateGrossProfitMargin(stream.name, 'year3'),
      year1Profit: calculateGrossProfitByStream(stream.name, 'year1'),
      year2Profit: calculateGrossProfitByStream(stream.name, 'year2'),
      year3Profit: calculateGrossProfitByStream(stream.name, 'year3')
    };
  });

  return (
    <div className="space-y-6">
      {/* Overall Gross Profit Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(year => {
          const yearKey = `year${year}` as 'year1' | 'year2' | 'year3';
          const grossProfit = calculateTotalGrossProfit(yearKey);
          const revenue = calculateTotalRevenue(yearKey);
          const margin = calculateOverallGrossMargin(yearKey);
          
          return (
            <Card key={year} className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="text-lg">Year {year} Gross Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Revenue:</span>
                    <span className="font-medium">${revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Gross Profit:</span>
                    <span className="font-bold text-green-600">${grossProfit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Gross Margin:</span>
                    <span className="font-bold text-blue-600">{margin.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gross Profit Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Gross Profit Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={grossProfitChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                <Bar dataKey="revenue" fill="#e2e8f0" name="Revenue" />
                <Bar dataKey="grossProfit" fill="#22c55e" name="Gross Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gross Margin Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Gross Margin Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={grossProfitChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'Gross Margin']} />
                <Line 
                  type="monotone" 
                  dataKey="margin" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Stream Comparison */}
      {data.revenueStreams.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Gross Profit by Revenue Stream</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {streamComparisonData.map((stream) => (
                <div key={stream.name} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">{stream.name}</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(year => {
                      const profit = stream[`year${year}Profit` as keyof typeof stream] as number;
                      const margin = stream[`year${year}Margin` as keyof typeof stream] as number;
                      
                      return (
                        <div key={year} className="text-center">
                          <div className="text-sm text-gray-600">Year {year}</div>
                          <div className="font-bold text-green-600">${profit.toLocaleString()}</div>
                          <div className="text-sm text-blue-600">{margin.toFixed(1)}%</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GrossProfit;