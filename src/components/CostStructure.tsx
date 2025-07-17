import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { formatCurrency } from "@/lib/utils";

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
  team: {
    salaries: { year1: number; year2: number; year3: number; };
    benefits: { year1: number; year2: number; year3: number; };
    contractors: { year1: number; year2: number; year3: number; };
    training: { year1: number; year2: number; year3: number; };
    recruitment: { year1: number; year2: number; year3: number; };
  };
  admin: {
    rent: { year1: number; year2: number; year3: number; };
    utilities: { year1: number; year2: number; year3: number; };
    domesticTravel: { year1: number; year2: number; year3: number; };
    internationalTravel: { year1: number; year2: number; year3: number; };
    insurance: { year1: number; year2: number; year3: number; };
    legal: { year1: number; year2: number; year3: number; };
    accounting: { year1: number; year2: number; year3: number; };
    software: { year1: number; year2: number; year3: number; };
    equipment: { year1: number; year2: number; year3: number; };
    other: { year1: number; year2: number; year3: number; };
  };
  marketing: {
    isPercentageOfRevenue: boolean;
    percentageOfRevenue: number;
    manualBudget: { year1: number; year2: number; year3: number; };
    digitalAdvertising: { year1: number; year2: number; year3: number; };
    contentCreation: { year1: number; year2: number; year3: number; };
    events: { year1: number; year2: number; year3: number; };
    pr: { year1: number; year2: number; year3: number; };
    brandingDesign: { year1: number; year2: number; year3: number; };
    tools: { year1: number; year2: number; year3: number; };
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

  const updateTeamCost = (
    category: keyof CostData['team'], 
    year: 'year1' | 'year2' | 'year3', 
    value: number
  ) => {
    onChange({
      ...data,
      team: {
        ...data.team,
        [category]: {
          ...data.team[category],
          [year]: value
        }
      }
    });
  };

  const updateAdminCost = (
    category: keyof CostData['admin'], 
    year: 'year1' | 'year2' | 'year3', 
    value: number
  ) => {
    onChange({
      ...data,
      admin: {
        ...data.admin,
        [category]: {
          ...data.admin[category],
          [year]: value
        }
      }
    });
  };

  const updateMarketingCost = (
    category: keyof Omit<CostData['marketing'], 'isPercentageOfRevenue' | 'percentageOfRevenue'>, 
    year: 'year1' | 'year2' | 'year3', 
    value: number
  ) => {
    onChange({
      ...data,
      marketing: {
        ...data.marketing,
        [category]: {
          ...data.marketing[category],
          [year]: value
        }
      }
    });
  };

  const updateMarketingMode = (isPercentageOfRevenue: boolean) => {
    onChange({
      ...data,
      marketing: {
        ...data.marketing,
        isPercentageOfRevenue
      }
    });
  };

  const updateMarketingPercentage = (percentage: number) => {
    onChange({
      ...data,
      marketing: {
        ...data.marketing,
        percentageOfRevenue: percentage
      }
    });
  };

  const getTotalRevenue = (year: 'year1' | 'year2' | 'year3') => {
    return revenueStreams.reduce((sum, stream) => sum + stream[year], 0);
  };

  const getMarketingBudget = (year: 'year1' | 'year2' | 'year3') => {
    if (data.marketing.isPercentageOfRevenue) {
      return getTotalRevenue(year) * (data.marketing.percentageOfRevenue / 100);
    }
    return data.marketing.manualBudget[year];
  };

  const getTotalCosts = (year: 'year1' | 'year2' | 'year3') => {
    // Sum all direct costs
    const directCosts = Object.values(data.revenueStreamCosts).reduce((sum, stream) => {
      return sum + Object.values(stream.directCosts).reduce((streamSum, cost) => streamSum + cost[year], 0);
    }, 0);
    
    // Sum team costs
    const teamCosts = Object.values(data.team).reduce((sum, cost) => sum + cost[year], 0);
    
    // Sum admin costs
    const adminCosts = Object.values(data.admin).reduce((sum, cost) => sum + cost[year], 0);
    
    // Marketing costs
    const marketingCosts = getMarketingBudget(year);
    
    return directCosts + teamCosts + adminCosts + marketingCosts;
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

  const teamCategories = [
    { key: 'salaries' as keyof CostData['team'], label: 'Employee Salaries', color: 'border-blue-500' },
    { key: 'benefits' as keyof CostData['team'], label: 'Benefits & Healthcare', color: 'border-green-500' },
    { key: 'contractors' as keyof CostData['team'], label: 'Contractors & Freelancers', color: 'border-purple-500' },
    { key: 'training' as keyof CostData['team'], label: 'Training & Development', color: 'border-orange-500' },
    { key: 'recruitment' as keyof CostData['team'], label: 'Recruitment Costs', color: 'border-red-500' }
  ];

  const adminCategories = [
    { key: 'rent' as keyof CostData['admin'], label: 'Office Rent (Monthly)', color: 'border-blue-500' },
    { key: 'utilities' as keyof CostData['admin'], label: 'Utilities', color: 'border-green-500' },
    { key: 'domesticTravel' as keyof CostData['admin'], label: 'Domestic Travel', color: 'border-purple-500' },
    { key: 'internationalTravel' as keyof CostData['admin'], label: 'International Travel', color: 'border-orange-500' },
    { key: 'insurance' as keyof CostData['admin'], label: 'Insurance', color: 'border-red-500' },
    { key: 'legal' as keyof CostData['admin'], label: 'Legal & Professional Services', color: 'border-yellow-500' },
    { key: 'accounting' as keyof CostData['admin'], label: 'Accounting & Bookkeeping', color: 'border-indigo-500' },
    { key: 'software' as keyof CostData['admin'], label: 'Software & Subscriptions', color: 'border-pink-500' },
    { key: 'equipment' as keyof CostData['admin'], label: 'Equipment & Hardware', color: 'border-gray-500' },
    { key: 'other' as keyof CostData['admin'], label: 'Other Admin Expenses', color: 'border-cyan-500' }
  ];

  const marketingCategories = [
    { key: 'digitalAdvertising' as keyof Omit<CostData['marketing'], 'isPercentageOfRevenue' | 'percentageOfRevenue'>, label: 'Digital Advertising', color: 'border-blue-500' },
    { key: 'contentCreation' as keyof Omit<CostData['marketing'], 'isPercentageOfRevenue' | 'percentageOfRevenue'>, label: 'Content Creation', color: 'border-green-500' },
    { key: 'events' as keyof Omit<CostData['marketing'], 'isPercentageOfRevenue' | 'percentageOfRevenue'>, label: 'Events & Conferences', color: 'border-purple-500' },
    { key: 'pr' as keyof Omit<CostData['marketing'], 'isPercentageOfRevenue' | 'percentageOfRevenue'>, label: 'Public Relations', color: 'border-orange-500' },
    { key: 'brandingDesign' as keyof Omit<CostData['marketing'], 'isPercentageOfRevenue' | 'percentageOfRevenue'>, label: 'Branding & Design', color: 'border-red-500' },
    { key: 'tools' as keyof Omit<CostData['marketing'], 'isPercentageOfRevenue' | 'percentageOfRevenue'>, label: 'Marketing Tools & Software', color: 'border-yellow-500' },
    { key: 'other' as keyof Omit<CostData['marketing'], 'isPercentageOfRevenue' | 'percentageOfRevenue'>, label: 'Other Marketing Expenses', color: 'border-gray-500' }
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="direct" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="direct">Direct Costs</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
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

        <TabsContent value="team" className="space-y-6">
          {teamCategories.map(({ key, label, color }) => (
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
                      value={data.team[key].year1 || ''}
                      onChange={(e) => updateTeamCost(key, 'year1', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Year 2 ($)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={data.team[key].year2 || ''}
                      onChange={(e) => updateTeamCost(key, 'year2', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Year 3 ($)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={data.team[key].year3 || ''}
                      onChange={(e) => updateTeamCost(key, 'year3', Number(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="admin" className="space-y-6">
          {adminCategories.map(({ key, label, color }) => (
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
                      value={data.admin[key].year1 || ''}
                      onChange={(e) => updateAdminCost(key, 'year1', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Year 2 ($)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={data.admin[key].year2 || ''}
                      onChange={(e) => updateAdminCost(key, 'year2', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Year 3 ($)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={data.admin[key].year3 || ''}
                      onChange={(e) => updateAdminCost(key, 'year3', Number(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="marketing" className="space-y-6">
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="text-lg">Marketing Budget Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={data.marketing.isPercentageOfRevenue}
                  onCheckedChange={updateMarketingMode}
                />
                <Label>
                  {data.marketing.isPercentageOfRevenue ? 'Percentage of Revenue' : 'Manual Budget'}
                </Label>
              </div>
              
              {data.marketing.isPercentageOfRevenue ? (
                <div>
                  <Label>Marketing Budget (% of Revenue)</Label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={data.marketing.percentageOfRevenue || ''}
                    onChange={(e) => updateMarketingPercentage(Number(e.target.value))}
                  />
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Year 1: {formatCurrency(getMarketingBudget('year1'))}</p>
                    <p>Year 2: {formatCurrency(getMarketingBudget('year2'))}</p>
                    <p>Year 3: {formatCurrency(getMarketingBudget('year3'))}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <Label>Manual Marketing Budget</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    <div>
                      <Label className="text-xs text-gray-500">Year 1 ($)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={data.marketing.manualBudget.year1 || ''}
                        onChange={(e) => updateMarketingCost('manualBudget', 'year1', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Year 2 ($)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={data.marketing.manualBudget.year2 || ''}
                        onChange={(e) => updateMarketingCost('manualBudget', 'year2', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Year 3 ($)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={data.marketing.manualBudget.year3 || ''}
                        onChange={(e) => updateMarketingCost('manualBudget', 'year3', Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-sm text-gray-600 mb-4">
            <p className="font-medium">Marketing Budget Breakdown:</p>
            <p>Allocate your marketing budget across different channels below.</p>
          </div>

          {marketingCategories.map(({ key, label, color }) => (
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
                      value={data.marketing[key].year1 || ''}
                      onChange={(e) => updateMarketingCost(key, 'year1', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Year 2 ($)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={data.marketing[key].year2 || ''}
                      onChange={(e) => updateMarketingCost(key, 'year2', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Year 3 ($)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={data.marketing[key].year3 || ''}
                      onChange={(e) => updateMarketingCost(key, 'year3', Number(e.target.value))}
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
                {formatCurrency(getTotalCosts('year1'))}
              </p>
              <p className="text-sm text-red-700">Year 1</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(getTotalCosts('year2'))}
              </p>
              <p className="text-sm text-red-700">Year 2</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(getTotalCosts('year3'))}
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