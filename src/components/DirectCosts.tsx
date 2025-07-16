import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    </div>
  );
};

export default DirectCosts;