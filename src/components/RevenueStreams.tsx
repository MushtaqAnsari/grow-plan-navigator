import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueStream {
  name: string;
  type: 'saas' | 'ecommerce' | 'advertising' | 'one-time' | 'consulting' | 'commission' | 'freemium';
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
  priceIncreaseRate?: number;
  
  // E-commerce specific
  startingMonthlyOrders?: number;
  endingMonthlyOrdersY1?: number;
  endingMonthlyOrdersY2?: number;
  endingMonthlyOrdersY3?: number;
  startingAOV?: number;
  aovIncreaseRate?: number;
  
  // Advertising specific
  monthlyImpressions?: number;
  cpmRate?: number;
  impressionGrowthRate?: number;
  
  // One-time specific
  unitsSoldY1?: number;
  unitsSoldY2?: number;
  unitsSoldY3?: number;
  pricePerUnit?: number;
  
  // Consulting specific
  billableHoursY1?: number;
  billableHoursY2?: number;
  billableHoursY3?: number;
  hourlyRate?: number;
  
  // Commission specific
  transactionVolumeY1?: number;
  transactionVolumeY2?: number;
  transactionVolumeY3?: number;
  commissionRate?: number;
}

interface RevenueStreamsProps {
  data: RevenueStream[];
  onChange: (data: RevenueStream[]) => void;
  industry: string;
}

