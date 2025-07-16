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
  revenueStreams: FinancialData['revenueStreams'];
}

const BalanceSheet: React.FC<BalanceSheetProps> = ({ data, onChange, revenueStreams }) => {
  const [activeTab, setActiveTab] = useState("fixed-assets");
  const [selectedRevenueStream, setSelectedRevenueStream] = useState(revenueStreams[0]?.name || '');

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

  const updateARDays = (revenueStreamName: string, days: number, revenueStreams: FinancialData['revenueStreams']) => {
    // Calculate AR for this specific revenue stream
    const revenueStream = revenueStreams.find(rs => rs.name === revenueStreamName);
    if (!revenueStream) return;

    const arForStream = {
      arDays: days,
      year1: (revenueStream.year1 * days) / 365,
      year2: (revenueStream.year2 * days) / 365,
      year3: (revenueStream.year3 * days) / 365
    };

    const newRevenueStreamARs = {
      ...data.accountsReceivable.revenueStreamARs,
      [revenueStreamName]: arForStream
    };

    // Calculate total AR
    const totalYear1 = Object.values(newRevenueStreamARs).reduce((sum, ar) => sum + ar.year1, 0);
    const totalYear2 = Object.values(newRevenueStreamARs).reduce((sum, ar) => sum + ar.year2, 0);
    const totalYear3 = Object.values(newRevenueStreamARs).reduce((sum, ar) => sum + ar.year3, 0);

    onChange({
      ...data,
      accountsReceivable: {
        revenueStreamARs: newRevenueStreamARs,
        totalYear1,
        totalYear2,
        totalYear3
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

          {/* Assets Analysis Summary */}
          {data.fixedAssets.assets.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-700">Asset Categories</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Tangible Assets:</span>
                        <Badge variant="secondary">
                          {data.fixedAssets.assets.filter(a => a.assetClass === 'tangible').length}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Intangible Assets:</span>
                        <Badge variant="secondary">
                          {data.fixedAssets.assets.filter(a => a.assetClass === 'intangible').length}
                        </Badge>
                      </div>
                      <div className="flex justify-between font-medium pt-1 border-t">
                        <span>Total Assets:</span>
                        <Badge variant="default">
                          {data.fixedAssets.assets.length}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-700">Total Investment</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Total Cost:</span>
                        <span className="font-medium">
                          ${data.fixedAssets.assets.reduce((sum, asset) => sum + (asset.cost || 0), 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Annual Depreciation:</span>
                        <span className="font-medium">
                          ${data.fixedAssets.assets.reduce((sum, asset) => sum + ((asset.cost || 0) / (asset.usefulLife || 1)), 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="space-y-4">
            {data.fixedAssets.assets.map((asset, index) => (
              <Card key={asset.id} className={`border-l-4 ${asset.assetClass === 'tangible' ? 'border-blue-500' : 'border-purple-500'}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <Badge variant={asset.assetClass === 'tangible' ? 'default' : 'secondary'} className="text-xs">
                      {asset.assetClass === 'tangible' ? 'Tangible' : 'Intangible'}
                    </Badge>
                    {asset.isFromCapitalizedPayroll && (
                      <Badge variant="secondary" className="text-xs">IP</Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-6 gap-4 items-end">
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">Asset Name</Label>
                      <Input
                        placeholder="Enter asset name"
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
                    <div className="text-xs text-gray-500">
                      <div>Annual Depreciation:</div>
                      <div className="font-medium text-gray-700">
                        ${((asset.cost || 0) / (asset.usefulLife || 1)).toLocaleString()}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeAsset(asset.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {data.fixedAssets.assets.length === 0 && (
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="pt-6 text-center">
                  <div className="text-gray-500 mb-2">
                    <Building className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No assets added yet</p>
                    <p className="text-sm">Click "Add Asset" to start building your asset portfolio</p>
                  </div>
                </CardContent>
              </Card>
            )}
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
          
          {revenueStreams.length > 0 ? (
            <div className="space-y-6">
              {/* Revenue Streams AR Configuration */}
              <div className="space-y-4">
                <h4 className="font-medium text-slate-600">Revenue Streams AR Configuration</h4>
                {revenueStreams.map((stream, index) => (
                  <Card key={stream.name} className="border-l-4 border-green-500">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <Badge variant="default" className="text-xs">
                          {stream.name}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 items-end">
                        <div>
                          <Label className="text-xs text-gray-500 mb-1 block">AR Days</Label>
                          <Input
                            type="number"
                            placeholder="30"
                            value={data.accountsReceivable.revenueStreamARs[stream.name]?.arDays || ''}
                            onChange={(e) => updateARDays(stream.name, Number(e.target.value), revenueStreams)}
                            className="h-8"
                          />
                          <p className="text-xs text-gray-500 mt-1">Collection period in days</p>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-gray-500 mb-1 block">Year 1 AR ($)</Label>
                          <Input
                            type="number"
                            value={data.accountsReceivable.revenueStreamARs[stream.name]?.year1?.toLocaleString() || '0'}
                            readOnly
                            className="h-8 bg-gray-50"
                          />
                          <p className="text-xs text-green-600 mt-1">
                            Revenue: ${stream.year1?.toLocaleString() || '0'}
                          </p>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-gray-500 mb-1 block">Year 2 AR ($)</Label>
                          <Input
                            type="number"
                            value={data.accountsReceivable.revenueStreamARs[stream.name]?.year2?.toLocaleString() || '0'}
                            readOnly
                            className="h-8 bg-gray-50"
                          />
                          <p className="text-xs text-green-600 mt-1">
                            Revenue: ${stream.year2?.toLocaleString() || '0'}
                          </p>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-gray-500 mb-1 block">Year 3 AR ($)</Label>
                          <Input
                            type="number"
                            value={data.accountsReceivable.revenueStreamARs[stream.name]?.year3?.toLocaleString() || '0'}
                            readOnly
                            className="h-8 bg-gray-50"
                          />
                          <p className="text-xs text-green-600 mt-1">
                            Revenue: ${stream.year3?.toLocaleString() || '0'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Total AR Summary */}
              <Card className="bg-green-50">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Accounts Receivable Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {(['year1', 'year2', 'year3'] as const).map((year) => (
                      <div key={year}>
                        <Label className="text-xs text-gray-500 mb-1 block">
                          {year === 'year1' ? 'Year 1 ($)' : year === 'year2' ? 'Year 2 ($)' : 'Year 3 ($)'}
                        </Label>
                        <div className="text-lg font-semibold text-green-700">
                          ${data.accountsReceivable[`total${year.charAt(0).toUpperCase() + year.slice(1)}` as keyof typeof data.accountsReceivable].toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Combined from {revenueStreams.length} revenue stream{revenueStreams.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-l-4 border-yellow-500">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">Please add revenue streams first to configure accounts receivable.</p>
              </CardContent>
            </Card>
          )}
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
                    data.accountsReceivable[`total${year.charAt(0).toUpperCase() + year.slice(1)}` as 'totalYear1' | 'totalYear2' | 'totalYear3'] +
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