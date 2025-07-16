import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Building, CreditCard, Banknote, Package } from "lucide-react";
import { FinancialData } from "@/pages/Index";

interface BalanceSheetProps {
  data: FinancialData['costs']['balanceSheet'];
  onChange: (data: FinancialData['costs']['balanceSheet']) => void;
}

const BalanceSheet: React.FC<BalanceSheetProps> = ({ data, onChange }) => {
  const [activeTab, setActiveTab] = useState("fixed-assets");

  const updateFixedAssets = (assets: FinancialData['costs']['balanceSheet']['fixedAssets']['assets']) => {
    // Calculate total cost and depreciation
    let year1Total = 0, year2Total = 0, year3Total = 0;
    
    assets.forEach(asset => {
      const annualDepreciation = asset.cost / asset.usefulLife;
      year1Total += asset.cost - annualDepreciation;
      year2Total += asset.cost - (annualDepreciation * 2);
      year3Total += asset.cost - (annualDepreciation * 3);
    });

    onChange({
      ...data,
      fixedAssets: {
        ...data.fixedAssets,
        assets,
        year1: Math.max(0, year1Total),
        year2: Math.max(0, year2Total),
        year3: Math.max(0, year3Total)
      }
    });
  };

  const addAsset = () => {
    const newAsset = {
      id: `asset-${Date.now()}`,
      name: '',
      cost: 0,
      usefulLife: 5,
      assetClass: 'tangible' as const,
      isFromCapitalizedPayroll: false
    };
    updateFixedAssets([...data.fixedAssets.assets, newAsset]);
  };

  const removeAsset = (id: string) => {
    updateFixedAssets(data.fixedAssets.assets.filter(asset => asset.id !== id));
  };

  const updateAsset = (id: string, field: string, value: any) => {
    updateFixedAssets(
      data.fixedAssets.assets.map(asset => 
        asset.id === id ? { ...asset, [field]: value } : asset
      )
    );
  };

  const updateARDays = (days: number) => {
    onChange({
      ...data,
      accountsReceivable: {
        ...data.accountsReceivable,
        daysLinkedToRevenue: days
      }
    });
  };

  const updateAPDays = (days: number) => {
    onChange({
      ...data,
      accountsPayable: {
        ...data.accountsPayable,
        daysForPayment: days
      }
    });
  };

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

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="fixed-assets" className="flex items-center gap-2">
          <Building className="w-4 h-4" />
          Fixed Assets
        </TabsTrigger>
        <TabsTrigger value="accounts-receivable" className="flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          A/R
        </TabsTrigger>
        <TabsTrigger value="accounts-payable" className="flex items-center gap-2">
          <Banknote className="w-4 h-4" />
          A/P
        </TabsTrigger>
        <TabsTrigger value="cash-bank" className="flex items-center gap-2">
          <Banknote className="w-4 h-4" />
          Cash & Bank
        </TabsTrigger>
        <TabsTrigger value="inventory" className="flex items-center gap-2">
          <Package className="w-4 h-4" />
          Inventory
        </TabsTrigger>
        <TabsTrigger value="other" className="flex items-center gap-2">
          Other
        </TabsTrigger>
      </TabsList>

      <TabsContent value="fixed-assets">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-700">Fixed Assets</h3>
            <Button onClick={addAsset} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Asset
            </Button>
          </div>

          <div className="space-y-4">
            {data.fixedAssets.assets.map((asset) => (
              <Card key={asset.id} className="border-l-4 border-blue-500">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-6 gap-4 items-end">
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">Asset Name</Label>
                      <Input
                        placeholder="Asset name"
                        value={asset.name}
                        onChange={(e) => updateAsset(asset.id, 'name', e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">Cost ($)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={asset.cost || ''}
                        onChange={(e) => updateAsset(asset.id, 'cost', Number(e.target.value))}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">Useful Life (years)</Label>
                      <Input
                        type="number"
                        placeholder="5"
                        value={asset.usefulLife || ''}
                        onChange={(e) => updateAsset(asset.id, 'usefulLife', Number(e.target.value))}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">Asset Class</Label>
                      <Select value={asset.assetClass} onValueChange={(value) => updateAsset(asset.id, 'assetClass', value)}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tangible">Tangible</SelectItem>
                          <SelectItem value="intangible">Intangible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      {asset.isFromCapitalizedPayroll && (
                        <Badge variant="secondary" className="text-xs">IP</Badge>
                      )}
                      <span className="text-xs text-gray-500">
                        Annual Depreciation: ${(asset.cost / asset.usefulLife).toLocaleString()}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeAsset(asset.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Fixed Assets Summary */}
          <Card className="bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg">Fixed Assets Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {['year1', 'year2', 'year3'].map((year) => (
                  <div key={year} className="space-y-2">
                    <h4 className="font-medium text-sm">
                      {year === 'year1' ? 'Year 1' : year === 'year2' ? 'Year 2' : 'Year 3'}
                    </h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Net Book Value:</span>
                        <span className="font-medium">${data.fixedAssets[year as 'year1' | 'year2' | 'year3'].toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="accounts-receivable">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-700">Accounts Receivable</h3>
          
          <Card className="border-l-4 border-green-500">
            <CardHeader>
              <CardTitle className="text-sm font-medium">A/R Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Days Linked to Revenue</Label>
                  <Input
                    type="number"
                    placeholder="30"
                    value={data.accountsReceivable.daysLinkedToRevenue || ''}
                    onChange={(e) => updateARDays(Number(e.target.value))}
                    className="h-8"
                  />
                  <p className="text-xs text-gray-500 mt-1">Average collection period in days</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {['year1', 'year2', 'year3'].map((year) => (
                  <div key={year}>
                    <Label className="text-xs text-gray-500 mb-1 block">
                      {year === 'year1' ? 'Year 1 ($)' : year === 'year2' ? 'Year 2 ($)' : 'Year 3 ($)'}
                    </Label>
                    <Input
                      type="number"
                      placeholder="Auto-calculated"
                      value={data.accountsReceivable[year as 'year1' | 'year2' | 'year3'] || ''}
                      readOnly
                      className="h-8 bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Based on {data.accountsReceivable.daysLinkedToRevenue} days of revenue
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="accounts-payable">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-700">Accounts Payable</h3>
          
          <Card className="border-l-4 border-red-500">
            <CardHeader>
              <CardTitle className="text-sm font-medium">A/P Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Days for Payment</Label>
                  <Input
                    type="number"
                    placeholder="30"
                    value={data.accountsPayable.daysForPayment || ''}
                    onChange={(e) => updateAPDays(Number(e.target.value))}
                    className="h-8"
                  />
                  <p className="text-xs text-gray-500 mt-1">Average payment period in days</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {['year1', 'year2', 'year3'].map((year) => (
                  <div key={year}>
                    <Label className="text-xs text-gray-500 mb-1 block">
                      {year === 'year1' ? 'Year 1 ($)' : year === 'year2' ? 'Year 2 ($)' : 'Year 3 ($)'}
                    </Label>
                    <Input
                      type="number"
                      placeholder="Auto-calculated"
                      value={data.accountsPayable[year as 'year1' | 'year2' | 'year3'] || ''}
                      readOnly
                      className="h-8 bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Based on {data.accountsPayable.daysForPayment} days of expenses
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="cash-bank">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-700">Cash & Bank</h3>
          
          <Card className="border-l-4 border-purple-500">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
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
                      placeholder="Auto-calculated"
                      value={data.cashAndBank[year as 'year1' | 'year2' | 'year3'] || ''}
                      readOnly
                      className="h-8 bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Calculated from cash flow</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="inventory">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-700">Inventory</h3>
          
          <Card className="border-l-4 border-orange-500">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Inventory Levels</CardTitle>
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
                      placeholder="From purchases"
                      value={data.inventory[year as 'year1' | 'year2' | 'year3'] || ''}
                      readOnly
                      className="h-8 bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Based on purchase cycles</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="other">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-700">Other Balance Sheet Items</h3>
          
          <div className="grid gap-4">
            <Card className="border-l-4 border-cyan-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Other Assets</CardTitle>
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
                        value={data.otherAssets[year as 'year1' | 'year2' | 'year3'] || ''}
                        onChange={(e) => updateItem('otherAssets', year as 'year1' | 'year2' | 'year3', Number(e.target.value))}
                        className="h-8"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-pink-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Other Liabilities</CardTitle>
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
                        value={data.otherLiabilities[year as 'year1' | 'year2' | 'year3'] || ''}
                        onChange={(e) => updateItem('otherLiabilities', year as 'year1' | 'year2' | 'year3', Number(e.target.value))}
                        className="h-8"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Balance Sheet Summary */}
          <Card className="bg-slate-50">
            <CardHeader>
              <CardTitle className="text-lg">Balance Sheet Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {['year1', 'year2', 'year3'].map((year) => {
                  const totalAssets = 
                    data.fixedAssets[year as 'year1' | 'year2' | 'year3'] +
                    data.accountsReceivable[year as 'year1' | 'year2' | 'year3'] +
                    data.cashAndBank[year as 'year1' | 'year2' | 'year3'] +
                    data.inventory[year as 'year1' | 'year2' | 'year3'] +
                    data.otherAssets[year as 'year1' | 'year2' | 'year3'];
                  
                  const totalLiabilities = 
                    data.accountsPayable[year as 'year1' | 'year2' | 'year3'] +
                    data.otherLiabilities[year as 'year1' | 'year2' | 'year3'];
                  
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
      </TabsContent>
    </Tabs>
  );
};

export default BalanceSheet;