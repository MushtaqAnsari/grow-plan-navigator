import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from 'lucide-react';

interface RevenueStream {
  name: string;
  year1: number;
  year2: number;
  year3: number;
  growthRate: number;
  // Industry-specific fields
  clients?: number;
  revenuePerClient?: number;
  churnRate?: number;
  conversionRate?: number;
  averageOrderValue?: number;
  unitsPerYear?: number;
  pricePerUnit?: number;
  billableHours?: number;
  hourlyRate?: number;
}

interface RevenueStreamsProps {
  data: RevenueStream[];
  onChange: (data: RevenueStream[]) => void;
  industry: string;
}

const RevenueStreams: React.FC<RevenueStreamsProps> = ({ data, onChange, industry }) => {
  const getEmptyStream = (): RevenueStream => ({
    name: '',
    year1: 0,
    year2: 0,
    year3: 0,
    growthRate: 0,
    clients: 0,
    revenuePerClient: 0,
    churnRate: 0,
    conversionRate: 0,
    averageOrderValue: 0,
    unitsPerYear: 0,
    pricePerUnit: 0,
    billableHours: 0,
    hourlyRate: 0
  });

  const [newStream, setNewStream] = useState<RevenueStream>(getEmptyStream());

  const addRevenueStream = () => {
    if (newStream.name) {
      onChange([...data, newStream]);
      setNewStream(getEmptyStream());
    }
  };

  const getIndustryFields = () => {
    switch (industry) {
      case 'saas':
        return [
          { key: 'clients', label: 'Number of Clients', placeholder: '100' },
          { key: 'revenuePerClient', label: 'Monthly Revenue per Client ($)', placeholder: '50' },
          { key: 'churnRate', label: 'Monthly Churn Rate (%)', placeholder: '5' }
        ];
      case 'ecommerce':
        return [
          { key: 'unitsPerYear', label: 'Units Sold per Year', placeholder: '1000' },
          { key: 'averageOrderValue', label: 'Average Order Value ($)', placeholder: '75' },
          { key: 'conversionRate', label: 'Conversion Rate (%)', placeholder: '2.5' }
        ];
      case 'consulting':
        return [
          { key: 'billableHours', label: 'Billable Hours per Year', placeholder: '1500' },
          { key: 'hourlyRate', label: 'Hourly Rate ($)', placeholder: '150' }
        ];
      case 'manufacturing':
        return [
          { key: 'unitsPerYear', label: 'Units Produced per Year', placeholder: '5000' },
          { key: 'pricePerUnit', label: 'Price per Unit ($)', placeholder: '25' }
        ];
      default:
        return [];
    }
  };

  const removeRevenueStream = (index: number) => {
    const updatedData = data.filter((_, i) => i !== index);
    onChange(updatedData);
  };

  const updateRevenueStream = (index: number, field: keyof RevenueStream, value: string | number) => {
    const updatedData = data.map((stream, i) => 
      i === index ? { ...stream, [field]: value } : stream
    );
    onChange(updatedData);
  };

  const totalRevenue = (year: 'year1' | 'year2' | 'year3') => {
    return data.reduce((sum, stream) => sum + stream[year], 0);
  };

  return (
    <div className="space-y-6">
      {/* Add New Revenue Stream */}
      <Card className="border-dashed border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Revenue Stream
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Basic Stream Info */}
            <div>
              <Label htmlFor="stream-name">Stream Name</Label>
              <Input
                id="stream-name"
                placeholder={industry === 'saas' ? 'e.g., Monthly Subscriptions' : 'e.g., Product Sales'}
                value={newStream.name}
                onChange={(e) => setNewStream({ ...newStream, name: e.target.value })}
              />
            </div>

            {/* Industry-specific fields */}
            {getIndustryFields().length > 0 && (
              <div>
                <h4 className="font-medium mb-3 text-slate-700 capitalize">{industry} Metrics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {getIndustryFields().map((field) => (
                    <div key={field.key}>
                      <Label>{field.label}</Label>
                      <Input
                        type="number"
                        placeholder={field.placeholder}
                        value={newStream[field.key as keyof RevenueStream] || ''}
                        onChange={(e) => setNewStream({ 
                          ...newStream, 
                          [field.key]: Number(e.target.value) 
                        })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Revenue projections */}
            <div>
              <h4 className="font-medium mb-3 text-slate-700">Revenue Projections</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="year1">Year 1 ($)</Label>
                  <Input
                    id="year1"
                    type="number"
                    placeholder="0"
                    value={newStream.year1 || ''}
                    onChange={(e) => setNewStream({ ...newStream, year1: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="year2">Year 2 ($)</Label>
                  <Input
                    id="year2"
                    type="number"
                    placeholder="0"
                    value={newStream.year2 || ''}
                    onChange={(e) => setNewStream({ ...newStream, year2: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="year3">Year 3 ($)</Label>
                  <Input
                    id="year3"
                    type="number"
                    placeholder="0"
                    value={newStream.year3 || ''}
                    onChange={(e) => setNewStream({ ...newStream, year3: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="growth-rate">Growth Rate (%)</Label>
                  <Input
                    id="growth-rate"
                    type="number"
                    placeholder="0"
                    value={newStream.growthRate || ''}
                    onChange={(e) => setNewStream({ ...newStream, growthRate: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <Button onClick={addRevenueStream} className="w-full">
              Add Revenue Stream
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Revenue Streams */}
      {data.map((stream, index) => (
        <Card key={index} className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">{stream.name}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeRevenueStream(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Year 1 ($)</Label>
                <Input
                  type="number"
                  value={stream.year1 || ''}
                  onChange={(e) => updateRevenueStream(index, 'year1', Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Year 2 ($)</Label>
                <Input
                  type="number"
                  value={stream.year2 || ''}
                  onChange={(e) => updateRevenueStream(index, 'year2', Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Year 3 ($)</Label>
                <Input
                  type="number"
                  value={stream.year3 || ''}
                  onChange={(e) => updateRevenueStream(index, 'year3', Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Growth Rate (%)</Label>
                <Input
                  type="number"
                  value={stream.growthRate || ''}
                  onChange={(e) => updateRevenueStream(index, 'growthRate', Number(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Revenue Summary */}
      {data.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Total Revenue Projection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  ${totalRevenue('year1').toLocaleString()}
                </p>
                <p className="text-sm text-green-700">Year 1</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  ${totalRevenue('year2').toLocaleString()}
                </p>
                <p className="text-sm text-green-700">Year 2</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  ${totalRevenue('year3').toLocaleString()}
                </p>
                <p className="text-sm text-green-700">Year 3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RevenueStreams;
