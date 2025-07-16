import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FinancialData } from "@/pages/Index";
import { Plus, Trash2, BarChart3 } from "lucide-react";

interface OperationalExpensesProps {
  data: {
    team: FinancialData['costs']['team'];
    admin: FinancialData['costs']['admin'];
    marketing: FinancialData['costs']['marketing'];
  };
  onChange: (data: {
    team: FinancialData['costs']['team'];
    admin: FinancialData['costs']['admin'];
    marketing: FinancialData['costs']['marketing'];
  }) => void;
  revenueStreams: FinancialData['revenueStreams'];
}

const OperationalExpenses: React.FC<OperationalExpensesProps> = ({ data, onChange, revenueStreams }) => {
  const [showDepartmentReport, setShowDepartmentReport] = useState(false);

  // Employee management functions
  const addEmployee = () => {
    const newEmployee = {
      id: Date.now().toString(),
      name: '',
      designation: '',
      department: 'other' as const,
      salary: 0,
      isCapitalized: false
    };
    
    onChange({
      ...data,
      team: {
        ...data.team,
        employees: [...data.team.employees, newEmployee]
      }
    });
  };

  const updateEmployee = (id: string, field: string, value: any) => {
    onChange({
      ...data,
      team: {
        ...data.team,
        employees: data.team.employees.map(emp => 
          emp.id === id ? { ...emp, [field]: value } : emp
        )
      }
    });
  };

  const removeEmployee = (id: string) => {
    onChange({
      ...data,
      team: {
        ...data.team,
        employees: data.team.employees.filter(emp => emp.id !== id)
      }
    });
  };

  // Department report calculations
  const getDepartmentReport = () => {
    const departments: { [key: string]: { count: number; totalSalary: number; avgSalary: number; employees: any[] } } = {};
    
    data.team.employees.forEach(emp => {
      if (!departments[emp.department]) {
        departments[emp.department] = { count: 0, totalSalary: 0, avgSalary: 0, employees: [] };
      }
      departments[emp.department].count++;
      departments[emp.department].totalSalary += emp.salary;
      departments[emp.department].employees.push(emp);
    });

    Object.keys(departments).forEach(dept => {
      departments[dept].avgSalary = departments[dept].totalSalary / departments[dept].count;
    });

    return departments;
  };

  const updateTeamCost = (
    category: keyof Omit<FinancialData['costs']['team'], 'employees'>, 
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
    category: keyof FinancialData['costs']['admin'], 
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
    category: keyof Omit<FinancialData['costs']['marketing'], 'isPercentageOfRevenue' | 'percentageOfRevenue'>, 
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

  const teamCategories = [
    { key: 'benefits' as keyof Omit<FinancialData['costs']['team'], 'employees'>, label: 'Benefits & Healthcare', color: 'border-green-500' },
    { key: 'contractors' as keyof Omit<FinancialData['costs']['team'], 'employees'>, label: 'Contractors & Freelancers', color: 'border-purple-500' },
    { key: 'training' as keyof Omit<FinancialData['costs']['team'], 'employees'>, label: 'Training & Development', color: 'border-orange-500' },
    { key: 'recruitment' as keyof Omit<FinancialData['costs']['team'], 'employees'>, label: 'Recruitment Costs', color: 'border-red-500' }
  ];

  const adminCategories = [
    { key: 'rent' as keyof FinancialData['costs']['admin'], label: 'Office Rent (Monthly)', color: 'border-blue-500' },
    { key: 'utilities' as keyof FinancialData['costs']['admin'], label: 'Utilities', color: 'border-green-500' },
    { key: 'domesticTravel' as keyof FinancialData['costs']['admin'], label: 'Domestic Travel', color: 'border-purple-500' },
    { key: 'internationalTravel' as keyof FinancialData['costs']['admin'], label: 'International Travel', color: 'border-orange-500' },
    { key: 'insurance' as keyof FinancialData['costs']['admin'], label: 'Insurance', color: 'border-red-500' },
    { key: 'legal' as keyof FinancialData['costs']['admin'], label: 'Legal & Professional Services', color: 'border-yellow-500' },
    { key: 'accounting' as keyof FinancialData['costs']['admin'], label: 'Accounting & Bookkeeping', color: 'border-indigo-500' },
    { key: 'software' as keyof FinancialData['costs']['admin'], label: 'Software & Subscriptions', color: 'border-pink-500' },
    { key: 'equipment' as keyof FinancialData['costs']['admin'], label: 'Equipment & Hardware', color: 'border-gray-500' },
    { key: 'other' as keyof FinancialData['costs']['admin'], label: 'Other Admin Expenses', color: 'border-cyan-500' }
  ];

  const marketingCategories = [
    { key: 'digitalAdvertising' as keyof Omit<FinancialData['costs']['marketing'], 'isPercentageOfRevenue' | 'percentageOfRevenue'>, label: 'Digital Advertising', color: 'border-blue-500' },
    { key: 'contentCreation' as keyof Omit<FinancialData['costs']['marketing'], 'isPercentageOfRevenue' | 'percentageOfRevenue'>, label: 'Content Creation', color: 'border-green-500' },
    { key: 'events' as keyof Omit<FinancialData['costs']['marketing'], 'isPercentageOfRevenue' | 'percentageOfRevenue'>, label: 'Events & Conferences', color: 'border-purple-500' },
    { key: 'pr' as keyof Omit<FinancialData['costs']['marketing'], 'isPercentageOfRevenue' | 'percentageOfRevenue'>, label: 'Public Relations', color: 'border-orange-500' },
    { key: 'brandingDesign' as keyof Omit<FinancialData['costs']['marketing'], 'isPercentageOfRevenue' | 'percentageOfRevenue'>, label: 'Branding & Design', color: 'border-red-500' },
    { key: 'tools' as keyof Omit<FinancialData['costs']['marketing'], 'isPercentageOfRevenue' | 'percentageOfRevenue'>, label: 'Marketing Tools & Software', color: 'border-yellow-500' },
    { key: 'other' as keyof Omit<FinancialData['costs']['marketing'], 'isPercentageOfRevenue' | 'percentageOfRevenue'>, label: 'Other Marketing Expenses', color: 'border-gray-500' }
  ];

  const departmentOptions = [
    { value: 'technology', label: 'Technology' },
    { value: 'sales', label: 'Sales' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'operations', label: 'Operations' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'finance', label: 'Finance' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="team" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="space-y-6">
          {/* Employee Management Section */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Employee Management</CardTitle>
              <div className="flex gap-2">
                <Button onClick={() => setShowDepartmentReport(!showDepartmentReport)} variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Department Report
                </Button>
                <Button onClick={addEmployee} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Employee
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.team.employees.map((employee) => (
                <div key={employee.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label className="text-xs text-gray-500">Name</Label>
                    <Input
                      placeholder="Employee Name"
                      value={employee.name}
                      onChange={(e) => updateEmployee(employee.id, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Designation</Label>
                    <Input
                      placeholder="Job Title"
                      value={employee.designation}
                      onChange={(e) => updateEmployee(employee.id, 'designation', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Department</Label>
                    <Select value={employee.department} onValueChange={(value) => updateEmployee(employee.id, 'department', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departmentOptions.map(dept => (
                          <SelectItem key={dept.value} value={dept.value}>{dept.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Annual Salary ($)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={employee.salary || ''}
                      onChange={(e) => updateEmployee(employee.id, 'salary', Number(e.target.value))}
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    {employee.department === 'technology' && (
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={employee.isCapitalized || false}
                          onCheckedChange={(checked) => updateEmployee(employee.id, 'isCapitalized', checked)}
                        />
                        <Label className="text-xs">Capitalize as IP</Label>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Button
                      onClick={() => removeEmployee(employee.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {data.team.employees.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No employees added yet. Click "Add Employee" to start building your team.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Department Report */}
          {showDepartmentReport && (
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="text-lg">Department Payroll Report</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(getDepartmentReport()).map(([dept, data]) => (
                    <div key={dept} className="p-4 border rounded-lg">
                      <h4 className="font-medium capitalize text-sm text-gray-700">{dept}</h4>
                      <div className="mt-2 space-y-1 text-xs">
                        <p>Employees: {data.count}</p>
                        <p>Total Salary: ${data.totalSalary.toLocaleString()}</p>
                        <p>Avg Salary: ${Math.round(data.avgSalary).toLocaleString()}</p>
                      </div>
                      <div className="mt-2">
                        {data.employees.map(emp => (
                          <Badge key={emp.id} variant="outline" className="mr-1 mb-1 text-xs">
                            {emp.name || 'Unnamed'} {emp.isCapitalized && '(IP)'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Other Team Costs */}
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
                    <p>Year 1: ${getMarketingBudget('year1').toLocaleString()}</p>
                    <p>Year 2: ${getMarketingBudget('year2').toLocaleString()}</p>
                    <p>Year 3: ${getMarketingBudget('year3').toLocaleString()}</p>
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
            <p>Allocate your marketing budget across different channels below. Total allocations should not exceed your budget.</p>
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
    </div>
  );
};

export default OperationalExpenses;