const RevenueStreams: React.FC<RevenueStreamsProps> = ({ data, onChange, industry }) => {
  const getEmptyStream = (): RevenueStream => ({
    name: '',
    type: 'saas',
    year1: 0,
    year2: 0,
    year3: 0,
    growthRate: 0,
    startingClients: 0,
    endingClientsY1: 0,
    endingClientsY2: 0,
    endingClientsY3: 0,
    startingRevenuePerClient: 0,
    priceIncreaseRate: 0,
    startingMonthlyOrders: 0,
    endingMonthlyOrdersY1: 0,
    endingMonthlyOrdersY2: 0,
    endingMonthlyOrdersY3: 0,
    startingAOV: 0,
    aovIncreaseRate: 0,
    monthlyImpressions: 0,
    cpmRate: 0,
    impressionGrowthRate: 0,
    unitsSoldY1: 0,
    unitsSoldY2: 0,
    unitsSoldY3: 0,
    pricePerUnit: 0,
    billableHoursY1: 0,
    billableHoursY2: 0,
    billableHoursY3: 0,
    hourlyRate: 0,
    transactionVolumeY1: 0,
    transactionVolumeY2: 0,
    transactionVolumeY3: 0,
    commissionRate: 0
  });

  const [newStream, setNewStream] = useState<RevenueStream>(getEmptyStream());

  const calculateRevenue = (stream: RevenueStream): RevenueStream => {
    let updatedStream = { ...stream };
    
    switch (stream.type) {
      case 'saas':
        if (stream.startingClients && stream.startingRevenuePerClient) {
          const revenuePerClientY1 = (stream.startingRevenuePerClient || 0) * (1 + (stream.priceIncreaseRate || 0) / 100);
          const revenuePerClientY2 = revenuePerClientY1 * (1 + (stream.priceIncreaseRate || 0) / 100);
          const revenuePerClientY3 = revenuePerClientY2 * (1 + (stream.priceIncreaseRate || 0) / 100);
          
          const avgClientsY1 = ((stream.startingClients || 0) + (stream.endingClientsY1 || 0)) / 2;
          const avgClientsY2 = ((stream.endingClientsY1 || 0) + (stream.endingClientsY2 || 0)) / 2;
          const avgClientsY3 = ((stream.endingClientsY2 || 0) + (stream.endingClientsY3 || 0)) / 2;
          
          updatedStream.year1 = avgClientsY1 * revenuePerClientY1 * 12;
          updatedStream.year2 = avgClientsY2 * revenuePerClientY2 * 12;
          updatedStream.year3 = avgClientsY3 * revenuePerClientY3 * 12;
        }
        break;
        
      case 'ecommerce':
        if (stream.startingMonthlyOrders && stream.startingAOV) {
          const aovY1 = (stream.startingAOV || 0) * (1 + (stream.aovIncreaseRate || 0) / 100);
          const aovY2 = aovY1 * (1 + (stream.aovIncreaseRate || 0) / 100);
          const aovY3 = aovY2 * (1 + (stream.aovIncreaseRate || 0) / 100);
          
          const avgOrdersY1 = ((stream.startingMonthlyOrders || 0) + (stream.endingMonthlyOrdersY1 || 0)) / 2;
          const avgOrdersY2 = ((stream.endingMonthlyOrdersY1 || 0) + (stream.endingMonthlyOrdersY2 || 0)) / 2;
          const avgOrdersY3 = ((stream.endingMonthlyOrdersY2 || 0) + (stream.endingMonthlyOrdersY3 || 0)) / 2;
          
          updatedStream.year1 = avgOrdersY1 * aovY1 * 12;
          updatedStream.year2 = avgOrdersY2 * aovY2 * 12;
          updatedStream.year3 = avgOrdersY3 * aovY3 * 12;
        }
        break;
        
      case 'advertising':
        if (stream.monthlyImpressions && stream.cpmRate) {
          const baseRevenue = (stream.monthlyImpressions || 0) * (stream.cpmRate || 0) / 1000 * 12;
          updatedStream.year1 = baseRevenue;
          updatedStream.year2 = baseRevenue * (1 + (stream.impressionGrowthRate || 0) / 100);
          updatedStream.year3 = updatedStream.year2 * (1 + (stream.impressionGrowthRate || 0) / 100);
        }
        break;
        
      case 'one-time':
        updatedStream.year1 = (stream.unitsSoldY1 || 0) * (stream.pricePerUnit || 0);
        updatedStream.year2 = (stream.unitsSoldY2 || 0) * (stream.pricePerUnit || 0);
        updatedStream.year3 = (stream.unitsSoldY3 || 0) * (stream.pricePerUnit || 0);
        break;
        
      case 'consulting':
        updatedStream.year1 = (stream.billableHoursY1 || 0) * (stream.hourlyRate || 0);
        updatedStream.year2 = (stream.billableHoursY2 || 0) * (stream.hourlyRate || 0);
        updatedStream.year3 = (stream.billableHoursY3 || 0) * (stream.hourlyRate || 0);
        break;
        
      case 'commission':
        updatedStream.year1 = (stream.transactionVolumeY1 || 0) * (stream.commissionRate || 0) / 100;
        updatedStream.year2 = (stream.transactionVolumeY2 || 0) * (stream.commissionRate || 0) / 100;
        updatedStream.year3 = (stream.transactionVolumeY3 || 0) * (stream.commissionRate || 0) / 100;
        break;
    }
    
    // Calculate YoY growth rate
    if (updatedStream.year1 > 0 && updatedStream.year2 > 0) {
      updatedStream.growthRate = ((updatedStream.year2 - updatedStream.year1) / updatedStream.year1) * 100;
    }
    
    return updatedStream;
  };

  const getChartData = () => {
    const calculated = calculateRevenue(newStream);
    return [
      { year: 'Year 1', revenue: Math.round(calculated.year1) },
      { year: 'Year 2', revenue: Math.round(calculated.year2) },
      { year: 'Year 3', revenue: Math.round(calculated.year3) }
    ];
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
        {/* Starting metrics and growth */}
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
          <div>
            <Label>Yearly Price Increase (%)</Label>
            <Input
              type="number"
              placeholder="10"
              value={newStream.priceIncreaseRate || ''}
              onChange={(e) => setNewStream({ ...newStream, priceIncreaseRate: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Client growth projections */}
        <div className="space-y-3">
          <h5 className="font-medium text-sm text-slate-600">Client Growth Projections</h5>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">End Year 1</Label>
              <Input
                type="number"
                placeholder="50"
                value={newStream.endingClientsY1 || ''}
                onChange={(e) => setNewStream({ ...newStream, endingClientsY1: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label className="text-xs">End Year 2</Label>
              <Input
                type="number"
                placeholder="150"
                value={newStream.endingClientsY2 || ''}
                onChange={(e) => setNewStream({ ...newStream, endingClientsY2: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label className="text-xs">End Year 3</Label>
              <Input
                type="number"
                placeholder="400"
                value={newStream.endingClientsY3 || ''}
                onChange={(e) => setNewStream({ ...newStream, endingClientsY3: Number(e.target.value) })}
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
          <div>
            <Label>Yearly AOV Increase (%)</Label>
            <Input
              type="number"
              placeholder="8"
              value={newStream.aovIncreaseRate || ''}
              onChange={(e) => setNewStream({ ...newStream, aovIncreaseRate: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="space-y-3">
          <h5 className="font-medium text-sm text-slate-600">Order Growth Projections</h5>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">End Year 1</Label>
              <Input
                type="number"
                placeholder="500"
                value={newStream.endingMonthlyOrdersY1 || ''}
                onChange={(e) => setNewStream({ ...newStream, endingMonthlyOrdersY1: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label className="text-xs">End Year 2</Label>
              <Input
                type="number"
                placeholder="1200"
                value={newStream.endingMonthlyOrdersY2 || ''}
                onChange={(e) => setNewStream({ ...newStream, endingMonthlyOrdersY2: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label className="text-xs">End Year 3</Label>
              <Input
                type="number"
                placeholder="2500"
                value={newStream.endingMonthlyOrdersY3 || ''}
                onChange={(e) => setNewStream({ ...newStream, endingMonthlyOrdersY3: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdvertisingFields = () => (
    <div className="space-y-4">
      <h4 className="font-medium mb-3 text-slate-700">Advertising Revenue</h4>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Monthly Impressions</Label>
          <Input
            type="number"
            placeholder="1000000"
            value={newStream.monthlyImpressions || ''}
            onChange={(e) => setNewStream({ ...newStream, monthlyImpressions: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>CPM Rate ($)</Label>
          <Input
            type="number"
            placeholder="2.50"
            value={newStream.cpmRate || ''}
            onChange={(e) => setNewStream({ ...newStream, cpmRate: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>Yearly Growth (%)</Label>
          <Input
            type="number"
            placeholder="25"
            value={newStream.impressionGrowthRate || ''}
            onChange={(e) => setNewStream({ ...newStream, impressionGrowthRate: Number(e.target.value) })}
          />
        </div>
      </div>
    </div>
  );

  const renderOneTimeFields = () => (
    <div className="space-y-4">
      <h4 className="font-medium mb-3 text-slate-700">One-time Sales</h4>
      <div className="grid grid-cols-4 gap-4">
        <div>
          <Label>Price per Unit ($)</Label>
          <Input
            type="number"
            placeholder="299"
            value={newStream.pricePerUnit || ''}
            onChange={(e) => setNewStream({ ...newStream, pricePerUnit: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>Units Sold Year 1</Label>
          <Input
            type="number"
            placeholder="100"
            value={newStream.unitsSoldY1 || ''}
            onChange={(e) => setNewStream({ ...newStream, unitsSoldY1: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>Units Sold Year 2</Label>
          <Input
            type="number"
            placeholder="250"
            value={newStream.unitsSoldY2 || ''}
            onChange={(e) => setNewStream({ ...newStream, unitsSoldY2: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>Units Sold Year 3</Label>
          <Input
            type="number"
            placeholder="500"
            value={newStream.unitsSoldY3 || ''}
            onChange={(e) => setNewStream({ ...newStream, unitsSoldY3: Number(e.target.value) })}
          />
        </div>
      </div>
    </div>
  );

  const renderConsultingFields = () => (
    <div className="space-y-4">
      <h4 className="font-medium mb-3 text-slate-700">Consulting/Services</h4>
      <div className="grid grid-cols-4 gap-4">
        <div>
          <Label>Hourly Rate ($)</Label>
          <Input
            type="number"
            placeholder="150"
            value={newStream.hourlyRate || ''}
            onChange={(e) => setNewStream({ ...newStream, hourlyRate: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>Billable Hours Year 1</Label>
          <Input
            type="number"
            placeholder="800"
            value={newStream.billableHoursY1 || ''}
            onChange={(e) => setNewStream({ ...newStream, billableHoursY1: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>Billable Hours Year 2</Label>
          <Input
            type="number"
            placeholder="1200"
            value={newStream.billableHoursY2 || ''}
            onChange={(e) => setNewStream({ ...newStream, billableHoursY2: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>Billable Hours Year 3</Label>
          <Input
            type="number"
            placeholder="1600"
            value={newStream.billableHoursY3 || ''}
            onChange={(e) => setNewStream({ ...newStream, billableHoursY3: Number(e.target.value) })}
          />
        </div>
      </div>
    </div>
  );

  const renderCommissionFields = () => (
    <div className="space-y-4">
      <h4 className="font-medium mb-3 text-slate-700">Commission/Marketplace</h4>
      <div className="grid grid-cols-4 gap-4">
        <div>
          <Label>Commission Rate (%)</Label>
          <Input
            type="number"
            placeholder="5"
            value={newStream.commissionRate || ''}
            onChange={(e) => setNewStream({ ...newStream, commissionRate: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>Transaction Volume Year 1 ($)</Label>
          <Input
            type="number"
            placeholder="100000"
            value={newStream.transactionVolumeY1 || ''}
            onChange={(e) => setNewStream({ ...newStream, transactionVolumeY1: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>Transaction Volume Year 2 ($)</Label>
          <Input
            type="number"
            placeholder="300000"
            value={newStream.transactionVolumeY2 || ''}
            onChange={(e) => setNewStream({ ...newStream, transactionVolumeY2: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>Transaction Volume Year 3 ($)</Label>
          <Input
            type="number"
            placeholder="750000"
            value={newStream.transactionVolumeY3 || ''}
            onChange={(e) => setNewStream({ ...newStream, transactionVolumeY3: Number(e.target.value) })}
          />
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stream-name">Stream Name</Label>
                <Input
                  id="stream-name"
                  placeholder="e.g., Monthly Subscriptions"
                  value={newStream.name}
                  onChange={(e) => setNewStream({ ...newStream, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="stream-type">Revenue Stream Type</Label>
                <Select value={newStream.type} onValueChange={(value: any) => setNewStream({ ...newStream, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select revenue type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saas">SaaS (Subscription)</SelectItem>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                    <SelectItem value="advertising">Advertising Revenue</SelectItem>
                    <SelectItem value="one-time">One-time Sales</SelectItem>
                    <SelectItem value="consulting">Consulting/Services</SelectItem>
                    <SelectItem value="commission">Commission/Marketplace</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Type-specific fields */}
            {newStream.type === 'saas' && renderSaaSFields()}
            {newStream.type === 'ecommerce' && renderECommerceFields()}
            {newStream.type === 'advertising' && renderAdvertisingFields()}
            {newStream.type === 'one-time' && renderOneTimeFields()}
            {newStream.type === 'consulting' && renderConsultingFields()}
            {newStream.type === 'commission' && renderCommissionFields()}

            {/* Show calculated revenue projections with chart */}
            {(calculateRevenue(newStream).year1 > 0 || calculateRevenue(newStream).year2 > 0 || calculateRevenue(newStream).year3 > 0) && (
              <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-lg border">
                <h4 className="font-medium mb-4 text-slate-800">Revenue Projections</h4>
                
                {/* Chart */}
                <div className="h-64 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="year" stroke="#64748b" />
                      <YAxis 
                        stroke="#64748b"
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                        labelStyle={{ color: '#1e293b' }}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#059669" 
                        strokeWidth={3}
                        dot={{ fill: '#059669', strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, stroke: '#059669', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Numbers */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xl font-bold text-green-600">
                      ${Math.round(calculateRevenue(newStream).year1).toLocaleString()}
                    </p>
                    <p className="text-sm text-green-700">Year 1</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-green-600">
                      ${Math.round(calculateRevenue(newStream).year2).toLocaleString()}
                    </p>
                    <p className="text-sm text-green-700">Year 2</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-green-600">
                      ${Math.round(calculateRevenue(newStream).year3).toLocaleString()}
                    </p>
                    <p className="text-sm text-green-700">Year 3</p>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <p className="text-sm text-green-600 font-medium">
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
