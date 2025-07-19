import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { DollarSign, TrendingDown, Calendar, Target, Trash2, Plus, Save } from 'lucide-react';
import { useFinancialData } from "@/hooks/useFinancialData";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface FundAllocation {
  id: string;
  category: string;
  description: string;
  amount: number;
  percentage: number;
  timeframe: string;
  priority: 'high' | 'medium' | 'low';
}

interface RunwayData {
  totalFunding: number;
  monthlyBurn: number;
  runway: number;
  milestones: {
    month: number;
    milestone: string;
    fundingNeeded: number;
  }[];
}

const FundUtilization = () => {
  
  const [totalFunding, setTotalFunding] = useState(2000000);
  const [fundAllocations, setFundAllocations] = useState<FundAllocation[]>([
    {
      id: '1',
      category: 'Product Development',
      description: 'Engineering team, product development, R&D',
      amount: 800000,
      percentage: 40,
      timeframe: '12-18 months',
      priority: 'high'
    },
    {
      id: '2',
      category: 'Sales & Marketing',
      description: 'Customer acquisition, marketing campaigns, sales team',
      amount: 600000,
      percentage: 30,
      timeframe: '12 months',
      priority: 'high'
    },
    {
      id: '3',
      category: 'Operations',
      description: 'Infrastructure, legal, compliance, general operations',
      amount: 300000,
      percentage: 15,
      timeframe: '18 months',
      priority: 'medium'
    },
    {
      id: '4',
      category: 'Working Capital',
      description: 'Cash reserves, unexpected expenses, opportunities',
      amount: 200000,
      percentage: 10,
      timeframe: '24 months',
      priority: 'medium'
    },
    {
      id: '5',
      category: 'Strategic Initiatives',
      description: 'New market expansion, partnerships, acquisitions',
      amount: 100000,
      percentage: 5,
      timeframe: '12-24 months',
      priority: 'low'
    }
  ]);

  const [runwayScenarios] = useState({
    conservative: {
      monthlyBurn: 120000,
      description: 'Conservative spending with minimal expansion'
    },
    moderate: {
      monthlyBurn: 150000,
      description: 'Balanced growth with controlled expansion'
    },
    aggressive: {
      monthlyBurn: 200000,
      description: 'Rapid expansion and market capture'
    }
  });

  const [newAllocation, setNewAllocation] = useState<Partial<FundAllocation>>({
    category: '',
    description: '',
    amount: 0,
    timeframe: '',
    priority: 'medium'
  });

  const calculateRunway = (monthlyBurn: number) => {
    return Math.floor(totalFunding / monthlyBurn);
  };

  const addAllocation = () => {
    if (newAllocation.category && newAllocation.amount) {
      const percentage = (newAllocation.amount! / totalFunding) * 100;
      setFundAllocations(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          category: newAllocation.category!,
          description: newAllocation.description || '',
          amount: newAllocation.amount!,
          percentage: percentage,
          timeframe: newAllocation.timeframe || '',
          priority: newAllocation.priority!
        }
      ]);
      setNewAllocation({ category: '', description: '', amount: 0, timeframe: '', priority: 'medium' });
    }
  };

  const removeAllocation = (id: string) => {
    setFundAllocations(prev => prev.filter(allocation => allocation.id !== id));
  };

  const updateAllocation = (id: string, field: keyof FundAllocation, value: any) => {
    setFundAllocations(prev => prev.map(allocation => 
      allocation.id === id 
        ? { 
            ...allocation, 
            [field]: value,
            percentage: field === 'amount' ? (value / totalFunding) * 100 : allocation.percentage
          }
        : allocation
    ));
  };

  // Recalculate percentages when total funding changes
  React.useEffect(() => {
    setFundAllocations(prev => prev.map(allocation => ({
      ...allocation,
      percentage: (allocation.amount / totalFunding) * 100
    })));
  }, [totalFunding]);

  const { user } = useAuth();
  const { saveFundUtilizationData } = useFinancialData(user?.id);
  const { toast } = useToast();

  const handleSave = async () => {
    if (user?.id && fundAllocations.length > 0) {
      try {
        const mappedAllocations = fundAllocations.map(allocation => ({
          category: allocation.category,
          description: allocation.description,
          amount: allocation.amount,
          percentage: allocation.percentage,
          timeline: allocation.timeframe
        }));
        await saveFundUtilizationData(mappedAllocations);
        toast({
          title: "Fund Utilization Saved",
          description: "Your fund utilization data has been saved successfully.",
        });
      } catch (error) {
        toast({
          title: "Save Error",
          description: "Failed to save fund utilization data.",
          variant: "destructive"
        });
      }
    }
  };

  const totalAllocated = fundAllocations.reduce((sum, allocation) => sum + allocation.amount, 0);
  const remainingFunds = totalFunding - totalAllocated;

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F'];

  const pieChartData = fundAllocations.map(allocation => ({
    name: allocation.category,
    value: allocation.amount,
    percentage: allocation.percentage
  }));

  const runwayComparison = Object.entries(runwayScenarios).map(([scenario, data]) => ({
    scenario: scenario.charAt(0).toUpperCase() + scenario.slice(1),
    monthlyBurn: data.monthlyBurn,
    runway: calculateRunway(data.monthlyBurn),
    description: data.description
  }));

  const milestoneData = [
    { month: 3, milestone: 'MVP Launch', fundingUsed: 450000 },
    { month: 6, milestone: 'First 1000 Customers', fundingUsed: 900000 },
    { month: 12, milestone: 'Break-even Point', fundingUsed: 1500000 },
    { month: 18, milestone: 'Series A Ready', fundingUsed: 1800000 },
  ];

  const burnRateProjection = Array.from({ length: 24 }, (_, index) => {
    const month = index + 1;
    const conservativeBurn = runwayScenarios.conservative.monthlyBurn * month;
    const moderateBurn = runwayScenarios.moderate.monthlyBurn * month;
    const aggressiveBurn = runwayScenarios.aggressive.monthlyBurn * month;
    
    return {
      month,
      conservative: Math.max(0, totalFunding - conservativeBurn),
      moderate: Math.max(0, totalFunding - moderateBurn),
      aggressive: Math.max(0, totalFunding - aggressiveBurn),
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Fund Utilization</h2>
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Fund Utilization
        </Button>
      </div>
      
      <Tabs defaultValue="allocation" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="allocation">Fund Allocation</TabsTrigger>
          <TabsTrigger value="runway">Runway Analysis</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
        </TabsList>

        <TabsContent value="allocation" className="space-y-6">
          {/* Total Funding Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Fund Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="totalFunding">Total Funding Raised ($)</Label>
                  <Input
                    id="totalFunding"
                    type="number"
                    value={totalFunding}
                    onChange={(e) => setTotalFunding(Number(e.target.value))}
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <div className="text-sm text-muted-foreground">Total Allocated</div>
                  <div className="text-lg font-semibold">${totalAllocated.toLocaleString()}</div>
                </div>
                <div className="flex flex-col justify-end">
                  <div className="text-sm text-muted-foreground">Remaining</div>
                  <div className={`text-lg font-semibold ${remainingFunds < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${remainingFunds.toLocaleString()}
                  </div>
                </div>
                <div className="flex flex-col justify-end">
                  <div className="text-sm text-muted-foreground">Allocation %</div>
                  <div className="text-lg font-semibold">
                    {((totalAllocated / totalFunding) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              {remainingFunds < 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800 text-sm">
                    ⚠️ Over-allocated by ${Math.abs(remainingFunds).toLocaleString()}. Please adjust allocations.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Allocation Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Fund Allocation Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => ['$' + value.toLocaleString(), 'Amount']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Allocation Table */}
            <Card>
              <CardHeader>
                <CardTitle>Allocation Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>%</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fundAllocations.map((allocation) => (
                      <TableRow key={allocation.id}>
                        <TableCell className="font-medium">{allocation.category}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={allocation.amount}
                            onChange={(e) => updateAllocation(allocation.id, 'amount', Number(e.target.value))}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>{allocation.percentage.toFixed(1)}%</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${
                            allocation.priority === 'high' ? 'bg-red-100 text-red-800' :
                            allocation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {allocation.priority}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAllocation(allocation.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Add New Allocation */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={newAllocation.category}
                    onChange={(e) => setNewAllocation(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., Technology"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newAllocation.description}
                    onChange={(e) => setNewAllocation(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description"
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newAllocation.amount}
                    onChange={(e) => setNewAllocation(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="timeframe">Timeframe</Label>
                  <Input
                    id="timeframe"
                    value={newAllocation.timeframe}
                    onChange={(e) => setNewAllocation(prev => ({ ...prev, timeframe: e.target.value }))}
                    placeholder="e.g., 12 months"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addAllocation} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="runway" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {runwayComparison.map((scenario, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {scenario.scenario} Scenario
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Monthly Burn Rate</div>
                      <div className="text-2xl font-bold">${scenario.monthlyBurn.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Runway</div>
                      <div className="text-2xl font-bold text-primary">{scenario.runway} months</div>
                    </div>
                    <div className="text-sm text-muted-foreground">{scenario.description}</div>
                    <Progress 
                      value={(scenario.runway / 24) * 100} 
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cash Burn Projection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={burnRateProjection}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => ['$' + value.toLocaleString(), 'Remaining Cash']} />
                    <Legend />
                    <Line type="monotone" dataKey="conservative" stroke="hsl(var(--primary))" name="Conservative" />
                    <Line type="monotone" dataKey="moderate" stroke="#8884d8" name="Moderate" />
                    <Line type="monotone" dataKey="aggressive" stroke="#ff7300" name="Aggressive" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Key Milestones & Funding Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timeline</TableHead>
                    <TableHead>Milestone</TableHead>
                    <TableHead>Cumulative Funding Used</TableHead>
                    <TableHead>% of Total Funding</TableHead>
                    <TableHead>Remaining Runway</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {milestoneData.map((milestone, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">Month {milestone.month}</TableCell>
                      <TableCell>{milestone.milestone}</TableCell>
                      <TableCell>${milestone.fundingUsed.toLocaleString()}</TableCell>
                      <TableCell>{((milestone.fundingUsed / totalFunding) * 100).toFixed(1)}%</TableCell>
                      <TableCell>${(totalFunding - milestone.fundingUsed).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Milestone Progress Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={milestoneData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="milestone" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => ['$' + value.toLocaleString(), 'Funding Used']} />
                    <Bar dataKey="fundingUsed" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Planning</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Best Case Scenario</h4>
                  <div className="text-sm space-y-2">
                    <p>• Revenue targets met ahead of schedule</p>
                    <p>• Lower customer acquisition costs</p>
                    <p>• Extended runway: 18-24 months</p>
                    <p>• Series A raised at higher valuation</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Worst Case Scenario</h4>
                  <div className="text-sm space-y-2">
                    <p>• Revenue targets missed</p>
                    <p>• Higher burn rate due to competition</p>
                    <p>• Runway shortened to 12-15 months</p>
                    <p>• Bridge funding required</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risk Mitigation Strategies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h5 className="font-medium mb-2">Revenue Risks</h5>
                    <ul className="text-sm space-y-1">
                      <li>• Diversify revenue streams</li>
                      <li>• Focus on recurring revenue</li>
                      <li>• Implement usage-based pricing</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h5 className="font-medium mb-2">Cost Management</h5>
                    <ul className="text-sm space-y-1">
                      <li>• Variable cost structure</li>
                      <li>• Performance-based hiring</li>
                      <li>• Flexible office arrangements</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h5 className="font-medium mb-2">Market Risks</h5>
                    <ul className="text-sm space-y-1">
                      <li>• Multiple go-to-market channels</li>
                      <li>• Geographic diversification</li>
                      <li>• Product feature flexibility</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h5 className="font-medium mb-2">Funding Risks</h5>
                    <ul className="text-sm space-y-1">
                      <li>• Multiple funding sources</li>
                      <li>• Revenue-based financing options</li>
                      <li>• Strategic partnerships</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FundUtilization;