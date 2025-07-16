import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Trash2, Plus, Users, TrendingUp, Percent, Calculator, FileText, Settings, Share2 } from 'lucide-react';
import { useFinancialData } from "@/hooks/useFinancialData";
import { useAuth } from "@/hooks/useAuth";

interface Stakeholder {
  id: string;
  name: string;
  type: 'founder' | 'employee' | 'investor' | 'advisor' | 'esop';
  email?: string;
  sharesOwned: number;
  shareClass: string;
  vestingSchedule?: {
    totalShares: number;
    vestedShares: number;
    startDate: string;
    cliffMonths: number;
    vestingMonths: number;
  };
  investmentAmount?: number;
  investmentDate?: string;
}

interface ShareClass {
  id: string;
  name: string;
  type: 'common' | 'preferred' | 'esop' | 'safe';
  sharesAuthorized: number;
  sharesIssued: number;
  pricePerShare: number;
  liquidationPreference?: number;
  dividendRate?: number;
  participationRights?: 'participating' | 'non-participating';
  antidilutionProvision?: 'weighted-average' | 'full-ratchet' | 'none';
  votingRights?: boolean;
}

interface SAFEAgreement {
  id: string;
  investorName: string;
  amount: number;
  valuationCap?: number;
  discountRate?: number;
  conversionTrigger: 'equity-round' | 'liquidity-event' | 'maturity';
  date: string;
  status: 'active' | 'converted' | 'expired';
}

interface FundingRound {
  id: string;
  name: string;
  amount: number;
  preMoneyValuation: number;
  postMoneyValuation: number;
  shareClass: string;
  leadInvestor: string;
  date: string;
  status: 'planned' | 'active' | 'closed';
}

interface CapTableData {
  companyName: string;
  shareClasses: ShareClass[];
  stakeholders: Stakeholder[];
  safeAgreements: SAFEAgreement[];
  fundingRounds: FundingRound[];
  esopPool: {
    totalShares: number;
    allocatedShares: number;
    availableShares: number;
    poolPercentage: number;
  };
}

