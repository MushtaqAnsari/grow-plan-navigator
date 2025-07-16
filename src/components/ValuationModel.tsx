import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Trash2, Plus, Users, TrendingUp, Percent } from 'lucide-react';

interface ShareClass {
  id: string;
  name: string;
  type: 'common' | 'preferred' | 'option-pool';
  shares: number;
  pricePerShare: number;
  liquidationPreference?: number;
  preferenceMultiple?: number;
  participationRights?: boolean;
}

interface Investment {
  id: string;
  investorName: string;
  round: string;
  amount: number;
  shareClass: string;
  shares: number;
  pricePerShare: number;
  date: string;
  valuation: number;
}

interface CapTableData {
  shareClasses: ShareClass[];
  investments: Investment[];
  companyValuation: number;
}

const ValuationModel = () => {
  const [capTableData, setCapTableData] = useState<CapTableData>({
    shareClasses: [
      {
        id: '1',
        name: 'Founder Shares',
        type: 'common',
        shares: 8000000,
        pricePerShare: 0.001
      },
      {
        id: '2',
        name: 'Employee Option Pool',
        type: 'option-pool',
        shares: 2000000,
        pricePerShare: 0.001
      }
    ],
    investments: [
      {
        id: '1',
        investorName: 'Founders',
        round: 'Initial',
        amount: 8000,
        shareClass: 'Founder Shares',
        shares: 8000000,
        pricePerShare: 0.001,
        date: '2024-01-01',
        valuation: 10000
      }
    ],
    companyValuation: 10000000
  });

  const [newShareClass, setNewShareClass] = useState<Partial<ShareClass>>({
    name: '',
    type: 'common',
    shares: 0,
    pricePerShare: 0
  });

  const [newInvestment, setNewInvestment] = useState<Partial<Investment>>({
    investorName: '',
    round: '',
    amount: 0,
    shareClass: '',
    date: ''
  });

  const totalShares = capTableData.shareClasses.reduce((sum, sc) => sum + sc.shares, 0);
  
  const addShareClass = () => {
    if (newShareClass.name && newShareClass.shares && newShareClass.pricePerShare) {
      setCapTableData(prev => ({
        ...prev,
        shareClasses: [
          ...prev.shareClasses,
          {
            id: Date.now().toString(),
            name: newShareClass.name!,
            type: newShareClass.type!,
            shares: newShareClass.shares!,
            pricePerShare: newShareClass.pricePerShare!,
            liquidationPreference: newShareClass.liquidationPreference,
            preferenceMultiple: newShareClass.preferenceMultiple,
            participationRights: newShareClass.participationRights
          }
        ]
      }));
      setNewShareClass({ name: '', type: 'common', shares: 0, pricePerShare: 0 });
    }
  };

  const addInvestment = () => {
    if (newInvestment.investorName && newInvestment.amount && newInvestment.shareClass) {
      const shareClass = capTableData.shareClasses.find(sc => sc.name === newInvestment.shareClass);
      if (shareClass) {
        const shares = newInvestment.amount! / shareClass.pricePerShare;
        setCapTableData(prev => ({
          ...prev,
          investments: [
            ...prev.investments,
            {
              id: Date.now().toString(),
              investorName: newInvestment.investorName!,
              round: newInvestment.round!,
              amount: newInvestment.amount!,
              shareClass: newInvestment.shareClass!,
              shares: shares,
              pricePerShare: shareClass.pricePerShare,
              date: newInvestment.date!,
              valuation: capTableData.companyValuation
            }
          ]
        }));
        setNewInvestment({ investorName: '', round: '', amount: 0, shareClass: '', date: '' });
      }
    }
  };

  const ownershipData = capTableData.shareClasses.map(sc => ({
    name: sc.name,
    shares: sc.shares,
    percentage: (sc.shares / totalShares) * 100,
    value: sc.shares * sc.pricePerShare
  }));

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

  const dilutionScenarios = [
    { scenario: 'Series A - $2M', newShares: 2000000, pricePerShare: 1.0 },
    { scenario: 'Series B - $5M', newShares: 2500000, pricePerShare: 2.0 },
    { scenario: 'Series C - $10M', newShares: 2000000, pricePerShare: 5.0 }
  ];

  const calculateDilution = (newShares: number) => {
    const newTotal = totalShares + newShares;
    return ownershipData.map(item => ({
      ...item,
      newPercentage: (item.shares / newTotal) * 100,
      dilution: ((item.shares / totalShares) * 100) - ((item.shares / newTotal) * 100)
    }));
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="cap-table" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cap-table">Cap Table</TabsTrigger>
          <TabsTrigger value="ownership">Ownership</TabsTrigger>
          <TabsTrigger value="dilution">Dilution Analysis</TabsTrigger>
          <TabsTrigger value="valuation">Valuation Model</TabsTrigger>
        </TabsList>

        <TabsContent value="cap-table" className="space-y-6">
          {/* Share Classes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Share Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Shares</TableHead>
                      <TableHead>Price/Share</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>% Ownership</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {capTableData.shareClasses.map((sc) => (
                      <TableRow key={sc.id}>
                        <TableCell className="font-medium">{sc.name}</TableCell>
                        <TableCell className="capitalize">{sc.type.replace('-', ' ')}</TableCell>
                        <TableCell>{sc.shares.toLocaleString()}</TableCell>
                        <TableCell>${sc.pricePerShare.toFixed(3)}</TableCell>
                        <TableCell>${(sc.shares * sc.pricePerShare).toLocaleString()}</TableCell>
                        <TableCell>{((sc.shares / totalShares) * 100).toFixed(2)}%</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCapTableData(prev => ({
                              ...prev,
                              shareClasses: prev.shareClasses.filter(s => s.id !== sc.id)
                            }))}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Add New Share Class */}
                <div className="border rounded-lg p-4 bg-muted/20">
                  <h4 className="font-medium mb-3">Add New Share Class</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div>
                      <Label htmlFor="className">Class Name</Label>
                      <Input
                        id="className"
                        value={newShareClass.name}
                        onChange={(e) => setNewShareClass(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Series A Preferred"
                      />
                    </div>
                    <div>
                      <Label htmlFor="classType">Type</Label>
                      <Select
                        value={newShareClass.type}
                        onValueChange={(value: 'common' | 'preferred' | 'option-pool') => 
                          setNewShareClass(prev => ({ ...prev, type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="common">Common</SelectItem>
                          <SelectItem value="preferred">Preferred</SelectItem>
                          <SelectItem value="option-pool">Option Pool</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="shares">Shares</Label>
                      <Input
                        id="shares"
                        type="number"
                        value={newShareClass.shares}
                        onChange={(e) => setNewShareClass(prev => ({ ...prev, shares: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="pricePerShare">Price/Share ($)</Label>
                      <Input
                        id="pricePerShare"
                        type="number"
                        step="0.001"
                        value={newShareClass.pricePerShare}
                        onChange={(e) => setNewShareClass(prev => ({ ...prev, pricePerShare: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={addShareClass} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Class
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Investments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Investment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Investor</TableHead>
                      <TableHead>Round</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Share Class</TableHead>
                      <TableHead>Shares</TableHead>
                      <TableHead>Price/Share</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {capTableData.investments.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">{inv.investorName}</TableCell>
                        <TableCell>{inv.round}</TableCell>
                        <TableCell>${inv.amount.toLocaleString()}</TableCell>
                        <TableCell>{inv.shareClass}</TableCell>
                        <TableCell>{inv.shares.toLocaleString()}</TableCell>
                        <TableCell>${inv.pricePerShare.toFixed(3)}</TableCell>
                        <TableCell>{inv.date}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCapTableData(prev => ({
                              ...prev,
                              investments: prev.investments.filter(i => i.id !== inv.id)
                            }))}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Add New Investment */}
                <div className="border rounded-lg p-4 bg-muted/20">
                  <h4 className="font-medium mb-3">Add New Investment</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div>
                      <Label htmlFor="investorName">Investor Name</Label>
                      <Input
                        id="investorName"
                        value={newInvestment.investorName}
                        onChange={(e) => setNewInvestment(prev => ({ ...prev, investorName: e.target.value }))}
                        placeholder="e.g., Venture Capital Fund"
                      />
                    </div>
                    <div>
                      <Label htmlFor="round">Round</Label>
                      <Input
                        id="round"
                        value={newInvestment.round}
                        onChange={(e) => setNewInvestment(prev => ({ ...prev, round: e.target.value }))}
                        placeholder="e.g., Series A"
                      />
                    </div>
                    <div>
                      <Label htmlFor="amount">Amount ($)</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={newInvestment.amount}
                        onChange={(e) => setNewInvestment(prev => ({ ...prev, amount: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="shareClassSelect">Share Class</Label>
                      <Select
                        value={newInvestment.shareClass}
                        onValueChange={(value) => setNewInvestment(prev => ({ ...prev, shareClass: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select share class" />
                        </SelectTrigger>
                        <SelectContent>
                          {capTableData.shareClasses.map((sc) => (
                            <SelectItem key={sc.id} value={sc.name}>{sc.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newInvestment.date}
                        onChange={(e) => setNewInvestment(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={addInvestment} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Investment
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ownership" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ownership Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ownershipData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="shares"
                        label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                      >
                        {ownershipData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any, name) => [value.toLocaleString(), name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ownership Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Share Class</TableHead>
                      <TableHead>Shares</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ownershipData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.shares.toLocaleString()}</TableCell>
                        <TableCell>{item.percentage.toFixed(2)}%</TableCell>
                        <TableCell>${item.value.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-semibold bg-muted/50">
                      <TableCell>Total</TableCell>
                      <TableCell>{totalShares.toLocaleString()}</TableCell>
                      <TableCell>100.00%</TableCell>
                      <TableCell>${ownershipData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dilution" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="w-5 h-5" />
                Dilution Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {dilutionScenarios.map((scenario, index) => {
                  const dilutionData = calculateDilution(scenario.newShares);
                  return (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">{scenario.scenario}</h4>
                      <div className="text-sm text-muted-foreground mb-3">
                        New shares: {scenario.newShares.toLocaleString()} at ${scenario.pricePerShare}/share
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Share Class</TableHead>
                            <TableHead>Current %</TableHead>
                            <TableHead>New %</TableHead>
                            <TableHead>Dilution</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dilutionData.map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">{item.name}</TableCell>
                              <TableCell>{item.percentage.toFixed(2)}%</TableCell>
                              <TableCell>{item.newPercentage.toFixed(2)}%</TableCell>
                              <TableCell className="text-red-600">-{item.dilution.toFixed(2)}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="valuation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Valuation Model</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="valuation">Current Company Valuation ($)</Label>
                    <Input
                      id="valuation"
                      type="number"
                      value={capTableData.companyValuation}
                      onChange={(e) => setCapTableData(prev => ({
                        ...prev,
                        companyValuation: Number(e.target.value)
                      }))}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Price per share: ${(capTableData.companyValuation / totalShares).toFixed(4)}</p>
                    <p>Total shares outstanding: {totalShares.toLocaleString()}</p>
                    <p>Market cap: ${capTableData.companyValuation.toLocaleString()}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Valuation Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Fully Diluted Shares:</span>
                      <span>{totalShares.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pre-money Valuation:</span>
                      <span>${capTableData.companyValuation.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Book Value per Share:</span>
                      <span>${(capTableData.companyValuation / totalShares).toFixed(4)}</span>
                    </div>
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

export default ValuationModel;