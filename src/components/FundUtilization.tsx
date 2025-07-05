import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface FundingData {
  totalFunding: number;
  burnRate: number;
  useOfFunds: {
    category: string;
    percentage: number;
    amount: number;
  }[];
}

interface FundUtilizationProps {
  data: FundingData;
  onChange: (data: FundingData) => void;
}

const FundUtilization: React.FC<FundUtilizationProps> = ({ data, onChange }) => {
  const [newCategory, setNewCategory] = useState({
    category: '',
    percentage: 0
  });

  const commonCategories = [
    'Product Development',
    'Sales & Marketing',
    'Team & Payroll',
    'Operations',
    'Technology Infrastructure',
    'Legal & Compliance',
    'Research & Development',
    'Working Capital',
    'Contingency/Reserve'
  ];

  const addFundingCategory = () => {
    if (newCategory.category && newCategory.percentage > 0) {
      const amount = (data.totalFunding * newCategory.percentage) / 100;
      const updatedUseOfFunds = [...data.useOfFunds, {
        ...newCategory,
        amount
      }];
      
      onChange({
        ...data,
        useOfFunds: updatedUseOfFunds
      });
      
      setNewCategory({ category: '', percentage: 0 });
    }
  };

  const removeFundingCategory = (index: number) => {
    const updatedUseOfFunds = data.useOfFunds.filter((_, i) => i !== index);
    onChange({
      ...data,
      useOfFunds: updatedUseOfFunds
    });
  };

  const updateFundingCategory = (index: number, field: 'category' | 'percentage', value: string | number) => {
    const updatedUseOfFunds = data.useOfFunds.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'percentage') {
          updatedItem.amount = (data.totalFunding * Number(value)) / 100;
        }
        return updatedItem;
      }
      return item;
    });
    
    onChange({
      ...data,
      useOfFunds: updatedUseOfFunds
    });
  };

  const updateTotalFunding = (totalFunding: number) => {
    const updatedUseOfFunds = data.useOfFunds.map(item => ({
      ...item,
      amount: (totalFunding * item.percentage) / 100
    }));
    
    onChange({
      ...data,
      totalFunding,
      useOfFunds: updatedUseOfFunds
    });
  };

  const totalPercentage = data.useOfFunds.reduce((sum, item) => sum + item.percentage, 0);
  const remainingPercentage = 100 - totalPercentage;
  const monthlyBurnRate = data.burnRate;
  const runwayMonths = monthlyBurnRate > 0 ? Math.floor(data.totalFunding / monthlyBurnRate) : 0;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316', '#06b6d4', '#84cc16', '#ec4899'];

  // Prepare chart data
  const chartData = data.useOfFunds.map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length]
  }));

  const burnRateAnalysis = [
    { month: 'Month 1', funding: Math.max(0, data.totalFunding - monthlyBurnRate * 1) },
    { month: 'Month 6', funding: Math.max(0, data.totalFunding - monthlyBurnRate * 6) },
    { month: 'Month 12', funding: Math.max(0, data.totalFunding - monthlyBurnRate * 12) },
    { month: 'Month 18', funding: Math.max(0, data.totalFunding - monthlyBurnRate * 18) },
    { month: 'Month 24', funding: Math.max(0, data.totalFunding - monthlyBurnRate * 24) }
  ];

  return (
    <div className="space-y-6">
      {/* Funding Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Funding Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="total-funding">Total Funding Amount ($)</Label>
              <Input
                id="total-funding"
                type="number"
                placeholder="e.g., 1000000"
                value={data.totalFunding || ''}
                onChange={(e) => updateTotalFunding(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="burn-rate">Monthly Burn Rate ($)</Label>
              <Input
                id="burn-rate"
                type="number"
                placeholder="e.g., 50000"
                value={data.burnRate || ''}
                onChange={(e) => onChange({ ...data, burnRate: Number(e.target.value) })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{runwayMonths}</p>
                <p className="text-sm text-blue-700">Months Runway</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{(runwayMonths / 12).toFixed(1)}</p>
                <p className="text-sm text-green-700">Years Runway</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fund Allocation Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percentage }) => `${category}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="percentage"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Add New Category */}
      <Card className="border-dashed border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Funding Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="category">Category</Label>
              <select 
                className="w-full p-2 border border-input rounded-md"
                value={newCategory.category}
                onChange={(e) => setNewCategory({ ...newCategory, category: e.target.value })}
              >
                <option value="">Select category...</option>
                {commonCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="custom">Custom Category</option>
              </select>
              {newCategory.category === 'custom' && (
                <Input
                  className="mt-2"
                  placeholder="Enter custom category"
                  onChange={(e) => setNewCategory({ ...newCategory, category: e.target.value })}
                />
              )}
            </div>
            <div>
              <Label htmlFor="percentage">Percentage (%)</Label>
              <Input
                id="percentage"
                type="number"
                min="0"
                max="100"
                placeholder="e.g., 25"
                value={newCategory.percentage || ''}
                onChange={(e) => setNewCategory({ ...newCategory, percentage: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <Button onClick={addFundingCategory} disabled={!newCategory.category || newCategory.percentage <= 0}>
              Add Category
            </Button>
            <div className="text-sm text-gray-600">
              Remaining: {remainingPercentage.toFixed(1)}%
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Categories */}
      {data.useOfFunds.map((item, index) => (
        <Card key={index} className="border-l-4" style={{ borderLeftColor: COLORS[index % COLORS.length] }}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">{item.category}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeFundingCategory(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Category</Label>
                <Input
                  value={item.category}
                  onChange={(e) => updateFundingCategory(index, 'category', e.target.value)}
                />
              </div>
              <div>
                <Label>Percentage (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={item.percentage || ''}
                  onChange={(e) => updateFundingCategory(index, 'percentage', Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Amount ($)</Label>
                <Input
                  value={`$${item.amount.toLocaleString()}`}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Runway Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Funding Runway Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={burnRateAnalysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
              <Bar dataKey="funding" fill="#3b82f6" name="Remaining Funding" />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-lg font-bold text-yellow-700">
                {totalPercentage.toFixed(1)}%
              </p>
              <p className="text-sm text-yellow-600">Funds Allocated</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-lg font-bold text-green-700">
                ${(data.totalFunding - data.useOfFunds.reduce((sum, item) => sum + item.amount, 0)).toLocaleString()}
              </p>
              <p className="text-sm text-green-600">Unallocated Funds</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-lg font-bold text-red-700">
                {monthlyBurnRate > 0 ? `$${(monthlyBurnRate * 12).toLocaleString()}` : '$0'}
              </p>
              <p className="text-sm text-red-600">Annual Burn Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FundUtilization;