const ValuationModel = () => {
  const { user } = useAuth();
  const { saveCapTableData } = useFinancialData(user?.id);
  const [capTableData, setCapTableData] = useState<CapTableData>({
    companyName: "Your Startup",
    shareClasses: [
      {
        id: '1',
        name: 'Common Stock',
        type: 'common',
        sharesAuthorized: 10000000,
        sharesIssued: 8000000,
        pricePerShare: 0.001,
        votingRights: true
      },
      {
        id: '2',
        name: 'ESOP Pool',
        type: 'esop',
        sharesAuthorized: 2000000,
        sharesIssued: 500000,
        pricePerShare: 0.001,
        votingRights: false
      }
    ],
    stakeholders: [
      {
        id: '1',
        name: 'John Doe',
        type: 'founder',
        email: 'john@startup.com',
        sharesOwned: 6000000,
        shareClass: 'Common Stock',
        vestingSchedule: {
          totalShares: 6000000,
          vestedShares: 1500000,
          startDate: '2024-01-01',
          cliffMonths: 12,
          vestingMonths: 48
        }
      },
      {
        id: '2',
        name: 'Jane Smith',
        type: 'founder',
        email: 'jane@startup.com',
        sharesOwned: 2000000,
        shareClass: 'Common Stock',
        vestingSchedule: {
          totalShares: 2000000,
          vestedShares: 500000,
          startDate: '2024-01-01',
          cliffMonths: 12,
          vestingMonths: 48
        }
      }
    ],
    safeAgreements: [
      {
        id: '1',
        investorName: 'Angel Investor',
        amount: 100000,
        valuationCap: 5000000,
        discountRate: 20,
        conversionTrigger: 'equity-round',
        date: '2024-03-15',
        status: 'active'
      }
    ],
    fundingRounds: [],
    esopPool: {
      totalShares: 2000000,
      allocatedShares: 500000,
      availableShares: 1500000,
      poolPercentage: 20
    }
  });

  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [newFundingRound, setNewFundingRound] = useState<Partial<FundingRound>>({
    name: '',
    amount: 0,
    preMoneyValuation: 0,
    shareClass: '',
    leadInvestor: '',
    date: ''
  });

  const [newSAFE, setNewSAFE] = useState<Partial<SAFEAgreement>>({
    investorName: '',
    amount: 0,
    valuationCap: 0,
    discountRate: 0,
    date: ''
  });

  const [newStakeholder, setNewStakeholder] = useState<Partial<Stakeholder>>({
    name: '',
    type: 'employee',
    email: '',
    sharesOwned: 0,
    shareClass: ''
  });

  const totalSharesIssued = capTableData.shareClasses.reduce((sum, sc) => sum + sc.sharesIssued, 0);
  const totalSAFEAmount = capTableData.safeAgreements
    .filter(safe => safe.status === 'active')
    .reduce((sum, safe) => sum + safe.amount, 0);

  // Auto-save cap table data to database when it changes
  useEffect(() => {
    if (user?.id && capTableData.stakeholders.length > 0) {
      const timeoutId = setTimeout(() => {
        saveCapTableData(capTableData.stakeholders, capTableData.safeAgreements);
      }, 1000); // Auto-save after 1 second of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [capTableData.stakeholders, capTableData.safeAgreements, user?.id, saveCapTableData]);

  const calculateOwnershipPercentages = () => {
    return capTableData.stakeholders.map(stakeholder => ({
      ...stakeholder,
      ownershipPercentage: (stakeholder.sharesOwned / totalSharesIssued) * 100
    }));
  };

  const calculateProFormaOwnership = (fundingRound: Partial<FundingRound>) => {
    if (!fundingRound.amount || !fundingRound.preMoneyValuation) return [];

    const preMoney = fundingRound.preMoneyValuation;
    const newInvestment = fundingRound.amount;
    const postMoney = preMoney + newInvestment;
    
    // Calculate new shares to be issued
    const newSharePrice = postMoney / (totalSharesIssued + (newInvestment / (postMoney / totalSharesIssued)));
    const newShares = newInvestment / newSharePrice;
    const newTotalShares = totalSharesIssued + newShares;

    // Calculate SAFE conversions
    const convertedSAFEs = capTableData.safeAgreements
      .filter(safe => safe.status === 'active')
      .map(safe => {
        const conversionPrice = safe.valuationCap ? 
          Math.min(newSharePrice, (safe.valuationCap / totalSharesIssued)) : 
          newSharePrice * (1 - (safe.discountRate || 0) / 100);
        const convertedShares = safe.amount / conversionPrice;
        return { ...safe, convertedShares, conversionPrice };
      });

    const totalConvertedShares = convertedSAFEs.reduce((sum, safe) => sum + safe.convertedShares, 0);
    const finalTotalShares = newTotalShares + totalConvertedShares;

    return capTableData.stakeholders.map(stakeholder => ({
      ...stakeholder,
      currentOwnership: (stakeholder.sharesOwned / totalSharesIssued) * 100,
      proFormaOwnership: (stakeholder.sharesOwned / finalTotalShares) * 100,
      dilution: ((stakeholder.sharesOwned / totalSharesIssued) - (stakeholder.sharesOwned / finalTotalShares)) * 100
    }));
  };

  const addFundingRound = () => {
    if (newFundingRound.name && newFundingRound.amount && newFundingRound.preMoneyValuation) {
      const postMoneyValuation = newFundingRound.preMoneyValuation + newFundingRound.amount;
      setCapTableData(prev => ({
        ...prev,
        fundingRounds: [
          ...prev.fundingRounds,
          {
            id: Date.now().toString(),
            ...newFundingRound as FundingRound,
            postMoneyValuation,
            status: 'planned'
          }
        ]
      }));
      setNewFundingRound({ name: '', amount: 0, preMoneyValuation: 0, shareClass: '', leadInvestor: '', date: '' });
    }
  };

  const addSAFE = () => {
    if (newSAFE.investorName && newSAFE.amount) {
      setCapTableData(prev => ({
        ...prev,
        safeAgreements: [
          ...prev.safeAgreements,
          {
            id: Date.now().toString(),
            ...newSAFE as SAFEAgreement,
            conversionTrigger: 'equity-round',
            status: 'active'
          }
        ]
      }));
      setNewSAFE({ investorName: '', amount: 0, valuationCap: 0, discountRate: 0, date: '' });
    }
  };

  const addStakeholder = () => {
    if (newStakeholder.name && newStakeholder.sharesOwned && newStakeholder.shareClass) {
      setCapTableData(prev => ({
        ...prev,
        stakeholders: [
          ...prev.stakeholders,
          {
            id: Date.now().toString(),
            ...newStakeholder as Stakeholder
          }
        ]
      }));
      setNewStakeholder({ name: '', type: 'employee', email: '', sharesOwned: 0, shareClass: '' });
    }
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff6b6b', '#4ecdc4'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{capTableData.companyName} - Cap Table</h2>
          <p className="text-muted-foreground">Professional equity management and scenario modeling</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share View
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="cap-table" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="cap-table">Cap Table</TabsTrigger>
          <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
          <TabsTrigger value="safe">SAFE & Convertibles</TabsTrigger>
          <TabsTrigger value="scenarios">Scenario Modeling</TabsTrigger>
          <TabsTrigger value="ownership">Ownership</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="cap-table" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Total Shares Issued</span>
                </div>
                <div className="text-2xl font-bold mt-1">{totalSharesIssued.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Active SAFEs</span>
                </div>
                <div className="text-2xl font-bold mt-1">${totalSAFEAmount.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Percent className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">ESOP Available</span>
                </div>
                <div className="text-2xl font-bold mt-1">{((capTableData.esopPool.availableShares / totalSharesIssued) * 100).toFixed(1)}%</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Share Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Authorized</TableHead>
                    <TableHead>Issued</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Price/Share</TableHead>
                    <TableHead>Voting Rights</TableHead>
                    <TableHead>Liquidation Preference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {capTableData.shareClasses.map((sc) => (
                    <TableRow key={sc.id}>
                      <TableCell className="font-medium">{sc.name}</TableCell>
                      <TableCell>
                        <Badge variant={sc.type === 'common' ? 'default' : sc.type === 'preferred' ? 'secondary' : 'outline'}>
                          {sc.type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{sc.sharesAuthorized.toLocaleString()}</TableCell>
                      <TableCell>{sc.sharesIssued.toLocaleString()}</TableCell>
                      <TableCell>{(sc.sharesAuthorized - sc.sharesIssued).toLocaleString()}</TableCell>
                      <TableCell>${sc.pricePerShare.toFixed(3)}</TableCell>
                      <TableCell>{sc.votingRights ? '✓' : '✗'}</TableCell>
                      <TableCell>{sc.liquidationPreference ? `${sc.liquidationPreference}x` : 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stakeholders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stakeholder Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Shares Owned</TableHead>
                    <TableHead>Share Class</TableHead>
                    <TableHead>Ownership %</TableHead>
                    <TableHead>Vesting Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calculateOwnershipPercentages().map((stakeholder) => (
                    <TableRow key={stakeholder.id}>
                      <TableCell className="font-medium">{stakeholder.name}</TableCell>
                      <TableCell>
                        <Badge variant={stakeholder.type === 'founder' ? 'default' : 'outline'}>
                          {stakeholder.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{stakeholder.email || 'N/A'}</TableCell>
                      <TableCell>{stakeholder.sharesOwned.toLocaleString()}</TableCell>
                      <TableCell>{stakeholder.shareClass}</TableCell>
                      <TableCell>{stakeholder.ownershipPercentage.toFixed(2)}%</TableCell>
                      <TableCell>
                        {stakeholder.vestingSchedule ? (
                          <div className="text-sm">
                            <div>{stakeholder.vestingSchedule.vestedShares.toLocaleString()} vested</div>
                            <div className="text-muted-foreground">
                              of {stakeholder.vestingSchedule.totalShares.toLocaleString()}
                            </div>
                          </div>
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="border rounded-lg p-4 bg-muted/20 mt-6">
                <h4 className="font-medium mb-3">Add New Stakeholder</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={newStakeholder.name}
                      onChange={(e) => setNewStakeholder(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={newStakeholder.type}
                      onValueChange={(value: any) => setNewStakeholder(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="founder">Founder</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="investor">Investor</SelectItem>
                        <SelectItem value="advisor">Advisor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={newStakeholder.email}
                      onChange={(e) => setNewStakeholder(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@company.com"
                    />
                  </div>
                  <div>
                    <Label>Shares</Label>
                    <Input
                      type="number"
                      value={newStakeholder.sharesOwned}
                      onChange={(e) => setNewStakeholder(prev => ({ ...prev, sharesOwned: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label>Share Class</Label>
                    <Select
                      value={newStakeholder.shareClass}
                      onValueChange={(value) => setNewStakeholder(prev => ({ ...prev, shareClass: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {capTableData.shareClasses.map((sc) => (
                          <SelectItem key={sc.id} value={sc.name}>{sc.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addStakeholder} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="safe" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SAFE Agreements & Convertible Securities</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Investor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Valuation Cap</TableHead>
                    <TableHead>Discount Rate</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {capTableData.safeAgreements.map((safe) => (
                    <TableRow key={safe.id}>
                      <TableCell className="font-medium">{safe.investorName}</TableCell>
                      <TableCell>${safe.amount.toLocaleString()}</TableCell>
                      <TableCell>${safe.valuationCap?.toLocaleString() || 'None'}</TableCell>
                      <TableCell>{safe.discountRate ? `${safe.discountRate}%` : 'None'}</TableCell>
                      <TableCell>{safe.date}</TableCell>
                      <TableCell>
                        <Badge variant={safe.status === 'active' ? 'default' : 'outline'}>
                          {safe.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Convert
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="border rounded-lg p-4 bg-muted/20 mt-6">
                <h4 className="font-medium mb-3">Add New SAFE</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div>
                    <Label>Investor Name</Label>
                    <Input
                      value={newSAFE.investorName}
                      onChange={(e) => setNewSAFE(prev => ({ ...prev, investorName: e.target.value }))}
                      placeholder="Investor name"
                    />
                  </div>
                  <div>
                    <Label>Amount ($)</Label>
                    <Input
                      type="number"
                      value={newSAFE.amount}
                      onChange={(e) => setNewSAFE(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label>Valuation Cap ($)</Label>
                    <Input
                      type="number"
                      value={newSAFE.valuationCap}
                      onChange={(e) => setNewSAFE(prev => ({ ...prev, valuationCap: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label>Discount Rate (%)</Label>
                    <Input
                      type="number"
                      value={newSAFE.discountRate}
                      onChange={(e) => setNewSAFE(prev => ({ ...prev, discountRate: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={newSAFE.date}
                      onChange={(e) => setNewSAFE(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addSAFE} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add SAFE
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Funding Round Scenarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Add New Funding Round */}
                <div className="border rounded-lg p-4 bg-muted/20">
                  <h4 className="font-medium mb-3">Model New Funding Round</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div>
                      <Label>Round Name</Label>
                      <Input
                        value={newFundingRound.name}
                        onChange={(e) => setNewFundingRound(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Series A"
                      />
                    </div>
                    <div>
                      <Label>Amount ($)</Label>
                      <Input
                        type="number"
                        value={newFundingRound.amount}
                        onChange={(e) => setNewFundingRound(prev => ({ ...prev, amount: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label>Pre-Money Valuation ($)</Label>
                      <Input
                        type="number"
                        value={newFundingRound.preMoneyValuation}
                        onChange={(e) => setNewFundingRound(prev => ({ ...prev, preMoneyValuation: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label>Lead Investor</Label>
                      <Input
                        value={newFundingRound.leadInvestor}
                        onChange={(e) => setNewFundingRound(prev => ({ ...prev, leadInvestor: e.target.value }))}
                        placeholder="Investor name"
                      />
                    </div>
                    <div>
                      <Label>Expected Date</Label>
                      <Input
                        type="date"
                        value={newFundingRound.date}
                        onChange={(e) => setNewFundingRound(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={addFundingRound} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Model Round
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Funding Rounds & Pro-Forma Analysis */}
                {capTableData.fundingRounds.map((round) => (
                  <Card key={round.id} className="border-l-4 border-l-primary">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{round.name} - Pro-Forma Analysis</CardTitle>
                          <p className="text-muted-foreground">
                            ${round.amount.toLocaleString()} at ${round.preMoneyValuation.toLocaleString()} pre-money
                          </p>
                        </div>
                        <Badge variant={round.status === 'planned' ? 'outline' : 'default'}>
                          {round.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3">Round Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Investment Amount:</span>
                              <span className="font-medium">${round.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Pre-Money Valuation:</span>
                              <span className="font-medium">${round.preMoneyValuation.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Post-Money Valuation:</span>
                              <span className="font-medium">${round.postMoneyValuation.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Investor Ownership:</span>
                              <span className="font-medium">{((round.amount / round.postMoneyValuation) * 100).toFixed(2)}%</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-3">Pro-Forma Ownership</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Stakeholder</TableHead>
                                <TableHead>Current %</TableHead>
                                <TableHead>Pro-Forma %</TableHead>
                                <TableHead>Dilution</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {calculateProFormaOwnership(round).slice(0, 5).map((stakeholder) => (
                                <TableRow key={stakeholder.id}>
                                  <TableCell className="font-medium">{stakeholder.name}</TableCell>
                                  <TableCell>{stakeholder.currentOwnership.toFixed(2)}%</TableCell>
                                  <TableCell>{stakeholder.proFormaOwnership.toFixed(2)}%</TableCell>
                                  <TableCell className="text-red-600">-{stakeholder.dilution.toFixed(2)}%</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ownership" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Ownership Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={calculateOwnershipPercentages()}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="sharesOwned"
                        label={({ name, ownershipPercentage }) => `${name}: ${ownershipPercentage.toFixed(1)}%`}
                      >
                        {calculateOwnershipPercentages().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ESOP Pool Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total ESOP Shares:</span>
                    <span className="font-medium">{capTableData.esopPool.totalShares.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Allocated:</span>
                    <span className="font-medium">{capTableData.esopPool.allocatedShares.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Available:</span>
                    <span className="font-medium text-green-600">{capTableData.esopPool.availableShares.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Pool Percentage:</span>
                    <span className="font-medium">{capTableData.esopPool.poolPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${(capTableData.esopPool.allocatedShares / capTableData.esopPool.totalShares) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {((capTableData.esopPool.allocatedShares / capTableData.esopPool.totalShares) * 100).toFixed(1)}% of ESOP pool allocated
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cap Table Reports & Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <FileText className="w-6 h-6" />
                  <span>Full Cap Table</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Share2 className="w-6 h-6" />
                  <span>Investor View</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Users className="w-6 h-6" />
                  <span>Employee View</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Calculator className="w-6 h-6" />
                  <span>Waterfall Analysis</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <TrendingUp className="w-6 h-6" />
                  <span>Dilution Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Percent className="w-6 h-6" />
                  <span>Ownership Summary</span>
                </Button>
              </div>
              
              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100">Clara-Style Features</h4>
                <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1">
                  <li>Automated cap table updates with real-time accuracy</li>
                  <li>SAFE conversion modeling with multiple scenarios</li>
                  <li>Customizable stakeholder views for transparency</li>
                  <li>Pro-forma ownership calculations for funding rounds</li>
                  <li>ESOP pool management with vesting schedules</li>
                  <li>Waterfall analysis for exit scenarios</li>
                  <li>Export capabilities for legal and compliance needs</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ValuationModel;