import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from 'lucide-react';

interface RevenueStream {
  name: string;
  // Calculated fields
  year1: number;
  year2: number;
  year3: number;
  growthRate: number;
  
  // SaaS specific
  startingClients?: number;
  endingClientsY1?: number;
  endingClientsY2?: number;
  endingClientsY3?: number;
  startingRevenuePerClient?: number;
  endingRevenuePerClientY1?: number;
  endingRevenuePerClientY2?: number;
  endingRevenuePerClientY3?: number;
  
  // E-commerce specific
  startingMonthlyOrders?: number;
  endingMonthlyOrdersY1?: number;
  endingMonthlyOrdersY2?: number;
  endingMonthlyOrdersY3?: number;
  startingAOV?: number;
  endingAOVY1?: number;
  endingAOVY2?: number;
  endingAOVY3?: number;
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
    startingClients: 0,
    endingClientsY1: 0,
    endingClientsY2: 0,
    endingClientsY3: 0,
    startingRevenuePerClient: 0,
    endingRevenuePerClientY1: 0,
    endingRevenuePerClientY2: 0,
    endingRevenuePerClientY3: 0,
    startingMonthlyOrders: 0,
    endingMonthlyOrdersY1: 0,
    endingMonthlyOrdersY2: 0,
    endingMonthlyOrdersY3: 0,
    startingAOV: 0,
    endingAOVY1: 0,
    endingAOVY2: 0,
    endingAOVY3: 0
  });

  const [newStream, setNewStream] = useState<RevenueStream>(getEmptyStream());

  const calculateRevenue = (stream: RevenueStream): RevenueStream => {
    let updatedStream = { ...stream };
    
    if (industry === 'saas' && stream.startingClients && stream.startingRevenuePerClient) {
      // Calculate SaaS revenue automatically
      const avgClientsY1 = ((stream.startingClients || 0) + (stream.endingClientsY1 || 0)) / 2;
      const avgRevenueY1 = ((stream.startingRevenuePerClient || 0) + (stream.endingRevenuePerClientY1 || 0)) / 2;
      updatedStream.year1 = avgClientsY1 * avgRevenueY1 * 12;
      
      const avgClientsY2 = ((stream.endingClientsY1 || 0) + (stream.endingClientsY2 || 0)) / 2;
      const avgRevenueY2 = ((stream.endingRevenuePerClientY1 || 0) + (stream.endingRevenuePerClientY2 || 0)) / 2;
      updatedStream.year2 = avgClientsY2 * avgRevenueY2 * 12;
      
      const avgClientsY3 = ((stream.endingClientsY2 || 0) + (stream.endingClientsY3 || 0)) / 2;
      const avgRevenueY3 = ((stream.endingRevenuePerClientY2 || 0) + (stream.endingRevenuePerClientY3 || 0)) / 2;
      updatedStream.year3 = avgClientsY3 * avgRevenueY3 * 12;
      
      // Calculate YoY growth rate
      if (updatedStream.year1 > 0 && updatedStream.year2 > 0) {
        updatedStream.growthRate = ((updatedStream.year2 - updatedStream.year1) / updatedStream.year1) * 100;
      }
    } else if (industry === 'ecommerce' && stream.startingMonthlyOrders && stream.startingAOV) {
      // Calculate e-commerce revenue automatically
      const avgOrdersY1 = ((stream.startingMonthlyOrders || 0) + (stream.endingMonthlyOrdersY1 || 0)) / 2;
      const avgAOVY1 = ((stream.startingAOV || 0) + (stream.endingAOVY1 || 0)) / 2;
      updatedStream.year1 = avgOrdersY1 * avgAOVY1 * 12;
      
      const avgOrdersY2 = ((stream.endingMonthlyOrdersY1 || 0) + (stream.endingMonthlyOrdersY2 || 0)) / 2;
      const avgAOVY2 = ((stream.endingAOVY1 || 0) + (stream.endingAOVY2 || 0)) / 2;
      updatedStream.year2 = avgOrdersY2 * avgAOVY2 * 12;
      
      const avgOrdersY3 = ((stream.endingMonthlyOrdersY2 || 0) + (stream.endingMonthlyOrdersY3 || 0)) / 2;
      const avgAOVY3 = ((stream.endingAOVY2 || 0) + (stream.endingAOVY3 || 0)) / 2;
      updatedStream.year3 = avgOrdersY3 * avgAOVY3 * 12;
      
      // Calculate YoY growth rate
      if (updatedStream.year1 > 0 && updatedStream.year2 > 0) {
        updatedStream.growthRate = ((updatedStream.year2 - updatedStream.year1) / updatedStream.year1) * 100;
      }
    }
    
    return updatedStream;
  };

  const addRevenueStream = () => {
    if (newStream.name) {
      const calculatedStream = calculateRevenue(newStream);
      onChange([...data, calculatedStream]);
      setNewStream(getEmptyStream());
    }
  };

  const renderSaaSFields = () => (
    <div className="space-y-4">
      <h4 className="font-medium mb-3 text-slate-700">SaaS Metrics</h4>
      <div className="grid grid-cols-2 gap-6">
        {/* Starting metrics */}
        <div className="space-y-3">
          <h5 className="font-medium text-sm text-slate-600">Starting (Month 1, Year 1)</h5>
          <div>
            <Label>Number of Clients</Label>
            <Input
              type="number"
              placeholder="10"
              value={newStream.startingClients || ''}
              onChange={(e) => setNewStream({ ...newStream, startingClients: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label>Monthly Revenue per Client ($)</Label>
            <Input
              type="number"
              placeholder="50"
              value={newStream.startingRevenuePerClient || ''}
              onChange={(e) => setNewStream({ ...newStream, startingRevenuePerClient: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Ending metrics for each year */}
        <div className="space-y-3">
          <h5 className="font-medium text-sm text-slate-600">Projections (End of Each Year)</h5>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Year 1 Clients</Label>
              <Input
                type="number"
                placeholder="50"
                value={newStream.endingClientsY1 || ''}
                onChange={(e) => setNewStream({ ...newStream, endingClientsY1: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label className="text-xs">Year 2 Clients</Label>
              <Input
                type="number"
                placeholder="150"
                value={newStream.endingClientsY2 || ''}
                onChange={(e) => setNewStream({ ...newStream, endingClientsY2: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label className="text-xs">Year 3 Clients</Label>
              <Input
                type="number"
                placeholder="400"
                value={newStream.endingClientsY3 || ''}
                onChange={(e) => setNewStream({ ...newStream, endingClientsY3: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Year 1 Revenue/Client ($)</Label>
              <Input
                type="number"
                placeholder="75"
                value={newStream.endingRevenuePerClientY1 || ''}
                onChange={(e) => setNewStream({ ...newStream, endingRevenuePerClientY1: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label className="text-xs">Year 2 Revenue/Client ($)</Label>
              <Input
                type="number"
                placeholder="100"
                value={newStream.endingRevenuePerClientY2 || ''}
                onChange={(e) => setNewStream({ ...newStream, endingRevenuePerClientY2: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label className="text-xs">Year 3 Revenue/Client ($)</Label>
              <Input
                type="number"
                placeholder="125"
                value={newStream.endingRevenuePerClientY3 || ''}
                onChange={(e) => setNewStream({ ...newStream, endingRevenuePerClientY3: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderECommerceFields = () => (
    <div className="space-y-4">
      <h4 className="font-medium mb-3 text-slate-700">E-commerce Metrics</h4>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <h5 className="font-medium text-sm text-slate-600">Starting (Month 1, Year 1)</h5>
          <div>
            <Label>Monthly Orders</Label>
            <Input
              type="number"
              placeholder="100"
              value={newStream.startingMonthlyOrders || ''}
              onChange={(e) => setNewStream({ ...newStream, startingMonthlyOrders: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label>Average Order Value ($)</Label>
            <Input
              type="number"
              placeholder="75"
              value={newStream.startingAOV || ''}
              onChange={(e) => setNewStream({ ...newStream, startingAOV: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="space-y-3">
          <h5 className="font-medium text-sm text-slate-600">Projections (End of Each Year)</h5>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Year 1 Orders</Label>
              <Input
                type="number"
                placeholder="500"
                value={newStream.endingMonthlyOrdersY1 || ''}
                onChange={(e) => setNewStream({ ...newStream, endingMonthlyOrdersY1: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label className="text-xs">Year 2 Orders</Label>
              <Input
                type="number"
                placeholder="1200"
                value={newStream.endingMonthlyOrdersY2 || ''}
                onChange={(e) => setNewStream({ ...newStream, endingMonthlyOrdersY2: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label className="text-xs">Year 3 Orders</Label>
              <Input
                type="number"
                placeholder="2500"
                value={newStream.endingMonthlyOrdersY3 || ''}
                onChange={(e) => setNewStream({ ...newStream, endingMonthlyOrdersY3: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Year 1 AOV ($)</Label>
              <Input
                type="number"
                placeholder="85"
                value={newStream.endingAOVY1 || ''}
                onChange={(e) => setNewStream({ ...newStream, endingAOVY1: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label className="text-xs">Year 2 AOV ($)</Label>
              <Input
                type="number"
                placeholder="95"
                value={newStream.endingAOVY2 || ''}
                onChange={(e) => setNewStream({ ...newStream, endingAOVY2: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label className="text-xs">Year 3 AOV ($)</Label>
              <Input
                type="number"
                placeholder="110"
                value={newStream.endingAOVY3 || ''}
                onChange={(e) => setNewStream({ ...newStream, endingAOVY3: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
            {industry === 'saas' && renderSaaSFields()}
            {industry === 'ecommerce' && renderECommerceFields()}

            {/* Show calculated revenue projections */}
            {(newStream.year1 > 0 || newStream.year2 > 0 || newStream.year3 > 0) && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3 text-green-800">Calculated Revenue Projections</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-green-600">
                      ${Math.round(calculateRevenue(newStream).year1).toLocaleString()}
                    </p>
                    <p className="text-sm text-green-700">Year 1</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">
                      ${Math.round(calculateRevenue(newStream).year2).toLocaleString()}
                    </p>
                    <p className="text-sm text-green-700">Year 2</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">
                      ${Math.round(calculateRevenue(newStream).year3).toLocaleString()}
                    </p>
                    <p className="text-sm text-green-700">Year 3</p>
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm text-green-600">
                    YoY Growth Rate: {Math.round(calculateRevenue(newStream).growthRate)}%
                  </p>
                </div>
              </div>
            )}

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
