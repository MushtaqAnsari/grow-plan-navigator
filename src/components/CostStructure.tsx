
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RevenueStream {
  name: string;
  type: string;
  year1: number;
  year2: number;
  year3: number;
}

interface CostData {
  revenueStreamCosts: {
    [key: string]: {
      directCosts: {
        cogs: { year1: number; year2: number; year3: number; };
        processing: { year1: number; year2: number; year3: number; };
        fulfillment: { year1: number; year2: number; year3: number; };
        support: { year1: number; year2: number; year3: number; };
      };
    };
  };
  overhead: {
    payroll: { year1: number; year2: number; year3: number; };
    admin: { year1: number; year2: number; year3: number; };
    marketing: { year1: number; year2: number; year3: number; };
    facilities: { year1: number; year2: number; year3: number; };
    other: { year1: number; year2: number; year3: number; };
  };
}

interface CostStructureProps {
  data: CostData;
  onChange: (data: CostData) => void;
  revenueStreams: RevenueStream[];
}

const CostStructure: React.FC<CostStructureProps> = ({ data, onChange, revenueStreams }) => {
  const updateRevenueStreamCost = (
    streamName: string, 
    costType: keyof CostData['revenueStreamCosts'][string]['directCosts'], 
    year: 'year1' | 'year2' | 'year3', 
    value: number
  ) => {
    const updatedData = { ...data };
    if (!updatedData.revenueStreamCosts[streamName]) {
      updatedData.revenueStreamCosts[streamName] = {
        directCosts: {
          cogs: { year1: 0, year2: 0, year3: 0 },
          processing: { year1: 0, year2: 0, year3: 0 },
          fulfillment: { year1: 0, year2: 0, year3: 0 },
          support: { year1: 0, year2: 0, year3: 0 }
        }
      };
    }
    updatedData.revenueStreamCosts[streamName].directCosts[costType][year] = value;
    onChange(updatedData);
  };

  const updateOverheadCost = (
    category: keyof CostData['overhead'], 
    year: 'year1' | 'year2' | 'year3', 
    value: number
  ) => {
    onChange({
      ...data,
      overhead: {
        ...data.overhead,
        [category]: {
          ...data.overhead[category],
          [year]: value
        }
      }
    });
  };

  const getTotalCosts = (year: 'year1' | 'year2' | 'year3') => {
    // Sum all direct costs
    const directCosts = Object.values(data.revenueStreamCosts).reduce((sum, stream) => {
      return sum + Object.values(stream.directCosts).reduce((streamSum, cost) => streamSum + cost[year], 0);
    }, 0);
    
    // Sum all overhead costs
    const overheadCosts = Object.values(data.overhead).reduce((sum, cost) => sum + cost[year], 0);
    
    return directCosts + overheadCosts;
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

  const overheadCategories = [
    { key: 'payroll' as keyof CostData['overhead'], label: 'Payroll & Benefits', color: 'border-blue-500' },
    { key: 'admin' as keyof CostData['overhead'], label: 'Administrative Expenses', color: 'border-purple-500' },
    { key: 'marketing' as keyof CostData['overhead'], label: 'Sales & Marketing', color: 'border-orange-500' },
    { key: 'facilities' as keyof CostData['overhead'], label: 'Facilities & Equipment', color: 'border-green-500' },
    { key: 'other' as keyof CostData['overhead'], label: 'Other Operating Expenses', color: 'border-gray-500' }
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="direct" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="direct">Direct Costs (Revenue-Linked)</TabsTrigger>
          <TabsTrigger value="overhead">Overhead Costs</TabsTrigger>
        </TabsList>

        <TabsContent value="direct" className="space-y-6">
          {revenueStreams.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                Add revenue streams first to define their associated direct costs
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
                              value={data.revenueStreamCosts[stream.name]?.directCosts[key]?.[year as 'year1' | 'year2' | 'year3'] || ''}
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
        </TabsContent>

        <TabsContent value="overhead" className="space-y-6">
          {overheadCategories.map(({ key, label, color }) => (
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
                      value={data.overhead[key].year1 || ''}
                      onChange={(e) => updateOverheadCost(key, 'year1', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Year 2 ($)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={data.overhead[key].year2 || ''}
                      onChange={(e) => updateOverheadCost(key, 'year2', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Year 3 ($)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={data.overhead[key].year3 || ''}
                      onChange={(e) => updateOverheadCost(key, 'year3', Number(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

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
