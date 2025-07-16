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
import { Plus, Trash2, BarChart3, Users } from "lucide-react";

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
  balanceSheetData: FinancialData['costs']['balanceSheet'];
}

const OperationalExpenses: React.FC<OperationalExpensesProps> = ({ data, onChange, revenueStreams, balanceSheetData }) => {
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

  // Consultant management functions
  const addConsultant = () => {
    const newConsultant = {
      id: Date.now().toString(),
      name: '',
      designation: '',
      department: 'other' as const,
      monthlyCost: 0
    };
    
    onChange({
      ...data,
      team: {
        ...data.team,
        consultants: [...data.team.consultants, newConsultant]
      }
    });
  };

  const updateConsultant = (id: string, field: string, value: any) => {
    onChange({
      ...data,
      team: {
        ...data.team,
        consultants: data.team.consultants.map(consultant => 
          consultant.id === id ? { ...consultant, [field]: value } : consultant
        )
      }
    });
  };

  const removeConsultant = (id: string) => {
    onChange({
      ...data,
      team: {
        ...data.team,
        consultants: data.team.consultants.filter(consultant => consultant.id !== id)
      }
    });
  };

  // Update team line items
  const updateTeamLineItem = (item: 'healthCare' | 'benefits' | 'iqama', field: 'amount' | 'percentage', value: number) => {
    onChange({
      ...data,
      team: {
        ...data.team,
        [item]: {
          ...data.team[item],
          [field]: value
        }
      }
    });
  };

  // Calculate costs per employee
  const getTotalEmployees = () => data.team.employees.length;

  const getLineItemCostPerYear = (item: 'healthCare' | 'benefits' | 'iqama', year: 'year1' | 'year2' | 'year3') => {
    const totalEmployees = getTotalEmployees();
    const itemData = data.team[item];
    const annualCostPerEmployee = (itemData.amount * 12) + (itemData.percentage / 100) * data.team.employees.reduce((sum, emp) => sum + emp.salary, 0) / totalEmployees;
    return totalEmployees * annualCostPerEmployee;
  };

  // Department report calculations with distributed costs
  const getDepartmentReport = () => {
    const departments: { [key: string]: { 
      employeeCount: number; 
      consultantCount: number;
      totalSalary: number; 
      totalConsultantCost: number;
      totalHealthCare: number;
      totalBenefits: number;
      totalIqama: number;
      totalCost: number;
      employees: any[];
      consultants: any[];
    } } = {};
    
    // Initialize departments
    data.team.employees.forEach(emp => {
      if (!departments[emp.department]) {
        departments[emp.department] = { 
          employeeCount: 0, 
          consultantCount: 0,
          totalSalary: 0, 
          totalConsultantCost: 0,
          totalHealthCare: 0,
          totalBenefits: 0,
          totalIqama: 0,
          totalCost: 0,
          employees: [],
          consultants: []
        };
      }
      departments[emp.department].employeeCount++;
      departments[emp.department].totalSalary += emp.salary;
      departments[emp.department].employees.push(emp);
    });

    // Add consultants
    data.team.consultants.forEach(consultant => {
      if (!departments[consultant.department]) {
        departments[consultant.department] = { 
          employeeCount: 0, 
          consultantCount: 0,
          totalSalary: 0, 
          totalConsultantCost: 0,
          totalHealthCare: 0,
          totalBenefits: 0,
          totalIqama: 0,
          totalCost: 0,
          employees: [],
          consultants: []
        };
      }
      departments[consultant.department].consultantCount++;
      departments[consultant.department].totalConsultantCost += consultant.monthlyCost * 12;
      departments[consultant.department].consultants.push(consultant);
    });

    // Distribute line item costs by employee count in each department
    const totalEmployees = getTotalEmployees();
    if (totalEmployees > 0) {
      Object.keys(departments).forEach(dept => {
        const deptEmployeeCount = departments[dept].employeeCount;
        const ratio = deptEmployeeCount / totalEmployees;
        
        departments[dept].totalHealthCare = getLineItemCostPerYear('healthCare', 'year1') * ratio;
        departments[dept].totalBenefits = getLineItemCostPerYear('benefits', 'year1') * ratio;
        departments[dept].totalIqama = getLineItemCostPerYear('iqama', 'year1') * ratio;
        
        departments[dept].totalCost = departments[dept].totalSalary + 
                                    departments[dept].totalConsultantCost +
                                    departments[dept].totalHealthCare +
                                    departments[dept].totalBenefits +
                                    departments[dept].totalIqama;
      });
    }

    return departments;
  };

  // Software item management
  const addSoftwareItem = () => {
    const newItem = {
      id: Date.now().toString(),
      name: '',
      department: 'other' as const,
      costType: 'monthly' as const,
      amount: 0
    };
    
    onChange({
      ...data,
      admin: {
        ...data.admin,
        software: {
          ...data.admin.software,
          items: [...data.admin.software.items, newItem]
        }
      }
    });
  };

  const updateSoftwareItem = (id: string, field: string, value: any) => {
    onChange({
      ...data,
      admin: {
        ...data.admin,
        software: {
          ...data.admin.software,
          items: data.admin.software.items.map(item => 
            item.id === id ? { ...item, [field]: value } : item
          )
        }
      }
    });
  };

  const removeSoftwareItem = (id: string) => {
    onChange({
      ...data,
      admin: {
        ...data.admin,
        software: {
          ...data.admin.software,
          items: data.admin.software.items.filter(item => item.id !== id)
        }
      }
    });
  };

  const updateAdminField = (field: string, subField: string, value: number) => {
    onChange({
      ...data,
      admin: {
        ...data.admin,
        [field]: {
          ...data.admin[field as keyof typeof data.admin],
          [subField]: value
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

  // Calculate automatic values
  const calculateRentAndUtilities = (year: 'year1' | 'year2' | 'year3') => {
    const monthlyRent = data.admin.rent.monthlyAmount;
    const annualRent = monthlyRent * 12;
    const utilities = annualRent * (data.admin.rent.utilitiesPercentage / 100);
    
    return { annualRent, utilities };
  };

  const calculateTravelCosts = (year: 'year1' | 'year2' | 'year3') => {
    const { tripsPerMonth, domesticCostPerTrip, internationalCostPerTrip, domesticTripsRatio } = data.admin.travel;
    const totalTripsPerYear = tripsPerMonth * 12;
    const domesticTrips = totalTripsPerYear * (domesticTripsRatio / 100);
    const internationalTrips = totalTripsPerYear * ((100 - domesticTripsRatio) / 100);
    const totalCost = (domesticTrips * domesticCostPerTrip) + (internationalTrips * internationalCostPerTrip);
    
    return totalCost;
  };

  const calculateInsurance = (year: 'year1' | 'year2' | 'year3') => {
    const fixedAssets = balanceSheetData.fixedAssets[year] || 0;
    const insuranceCost = fixedAssets * (data.admin.insurance.percentageOfAssets / 100);
    
    return insuranceCost;
  };

  const calculateSoftwareCosts = (year: 'year1' | 'year2' | 'year3') => {
    const totalCost = data.admin.software.items.reduce((sum, item) => {
      if (item.costType === 'monthly') {
        return sum + (item.amount * 12);
      } else if (item.costType === 'yearly') {
        return sum + item.amount;
      } else if (item.costType === 'one-time' && year === 'year1') {
        return sum + item.amount;
      }
      return sum;
    }, 0);
    
    return totalCost;
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

  const adminCategories = [
    { key: 'legal' as keyof FinancialData['costs']['admin'], label: 'Legal & Professional Services', color: 'border-yellow-500' },
    { key: 'accounting' as keyof FinancialData['costs']['admin'], label: 'Accounting & Bookkeeping', color: 'border-indigo-500' },
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

          {/* Consultants Section */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Consultants</CardTitle>
              <Button onClick={addConsultant} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Consultant
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.team.consultants.map((consultant) => (
                <div key={consultant.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label className="text-xs text-gray-500">Name</Label>
                    <Input
                      placeholder="Consultant Name"
                      value={consultant.name}
                      onChange={(e) => updateConsultant(consultant.id, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Designation</Label>
                    <Input
                      placeholder="Role/Specialty"
                      value={consultant.designation}
                      onChange={(e) => updateConsultant(consultant.id, 'designation', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Department</Label>
                    <Select value={consultant.department} onValueChange={(value) => updateConsultant(consultant.id, 'department', value)}>
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
                    <Label className="text-xs text-gray-500">Monthly Cost ($)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={consultant.monthlyCost || ''}
                      onChange={(e) => updateConsultant(consultant.id, 'monthlyCost', Number(e.target.value))}
                    />
                  </div>
                  <div className="flex items-center">
                    <Button
                      onClick={() => removeConsultant(consultant.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {data.team.consultants.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No consultants added yet. Click "Add Consultant" to start.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Employee Benefits Line Items */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Health Care */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="text-lg">Health Care</CardTitle>
                <p className="text-sm text-gray-500">Cost per employee: ${getTotalEmployees() > 0 ? Math.round(getLineItemCostPerYear('healthCare', 'year1') / getTotalEmployees()) : 0}/year</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Fixed Amount (Monthly per employee)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={data.team.healthCare.amount || ''}
                    onChange={(e) => updateTeamLineItem('healthCare', 'amount', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Percentage of Salary (%)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={data.team.healthCare.percentage || ''}
                    onChange={(e) => updateTeamLineItem('healthCare', 'percentage', Number(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-lg">Benefits</CardTitle>
                <p className="text-sm text-gray-500">Cost per employee: ${getTotalEmployees() > 0 ? Math.round(getLineItemCostPerYear('benefits', 'year1') / getTotalEmployees()) : 0}/year</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Fixed Amount (Monthly per employee)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={data.team.benefits.amount || ''}
                    onChange={(e) => updateTeamLineItem('benefits', 'amount', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Percentage of Salary (%)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={data.team.benefits.percentage || ''}
                    onChange={(e) => updateTeamLineItem('benefits', 'percentage', Number(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Iqama */}
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <CardTitle className="text-lg">Iqama</CardTitle>
                <p className="text-sm text-gray-500">Cost per employee: ${getTotalEmployees() > 0 ? Math.round(getLineItemCostPerYear('iqama', 'year1') / getTotalEmployees()) : 0}/year</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Fixed Amount (Monthly per employee)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={data.team.iqama.amount || ''}
                    onChange={(e) => updateTeamLineItem('iqama', 'amount', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Percentage of Salary (%)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={data.team.iqama.percentage || ''}
                    onChange={(e) => updateTeamLineItem('iqama', 'percentage', Number(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recruitment Costs */}
          <Card className="border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle className="text-lg">Recruitment Costs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Year 1 ($)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={data.team.recruitment.year1 || ''}
                    onChange={(e) => onChange({
                      ...data,
                      team: {
                        ...data.team,
                        recruitment: {
                          ...data.team.recruitment,
                          year1: Number(e.target.value)
                        }
                      }
                    })}
                  />
                </div>
                <div>
                  <Label>Year 2 ($)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={data.team.recruitment.year2 || ''}
                    onChange={(e) => onChange({
                      ...data,
                      team: {
                        ...data.team,
                        recruitment: {
                          ...data.team.recruitment,
                          year2: Number(e.target.value)
                        }
                      }
                    })}
                  />
                </div>
                <div>
                  <Label>Year 3 ($)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={data.team.recruitment.year3 || ''}
                    onChange={(e) => onChange({
                      ...data,
                      team: {
                        ...data.team,
                        recruitment: {
                          ...data.team.recruitment,
                          year3: Number(e.target.value)
                        }
                      }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Department Report */}
          {showDepartmentReport && (
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Department Cost Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(getDepartmentReport()).map(([dept, data]) => (
                    <div key={dept} className="p-4 border rounded-lg space-y-3">
                      <h4 className="font-medium capitalize text-sm text-gray-700">{dept}</h4>
                      <div className="space-y-1 text-xs">
                        <p>Employees: {data.employeeCount}</p>
                        <p>Consultants: {data.consultantCount}</p>
                        <p>Salaries: ${data.totalSalary.toLocaleString()}</p>
                        <p>Consultant Costs: ${data.totalConsultantCost.toLocaleString()}</p>
                        <p>Health Care: ${Math.round(data.totalHealthCare).toLocaleString()}</p>
                        <p>Benefits: ${Math.round(data.totalBenefits).toLocaleString()}</p>
                        <p>Iqama: ${Math.round(data.totalIqama).toLocaleString()}</p>
                        <p className="font-semibold border-t pt-1">Total: ${Math.round(data.totalCost).toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        {data.employees.map(emp => (
                          <Badge key={emp.id} variant="outline" className="mr-1 mb-1 text-xs">
                            {emp.name || 'Unnamed'} {emp.isCapitalized && '(IP)'}
                          </Badge>
                        ))}
                        {data.consultants.map(consultant => (
                          <Badge key={consultant.id} variant="secondary" className="mr-1 mb-1 text-xs">
                            {consultant.name || 'Consultant'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="admin" className="space-y-6">
          {/* Rent & Utilities */}
          <Card className="border-l-4 border-blue-500">
            <CardHeader>
              <CardTitle className="text-lg">Office Rent & Utilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Monthly Rent ($)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={data.admin.rent.monthlyAmount || ''}
                    onChange={(e) => updateAdminField('rent', 'monthlyAmount', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Utilities (% of Rent)</Label>
                  <Input
                    type="number"
                    placeholder="15"
                    value={data.admin.rent.utilitiesPercentage || ''}
                    onChange={(e) => updateAdminField('rent', 'utilitiesPercentage', Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                {['year1', 'year2', 'year3'].map((year, index) => {
                  const { annualRent, utilities } = calculateRentAndUtilities(year as 'year1' | 'year2' | 'year3');
                  return (
                    <div key={year} className="text-sm">
                      <h4 className="font-medium">Year {index + 1}</h4>
                      <p>Annual Rent: ${annualRent.toLocaleString()}</p>
                      <p>Utilities: ${utilities.toLocaleString()}</p>
                      <p className="font-semibold">Total: ${(annualRent + utilities).toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Travel */}
          <Card className="border-l-4 border-purple-500">
            <CardHeader>
              <CardTitle className="text-lg">Travel Expenses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Trips per Month</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={data.admin.travel.tripsPerMonth || ''}
                    onChange={(e) => updateAdminField('travel', 'tripsPerMonth', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Domestic Cost per Trip ($)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={data.admin.travel.domesticCostPerTrip || ''}
                    onChange={(e) => updateAdminField('travel', 'domesticCostPerTrip', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>International Cost per Trip ($)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={data.admin.travel.internationalCostPerTrip || ''}
                    onChange={(e) => updateAdminField('travel', 'internationalCostPerTrip', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Domestic Trips (%)</Label>
                  <Input
                    type="number"
                    placeholder="70"
                    value={data.admin.travel.domesticTripsRatio || ''}
                    onChange={(e) => updateAdminField('travel', 'domesticTripsRatio', Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                {['year1', 'year2', 'year3'].map((year, index) => {
                  const totalCost = calculateTravelCosts(year as 'year1' | 'year2' | 'year3');
                  return (
                    <div key={year} className="text-sm">
                      <h4 className="font-medium">Year {index + 1}</h4>
                      <p className="font-semibold">Total: ${totalCost.toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Insurance */}
          <Card className="border-l-4 border-red-500">
            <CardHeader>
              <CardTitle className="text-lg">Insurance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Insurance (% of Fixed Assets)</Label>
                <Input
                  type="number"
                  placeholder="2"
                  value={data.admin.insurance.percentageOfAssets || ''}
                  onChange={(e) => updateAdminField('insurance', 'percentageOfAssets', Number(e.target.value))}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                {['year1', 'year2', 'year3'].map((year, index) => {
                  const insuranceCost = calculateInsurance(year as 'year1' | 'year2' | 'year3');
                  const fixedAssets = balanceSheetData.fixedAssets[year as 'year1' | 'year2' | 'year3'];
                  return (
                    <div key={year} className="text-sm">
                      <h4 className="font-medium">Year {index + 1}</h4>
                      <p>Fixed Assets: ${fixedAssets.toLocaleString()}</p>
                      <p className="font-semibold">Insurance: ${insuranceCost.toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Software & Subscriptions */}
          <Card className="border-l-4 border-pink-500">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Software & Subscriptions</CardTitle>
              <Button onClick={addSoftwareItem} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Software
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.admin.software.items.map((item) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label className="text-xs text-gray-500">Software Name</Label>
                    <Input
                      placeholder="Software Name"
                      value={item.name}
                      onChange={(e) => updateSoftwareItem(item.id, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Department</Label>
                    <Select value={item.department} onValueChange={(value) => updateSoftwareItem(item.id, 'department', value)}>
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
                    <Label className="text-xs text-gray-500">Cost Type</Label>
                    <Select value={item.costType} onValueChange={(value) => updateSoftwareItem(item.id, 'costType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="one-time">One-time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Amount ($)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={item.amount || ''}
                      onChange={(e) => updateSoftwareItem(item.id, 'amount', Number(e.target.value))}
                    />
                  </div>
                  <div className="flex items-center">
                    <Button
                      onClick={() => removeSoftwareItem(item.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {data.admin.software.items.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No software items added yet. Click "Add Software" to start.
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                {['year1', 'year2', 'year3'].map((year, index) => {
                  const totalCost = calculateSoftwareCosts(year as 'year1' | 'year2' | 'year3');
                  return (
                    <div key={year} className="text-sm">
                      <h4 className="font-medium">Year {index + 1}</h4>
                      <p className="font-semibold">Total: ${totalCost.toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Other Admin Categories */}
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
                <Label>Use percentage of revenue</Label>
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
                    <p>Budget Year 1: ${getMarketingBudget('year1').toLocaleString()}</p>
                    <p>Budget Year 2: ${getMarketingBudget('year2').toLocaleString()}</p>
                    <p>Budget Year 3: ${getMarketingBudget('year3').toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Year 1 Budget ($)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={data.marketing.manualBudget.year1 || ''}
                      onChange={(e) => updateMarketingCost('manualBudget', 'year1', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Year 2 Budget ($)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={data.marketing.manualBudget.year2 || ''}
                      onChange={(e) => updateMarketingCost('manualBudget', 'year2', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Year 3 Budget ($)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={data.marketing.manualBudget.year3 || ''}
                      onChange={(e) => updateMarketingCost('manualBudget', 'year3', Number(e.target.value))}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

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