import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialData } from "@/pages/Index";

interface BalanceSheetProps {
  data: FinancialData['costs']['balanceSheet'];
  onChange: (data: FinancialData['costs']['balanceSheet']) => void;
}

const BalanceSheet: React.FC<BalanceSheetProps> = ({ data, onChange }) => {
  const updateItem = (
    category: keyof FinancialData['costs']['balanceSheet'], 
    year: 'year1' | 'year2' | 'year3', 
    value: number
  ) => {
    onChange({
      ...data,
      [category]: {
        ...data[category],
        [year]: value
      }
    });
  };

  const assetCategories = [
    { key: 'fixedAssets' as keyof FinancialData['costs']['balanceSheet'], label: 'Fixed Assets', color: 'border-blue-500' },
    { key: 'accountsReceivable' as keyof FinancialData['costs']['balanceSheet'], label: 'Accounts Receivable', color: 'border-green-500' },
    { key: 'cashAndBank' as keyof FinancialData['costs']['balanceSheet'], label: 'Cash & Bank', color: 'border-purple-500' },
    { key: 'inventory' as keyof FinancialData['costs']['balanceSheet'], label: 'Inventory', color: 'border-orange-500' },
    { key: 'otherAssets' as keyof FinancialData['costs']['balanceSheet'], label: 'Other Assets', color: 'border-cyan-500' }
  ];

  const liabilityCategories = [
    { key: 'accountsPayable' as keyof FinancialData['costs']['balanceSheet'], label: 'Accounts Payable', color: 'border-red-500' },
    { key: 'otherLiabilities' as keyof FinancialData['costs']['balanceSheet'], label: 'Other Liabilities', color: 'border-pink-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Assets Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-slate-700">Assets</h3>
        <div className="grid gap-4">
          {assetCategories.map((category) => (
            <Card key={category.key} className={`border-l-4 ${category.color}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{category.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {['year1', 'year2', 'year3'].map((year) => (
                    <div key={year}>
                      <Label className="text-xs text-gray-500 mb-1 block">
                        {year === 'year1' ? 'Year 1 ($)' : year === 'year2' ? 'Year 2 ($)' : 'Year 3 ($)'}
                      </Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={data[category.key][year as 'year1' | 'year2' | 'year3'] || ''}
                        onChange={(e) => updateItem(category.key, year as 'year1' | 'year2' | 'year3', Number(e.target.value))}
                        className="h-8"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Liabilities Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-slate-700">Liabilities</h3>
        <div className="grid gap-4">
          {liabilityCategories.map((category) => (
            <Card key={category.key} className={`border-l-4 ${category.color}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{category.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {['year1', 'year2', 'year3'].map((year) => (
                    <div key={year}>
                      <Label className="text-xs text-gray-500 mb-1 block">
                        {year === 'year1' ? 'Year 1 ($)' : year === 'year2' ? 'Year 2 ($)' : 'Year 3 ($)'}
                      </Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={data[category.key][year as 'year1' | 'year2' | 'year3'] || ''}
                        onChange={(e) => updateItem(category.key, year as 'year1' | 'year2' | 'year3', Number(e.target.value))}
                        className="h-8"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Summary */}
      <Card className="bg-slate-50">
        <CardHeader>
          <CardTitle className="text-lg">Balance Sheet Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {['year1', 'year2', 'year3'].map((year) => {
              const totalAssets = assetCategories.reduce((sum, cat) => 
                sum + (data[cat.key][year as 'year1' | 'year2' | 'year3'] || 0), 0
              );
              const totalLiabilities = liabilityCategories.reduce((sum, cat) => 
                sum + (data[cat.key][year as 'year1' | 'year2' | 'year3'] || 0), 0
              );
              const equity = totalAssets - totalLiabilities;
              
              return (
                <div key={year} className="space-y-2">
                  <h4 className="font-medium text-sm">
                    {year === 'year1' ? 'Year 1' : year === 'year2' ? 'Year 2' : 'Year 3'}
                  </h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Total Assets:</span>
                      <span className="font-medium">${totalAssets.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Liabilities:</span>
                      <span className="font-medium">${totalLiabilities.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span>Equity:</span>
                      <span className="font-medium">${equity.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BalanceSheet;