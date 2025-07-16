import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Save } from 'lucide-react';
import { FinancialData } from "@/pages/Index";

interface RevenueStream {
  name: string;
  type: string;
  year1: number;
  year2: number;
  year3: number;
}

interface DirectCostsProps {
  data: FinancialData['costs']['revenueStreamCosts'];
  onChange: (data: FinancialData['costs']['revenueStreamCosts']) => void;
  revenueStreams: RevenueStream[];
}

const DirectCosts: React.FC<DirectCostsProps> = ({ data, onChange, revenueStreams }) => {
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newCostName, setNewCostName] = useState('');
  const [newCostType, setNewCostType] = useState<'cogs' | 'processing' | 'fulfillment'>('cogs');
  const [localData, setLocalData] = useState(data);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync localData with props when data changes
  useEffect(() => {
    setLocalData(data);
    setHasChanges(false);
  }, [data]);

  const updateRevenueStreamCost = (
    streamName: string, 
    costType: 'cogs' | 'processing' | 'fulfillment', 
    year: 'year1' | 'year2' | 'year3', 
    value: number
  ) => {
    const updatedData = { ...localData };
    if (!updatedData[streamName]) {
      updatedData[streamName] = {
        directCosts: {
          cogs: { year1: 0, year2: 0, year3: 0 },
          processing: { year1: 0, year2: 0, year3: 0 },
          fulfillment: { year1: 0, year2: 0, year3: 0 }
        }
      };
    }
    updatedData[streamName].directCosts[costType][year] = value;
    setLocalData(updatedData);
    setHasChanges(true);
  };

  const addCustomDirectCost = () => {
    if (!newCostName.trim()) return;
    
    const updatedData = { ...localData };
    const costKey = newCostName.toLowerCase().replace(/\s+/g, '_');
    
    // Add the custom cost to all existing revenue streams
    revenueStreams.forEach(stream => {
      if (!updatedData[stream.name]) {
        updatedData[stream.name] = {
          directCosts: {
            cogs: { year1: 0, year2: 0, year3: 0 },
            processing: { year1: 0, year2: 0, year3: 0 },
            fulfillment: { year1: 0, year2: 0, year3: 0 }
          }
        };
      }
      
      if (!updatedData[stream.name].directCosts[costKey]) {
        updatedData[stream.name].directCosts[costKey] = { year1: 0, year2: 0, year3: 0 };
      }
    });
    
    setLocalData(updatedData);
    setHasChanges(true);
    setNewCostName('');
    setShowAddCustom(false);
  };

  const handleSave = () => {
    onChange(localData);
    setHasChanges(false);
  };

  const getDirectCostTypes = (streamType: string) => {
    switch (streamType) {
      case 'saas':
        return [
          { key: 'cogs' as const, label: 'Server/Infrastructure Costs', placeholder: 'Hosting, CDN, etc.' },
          { key: 'processing' as const, label: 'Payment Processing (2-3%)', placeholder: '% of revenue' },
          { key: 'fulfillment' as const, label: 'Onboarding/Setup', placeholder: 'Implementation costs' }
        ];
      case 'ecommerce':
        return [
          { key: 'cogs' as const, label: 'Cost of Goods Sold', placeholder: 'Product costs' },
          { key: 'fulfillment' as const, label: 'Shipping & Fulfillment', placeholder: 'Logistics costs' },
          { key: 'processing' as const, label: 'Payment Processing', placeholder: '% of revenue' }
        ];
      case 'advertising':
        return [
          { key: 'cogs' as const, label: 'Content Creation', placeholder: 'Ad content costs' },
          { key: 'processing' as const, label: 'Platform Fees', placeholder: 'Ad platform fees' },
          { key: 'fulfillment' as const, label: 'Campaign Management', placeholder: 'Management costs' }
        ];
      default:
        return [
          { key: 'cogs' as const, label: 'Cost of Goods/Services', placeholder: 'Direct costs' },
          { key: 'processing' as const, label: 'Processing Fees', placeholder: 'Transaction fees' },
          { key: 'fulfillment' as const, label: 'Fulfillment Costs', placeholder: 'Delivery costs' }
        ];
    }
  };

  const calculateTotalDirectCosts = () => {
    const totals = { year1: 0, year2: 0, year3: 0 };
    
    Object.values(localData).forEach(streamData => {
      Object.values(streamData.directCosts).forEach(costData => {
        totals.year1 += costData.year1 || 0;
        totals.year2 += costData.year2 || 0;
        totals.year3 += costData.year3 || 0;
      });
    });
    
    return totals;
  };

  return (
    <div className="space-y-6">
      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={!hasChanges}
          className="bg-primary hover:bg-primary/90 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Direct Costs
        </Button>
      </div>

      {/* Add Custom Direct Cost Button */}
      {revenueStreams.length > 0 && (
        <Card className="border-dashed border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Custom Direct Cost Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showAddCustom ? (
              <Button 
                onClick={() => setShowAddCustom(true)}
                variant="outline" 
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Direct Cost Category
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Cost Category Name</Label>
                    <Input
                      placeholder="e.g., Raw Materials, Licensing Fees"
                      value={newCostName}
                      onChange={(e) => setNewCostName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Cost Type</Label>
                    <Select value={newCostType} onValueChange={(value: 'cogs' | 'processing' | 'fulfillment') => setNewCostType(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cost type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cogs">Cost of Goods/Services</SelectItem>
                        <SelectItem value="processing">Processing Fees</SelectItem>
                        <SelectItem value="fulfillment">Fulfillment Costs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={addCustomDirectCost} className="flex-1">
                    Add Cost Category
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAddCustom(false);
                      setNewCostName('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Existing Revenue Stream Costs */}
      {revenueStreams.length === 0 ? (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6 text-center">
            <div className="text-orange-600 mb-2">
              <svg className="w-12 h-12 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-orange-700 font-medium mb-2">No Revenue Streams Found</p>
            <p className="text-orange-600 text-sm">
              Please add revenue streams first in the <strong>"Revenue"</strong> tab, then return here to define their associated direct costs.
            </p>
          </CardContent>
        </Card>
      ) : (
        revenueStreams.map((stream) => (
          <Card key={stream.name} className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Direct Costs for: {stream.name}</span>
                <span className="text-sm font-normal text-gray-500 capitalize">
                  {stream.type} Revenue Stream
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Standard cost types */}
              {getDirectCostTypes(stream.type).map((costType) => (
                <div key={costType.key} className="space-y-3">
                  <h5 className="font-medium text-sm text-slate-600">{costType.label}</h5>
                  <div className="grid grid-cols-3 gap-4">
                    {['year1', 'year2', 'year3'].map(year => (
                      <div key={year}>
                        <Label className="text-xs text-slate-500">{year.replace('year', 'Year ')} ($)</Label>
                        <Input
                          type="number"
                          placeholder={costType.placeholder}
                          value={localData[stream.name]?.directCosts?.[costType.key]?.[year] || ''}
                          onChange={(e) => updateRevenueStreamCost(
                            stream.name, 
                            costType.key, 
                            year as 'year1' | 'year2' | 'year3', 
                            parseFloat(e.target.value) || 0
                          )}
                          className="border-slate-200"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Custom cost types */}
              {localData[stream.name] && (
                Object.keys(localData[stream.name]?.directCosts || {}).map(costKey => {
                  if (['cogs', 'processing', 'fulfillment'].includes(costKey)) return null;
                  
                  return (
                    <div key={costKey} className="space-y-3">
                      <h5 className="font-medium text-sm text-slate-600 capitalize">
                        {costKey.replace(/_/g, ' ')}
                      </h5>
                      <div className="grid grid-cols-3 gap-4">
                        {['year1', 'year2', 'year3'].map(year => (
                          <div key={year}>
                            <Label className="text-xs text-slate-500">{year.replace('year', 'Year ')} ($)</Label>
                            <Input
                              type="number"
                              value={localData[stream.name]?.directCosts?.[costKey]?.[year] || ''}
                              onChange={(e) => {
                                const updatedData = { ...localData };
                                if (!updatedData[stream.name]?.directCosts?.[costKey]) return;
                                updatedData[stream.name].directCosts[costKey][year] = parseFloat(e.target.value) || 0;
                                setLocalData(updatedData);
                                setHasChanges(true);
                              }}
                              className="border-slate-200"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        ))
      )}

      {/* Summary */}
      {revenueStreams.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              Total Direct Costs Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              {['year1', 'year2', 'year3'].map((year, index) => {
                const totals = calculateTotalDirectCosts();
                return (
                  <div key={year} className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      ${totals[year as keyof typeof totals].toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-700">Year {index + 1}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DirectCosts;
