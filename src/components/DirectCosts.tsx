import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from 'lucide-react';
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
  const [newCostType, setNewCostType] = useState<'cogs' | 'processing' | 'fulfillment' | 'support'>('cogs');

  const updateRevenueStreamCost = (
    streamName: string, 
    costType: 'cogs' | 'processing' | 'fulfillment' | 'support', 
    year: 'year1' | 'year2' | 'year3', 
    value: number
  ) => {
    const updatedData = { ...data };
    if (!updatedData[streamName]) {
      updatedData[streamName] = {
        directCosts: {
          cogs: { year1: 0, year2: 0, year3: 0 },
          processing: { year1: 0, year2: 0, year3: 0 },
          fulfillment: { year1: 0, year2: 0, year3: 0 },
          support: { year1: 0, year2: 0, year3: 0 }
        }
      };
    }
    updatedData[streamName].directCosts[costType][year] = value;
    onChange(updatedData);
  };

  const addCustomDirectCost = () => {
    if (!newCostName.trim()) return;
    
    const updatedData = { ...data };
    const costKey = newCostName.toLowerCase().replace(/\s+/g, '_');
    
    // Add the custom cost to all existing revenue streams
    revenueStreams.forEach(stream => {
      if (!updatedData[stream.name]) {
        updatedData[stream.name] = {
          directCosts: {
            cogs: { year1: 0, year2: 0, year3: 0 },
            processing: { year1: 0, year2: 0, year3: 0 },
            fulfillment: { year1: 0, year2: 0, year3: 0 },
            support: { year1: 0, year2: 0, year3: 0 }
          }
        };
      }
      
      // Add the new cost category
      updatedData[stream.name].directCosts[newCostType] = {
        year1: 0,
        year2: 0,
        year3: 0
      };
    });
    
    onChange(updatedData);
    setNewCostName('');
    setShowAddCustom(false);
  };

  const getDirectCostTypes = (streamType: string) => {
    switch (streamType) {
      case 'saas':
        return [
          { key: 'cogs' as const, label: 'Server/Infrastructure Costs', placeholder: 'Hosting, CDN, etc.' },
          { key: 'processing' as const, label: 'Payment Processing (2-3%)', placeholder: '% of revenue' },
          { key: 'support' as const, label: 'Customer Support', placeholder: 'Support staff costs' },
          { key: 'fulfillment' as const, label: 'Onboarding/Setup', placeholder: 'Implementation costs' }
        ];
      case 'ecommerce':
        return [
          { key: 'cogs' as const, label: 'Cost of Goods Sold', placeholder: 'Product costs' },
          { key: 'fulfillment' as const, label: 'Shipping & Fulfillment', placeholder: 'Logistics costs' },
          { key: 'processing' as const, label: 'Payment Processing', placeholder: '% of revenue' },
          { key: 'support' as const, label: 'Customer Service', placeholder: 'Support costs' }
        ];
      case 'advertising':
        return [
          { key: 'cogs' as const, label: 'Content Creation', placeholder: 'Ad content costs' },
          { key: 'processing' as const, label: 'Platform Fees', placeholder: 'Ad platform fees' },
          { key: 'support' as const, label: 'Campaign Management', placeholder: 'Management costs' },
          { key: 'fulfillment' as const, label: 'Analytics Tools', placeholder: 'Tracking tools' }
        ];
      default:
        return [
          { key: 'cogs' as const, label: 'Direct Costs', placeholder: 'Direct service costs' },
          { key: 'processing' as const, label: 'Processing Fees', placeholder: 'Transaction fees' },
          { key: 'fulfillment' as const, label: 'Delivery/Fulfillment', placeholder: 'Delivery costs' },
          { key: 'support' as const, label: 'Support Costs', placeholder: 'Customer support' }
        ];
    }
  };

  return (
    <div className="space-y-6">
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
                    <Select value={newCostType} onValueChange={(value: any) => setNewCostType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cogs">Cost of Goods Sold</SelectItem>
                        <SelectItem value="processing">Processing Fees</SelectItem>
                        <SelectItem value="fulfillment">Fulfillment/Delivery</SelectItem>
                        <SelectItem value="support">Support/Service</SelectItem>
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
            <CardContent className="space-y-4">
              {getDirectCostTypes(stream.type).map(({ key, label, placeholder }) => (
                <div key={key}>
                  <Label className="text-sm font-medium">{label}</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {['year1', 'year2', 'year3'].map((year) => (
                      <div key={year}>
                        <Label className="text-xs text-gray-500">
                          {year === 'year1' ? 'Year 1' : year === 'year2' ? 'Year 2' : 'Year 3'} ($)
                        </Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={data[stream.name]?.directCosts[key]?.[year as 'year1' | 'year2' | 'year3'] || ''}
                          onChange={(e) => updateRevenueStreamCost(
                            stream.name, 
                            key, 
                            year as 'year1' | 'year2' | 'year3', 
                            Number(e.target.value)
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))
      )}

      {/* Direct Costs Summary */}
      {revenueStreams.length > 0 && Object.keys(data).length > 0 && (
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800">Total Direct Costs Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {['year1', 'year2', 'year3'].map((year, index) => {
                const totalCosts = Object.values(data).reduce((total, streamCosts) => {
                  return total + Object.values(streamCosts.directCosts).reduce((sum, cost) => {
                    return sum + (cost[year as 'year1' | 'year2' | 'year3'] || 0);
                  }, 0);
                }, 0);
                
                return (
                  <div key={year} className="text-center">
                    <p className="text-2xl font-bold text-red-600">
                      ${totalCosts.toLocaleString()}
                    </p>
                    <p className="text-sm text-red-700">Year {index + 1}</p>
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