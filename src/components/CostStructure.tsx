
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CostData {
  cogs: { year1: number; year2: number; year3: number; };
  payroll: { year1: number; year2: number; year3: number; };
  admin: { year1: number; year2: number; year3: number; };
  marketing: { year1: number; year2: number; year3: number; };
  other: { year1: number; year2: number; year3: number; };
}

interface CostStructureProps {
  data: CostData;
  onChange: (data: CostData) => void;
}

const CostStructure: React.FC<CostStructureProps> = ({ data, onChange }) => {
  const updateCost = (category: keyof CostData, year: 'year1' | 'year2' | 'year3', value: number) => {
    onChange({
      ...data,
      [category]: {
        ...data[category],
        [year]: value
      }
    });
  };

  const getTotalCosts = (year: 'year1' | 'year2' | 'year3') => {
    return Object.values(data).reduce((sum, category) => sum + category[year], 0);
  };

  const costCategories = [
    { key: 'cogs' as keyof CostData, label: 'Cost of Goods Sold (COGS)', color: 'border-red-500' },
    { key: 'payroll' as keyof CostData, label: 'Payroll & Benefits', color: 'border-blue-500' },
    { key: 'admin' as keyof CostData, label: 'Administrative Expenses', color: 'border-purple-500' },
    { key: 'marketing' as keyof CostData, label: 'Sales & Marketing', color: 'border-orange-500' },
    { key: 'other' as keyof CostData, label: 'Other Operating Expenses', color: 'border-gray-500' }
  ];

  return (
    <div className="space-y-6">
      {costCategories.map(({ key, label, color }) => (
        <Card key={key} className={`border-l-4 ${color}`}>
          <CardHeader>
            <CardTitle className="text-lg">{label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Year 1 ($)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={data[key].year1 || ''}
                  onChange={(e) => updateCost(key, 'year1', Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Year 2 ($)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={data[key].year2 || ''}
                  onChange={(e) => updateCost(key, 'year2', Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Year 3 ($)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={data[key].year3 || ''}
                  onChange={(e) => updateCost(key, 'year3', Number(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Cost Summary */}
      <Card className="bg-red-50 border-red-200">
        <CardHeader>
          <CardTitle className="text-red-800">Total Cost Projection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                ${getTotalCosts('year1').toLocaleString()}
              </p>
              <p className="text-sm text-red-700">Year 1</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                ${getTotalCosts('year2').toLocaleString()}
              </p>
              <p className="text-sm text-red-700">Year 2</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                ${getTotalCosts('year3').toLocaleString()}
              </p>
              <p className="text-sm text-red-700">Year 3</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CostStructure;
