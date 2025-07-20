import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { FinancialData } from "@/pages/Index";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash2, BarChart3, Users, Lightbulb, Edit, Check, X } from "lucide-react";

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
  onAddIntangibleAsset?: (assetName: string, cost: number) => void;
}

const OperationalExpenses: React.FC<OperationalExpensesProps> = ({ data, onChange, revenueStreams, balanceSheetData, onAddIntangibleAsset }) => {
  const [showDepartmentReport, setShowDepartmentReport] = useState(false);
  const [showIPDialog, setShowIPDialog] = useState(false);
  const [ipAssetName, setIpAssetName] = useState('');
  const [ipAssetCost, setIpAssetCost] = useState(0);
  const [pendingEmployee, setPendingEmployee] = useState<any>(null);
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
  const [editingConsultant, setEditingConsultant] = useState<string | null>(null);
  const [editEmployeeValues, setEditEmployeeValues] = useState<any>({});
  const [editConsultantValues, setEditConsultantValues] = useState<any>({});
  
  // Employee benefits management
  const [employeeBenefits, setEmployeeBenefits] = useState<Array<{
    id: string;
    name: string;
    calculationType: 'fixed' | 'percentage';
    amount: number;
    percentage: number;
  }>>([]);
  
  const [isAddingBenefit, setIsAddingBenefit] = useState(false);
  const [newBenefitName, setNewBenefitName] = useState('');
  const [newBenefitType, setNewBenefitType] = useState<'fixed' | 'percentage'>('fixed');

  // Check if designation is technology-related
  const isTechnologyRole = (designation: string) => {
    const techRoles = ['cto', 'tech lead', 'software engineer', 'developer', 'programmer', 
                       'data analyst', 'data scientist', 'ai engineer', 'ml engineer',
                       'frontend', 'backend', 'fullstack', 'devops', 'architect'];
    return techRoles.some(role => designation.toLowerCase().includes(role));
  };

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
    
    // Add new employee to the top of the list
    onChange({
      ...data,
      team: {
        ...data.team,
        employees: [newEmployee, ...data.team.employees]
      }
    });

    // Immediately put the new employee in edit mode
    setEditingEmployee(newEmployee.id);
    setEditEmployeeValues({
      name: '',
      designation: '',
      department: 'other',
      salary: 0,
      isCapitalized: false
    });
  };

  const startEditEmployee = (employee: any) => {
    setEditingEmployee(employee.id);
    setEditEmployeeValues({
      name: employee.name,
      designation: employee.designation,
      department: employee.department,
      salary: employee.salary,
      isCapitalized: employee.isCapitalized
    });
  };

  const saveEditEmployee = (employeeId: string) => {
    // Validate required fields
    if (!editEmployeeValues.name?.trim() || !editEmployeeValues.designation?.trim()) {
      alert('Please fill in both name and designation before saving.');
      return;
    }

    const updatedEmployees = data.team.employees.map(emp =>
      emp.id === employeeId ? { ...emp, ...editEmployeeValues } : emp
    );
    
    // Check if we're updating designation to a technology role
    const updatedEmployee = updatedEmployees.find(emp => emp.id === employeeId);
    if (updatedEmployee && isTechnologyRole(editEmployeeValues.designation) && updatedEmployee.salary > 0) {
      setPendingEmployee(updatedEmployee);
      setIpAssetName(`IP Development - ${editEmployeeValues.designation}`);
      setIpAssetCost(updatedEmployee.salary * 0.3);
      setShowIPDialog(true);
    }

    // Check if we're capitalizing an employee as IP
    if (editEmployeeValues.isCapitalized === true && updatedEmployee) {
      if (updatedEmployee.department === 'technology' && updatedEmployee.salary > 0) {
        const assetName = `Inhouse Development - ${updatedEmployee.designation || 'Technology Role'}`;
        const assetCost = updatedEmployee.salary * 0.3;
        
        if (onAddIntangibleAsset) {
          onAddIntangibleAsset(assetName, assetCost);
        }
      }
    }
    
    onChange({
      ...data,
      team: {
        ...data.team,
        employees: updatedEmployees
      }
    });
    
    setEditingEmployee(null);
    setEditEmployeeValues({});
  };

  const cancelEditEmployee = () => {
    setEditingEmployee(null);
    setEditEmployeeValues({});
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
    
    // Add new consultant to the top of the list
    onChange({
      ...data,
      team: {
        ...data.team,
        consultants: [newConsultant, ...data.team.consultants]
      }
    });

    // Immediately put the new consultant in edit mode
    setEditingConsultant(newConsultant.id);
    setEditConsultantValues({
      name: '',
      designation: '',
      department: 'other',
      monthlyCost: 0
    });
  };

  const startEditConsultant = (consultant: any) => {
    setEditingConsultant(consultant.id);
    setEditConsultantValues({
      name: consultant.name,
      designation: consultant.designation,
      department: consultant.department,
      monthlyCost: consultant.monthlyCost
    });
  };

  const saveEditConsultant = (consultantId: string) => {
    // Validate required fields
    if (!editConsultantValues.name?.trim() || !editConsultantValues.designation?.trim()) {
      alert('Please fill in both name and designation before saving.');
      return;
    }

    const updatedConsultants = data.team.consultants.map(cons =>
      cons.id === consultantId ? { ...cons, ...editConsultantValues } : cons
    );
    
    onChange({
      ...data,
      team: {
        ...data.team,
        consultants: updatedConsultants
      }
    });
    
    setEditingConsultant(null);
    setEditConsultantValues({});
  };

  const cancelEditConsultant = () => {
    setEditingConsultant(null);
    setEditConsultantValues({});
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

  // Employee benefits management functions
  const addEmployeeBenefit = () => {
    if (!newBenefitName.trim()) return;
    
    const newBenefit = {
      id: Date.now().toString(),
      name: newBenefitName,
      calculationType: newBenefitType,
      amount: 0,
      percentage: 0
    };
    
    setEmployeeBenefits([...employeeBenefits, newBenefit]);
    setNewBenefitName('');
    setIsAddingBenefit(false);
  };

  const updateEmployeeBenefit = (id: string, field: keyof typeof employeeBenefits[0], value: any) => {
    setEmployeeBenefits(employeeBenefits.map(benefit => 
      benefit.id === id ? { ...benefit, [field]: value } : benefit
    ));
  };

  const removeEmployeeBenefit = (id: string) => {
    setEmployeeBenefits(employeeBenefits.filter(benefit => benefit.id !== id));
  };

  // Calculate cost per employee for a benefit
  const getBenefitCostPerEmployee = (benefit: typeof employeeBenefits[0]) => {
    const totalEmployees = getTotalEmployees();
    if (totalEmployees === 0) return 0;
    
    if (benefit.calculationType === 'fixed') {
      return benefit.amount * 12; // Monthly to annual
    } else {
      const avgSalary = data.team.employees.reduce((sum, emp) => sum + emp.salary, 0) / totalEmployees;
      return (avgSalary * benefit.percentage) / 100;
    }
  };

  // Calculate costs per employee
  const getTotalEmployees = () => data.team.employees.length;

  // Department report calculations with distributed costs
  const getDepartmentReport = () => {
    const departments: { [key: string]: { 
      employeeCount: number; 
      consultantCount: number;
      totalSalary: number; 
      totalConsultantCost: number;
      totalBenefitsCost: number;
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
          totalBenefitsCost: 0,
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
          totalBenefitsCost: 0,
          totalCost: 0,
          employees: [],
          consultants: []
        };
      }
      departments[consultant.department].consultantCount++;
      departments[consultant.department].totalConsultantCost += consultant.monthlyCost * 12;
      departments[consultant.department].consultants.push(consultant);
    });

    // Distribute benefits costs by employee count in each department
    const totalEmployees = getTotalEmployees();
    if (totalEmployees > 0) {
      Object.keys(departments).forEach(dept => {
        const deptEmployeeCount = departments[dept].employeeCount;
        const ratio = deptEmployeeCount / totalEmployees;
        
        // Calculate total benefits cost for all employees
        const totalBenefitsCost = employeeBenefits.reduce((sum, benefit) => {
          return sum + (getBenefitCostPerEmployee(benefit) * totalEmployees);
        }, 0);
        
        departments[dept].totalBenefitsCost = totalBenefitsCost * ratio;
        
        departments[dept].totalCost = departments[dept].totalSalary + 
                                    departments[dept].totalConsultantCost +
                                    departments[dept].totalBenefitsCost;
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

  const confirmIPAsset = () => {
    if (onAddIntangibleAsset && ipAssetName && ipAssetCost > 0) {
      onAddIntangibleAsset(ipAssetName, ipAssetCost);
    }
    setShowIPDialog(false);
    setPendingEmployee(null);
    setIpAssetName('');
    setIpAssetCost(0);
  };

  const declineIPAsset = () => {
    setShowIPDialog(false);
    setPendingEmployee(null);
    setIpAssetName('');
    setIpAssetCost(0);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Users className="w-6 h-6" />
            Operational Expenses
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="team" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="team">Team & Personnel</TabsTrigger>
          <TabsTrigger value="admin">Administrative</TabsTrigger>
          <TabsTrigger value="marketing">Marketing & Sales</TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="space-y-6">
          {/* Employees Section */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Employees
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setShowDepartmentReport(!showDepartmentReport)} 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    {showDepartmentReport ? 'Hide' : 'Show'} Report
                  </Button>
                  <Button 
                    onClick={addEmployee} 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Employee
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.team.employees.map((employee) => (
                <div key={employee.id} className="p-4 border rounded-lg space-y-3">
                  {editingEmployee === employee.id ? (
                    // Edit mode
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={editEmployeeValues.name || ''}
                          onChange={(e) => setEditEmployeeValues({...editEmployeeValues, name: e.target.value})}
                          placeholder="Employee name"
                        />
                      </div>
                      <div>
                        <Label>Designation</Label>
                        <Input
                          value={editEmployeeValues.designation || ''}
                          onChange={(e) => setEditEmployeeValues({...editEmployeeValues, designation: e.target.value})}
                          placeholder="Job title"
                        />
                      </div>
                      <div>
                        <Label>Department</Label>
                        <Select value={editEmployeeValues.department} onValueChange={(value) => setEditEmployeeValues({...editEmployeeValues, department: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="sales">Sales</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="operations">Operations</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="hr">Human Resources</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Annual Salary</Label>
                        <Input
                          type="number"
                          value={editEmployeeValues.salary || ''}
                          onChange={(e) => setEditEmployeeValues({...editEmployeeValues, salary: Number(e.target.value)})}
                          placeholder="0"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={editEmployeeValues.isCapitalized || false}
                          onCheckedChange={(checked) => setEditEmployeeValues({...editEmployeeValues, isCapitalized: checked})}
                        />
                        <Label>Capitalize as IP Asset</Label>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{employee.name || 'Unnamed Employee'}</h4>
                        <p className="text-sm text-muted-foreground">
                          {employee.designation || 'No designation'} • {employee.department} • {formatCurrency(employee.salary)}/year
                          {employee.isCapitalized && <Badge variant="secondary" className="ml-2">IP Asset</Badge>}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 ml-4">
                    {editingEmployee === employee.id ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => saveEditEmployee(employee.id)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelEditEmployee}
                          className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 border-gray-200"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEditEmployee(employee)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeEmployee(employee.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              
              {data.team.employees.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No employees added yet. Click "Add Employee" to start.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Consultants Section */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Consultants
                <Button 
                  onClick={addConsultant} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Consultant
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.team.consultants.map((consultant) => (
                <div key={consultant.id} className="p-4 border rounded-lg space-y-3">
                  {editingConsultant === consultant.id ? (
                    // Edit mode
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={editConsultantValues.name || ''}
                          onChange={(e) => setEditConsultantValues({...editConsultantValues, name: e.target.value})}
                          placeholder="Consultant name"
                        />
                      </div>
                      <div>
                        <Label>Designation</Label>
                        <Input
                          value={editConsultantValues.designation || ''}
                          onChange={(e) => setEditConsultantValues({...editConsultantValues, designation: e.target.value})}
                          placeholder="Consultant role"
                        />
                      </div>
                      <div>
                        <Label>Department</Label>
                        <Select value={editConsultantValues.department} onValueChange={(value) => setEditConsultantValues({...editConsultantValues, department: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="sales">Sales</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="operations">Operations</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="hr">Human Resources</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Monthly Cost</Label>
                        <Input
                          type="number"
                          value={editConsultantValues.monthlyCost || ''}
                          onChange={(e) => setEditConsultantValues({...editConsultantValues, monthlyCost: Number(e.target.value)})}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{consultant.name || 'Unnamed Consultant'}</h4>
                        <p className="text-sm text-muted-foreground">
                          {consultant.designation || 'No designation'} • {consultant.department} • {formatCurrency(consultant.monthlyCost)}/month
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 ml-4">
                    {editingConsultant === consultant.id ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => saveEditConsultant(consultant.id)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelEditConsultant}
                          className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 border-gray-200"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEditConsultant(consultant)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeConsultant(consultant.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
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

          {/* Employee Benefits Section */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Employee Benefits & Other Costs
                <Button 
                  onClick={() => setIsAddingBenefit(!isAddingBenefit)} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Benefit
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAddingBenefit && (
                <Card className="p-4 border-dashed">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Benefit Name</Label>
                        <Input
                          placeholder="e.g., Health Care, Benefits, Iqama, Training, Recruitment"
                          value={newBenefitName}
                          onChange={(e) => setNewBenefitName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Calculation Type</Label>
                        <Select value={newBenefitType} onValueChange={(value: 'fixed' | 'percentage') => setNewBenefitType(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed">Fixed Amount (Monthly per employee)</SelectItem>
                            <SelectItem value="percentage">Percentage of Salary</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={addEmployeeBenefit} size="sm">Add</Button>
                      <Button onClick={() => setIsAddingBenefit(false)} variant="outline" size="sm">Cancel</Button>
                    </div>
                  </div>
                </Card>
              )}

              {employeeBenefits.length > 0 && (
                <div className="space-y-4">
                  {employeeBenefits.map((benefit) => (
                    <Card key={benefit.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{benefit.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Cost per employee: {formatCurrency(getBenefitCostPerEmployee(benefit))}/year
                          </span>
                          <Button
                            onClick={() => removeEmployeeBenefit(benefit.id)}
                            variant="ghost"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Calculation Method</Label>
                          <Select 
                            value={benefit.calculationType} 
                            onValueChange={(value: 'fixed' | 'percentage') => {
                              updateEmployeeBenefit(benefit.id, 'calculationType', value);
                              // Reset the other value when switching methods
                              if (value === 'fixed') {
                                updateEmployeeBenefit(benefit.id, 'percentage', 0);
                              } else {
                                updateEmployeeBenefit(benefit.id, 'amount', 0);
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fixed">Fixed Amount (Monthly per employee)</SelectItem>
                              <SelectItem value="percentage">Percentage of Salary</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {benefit.calculationType === 'fixed' ? (
                          <div>
                            <Label>Fixed Amount (Monthly per employee)</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={benefit.amount || ''}
                              onChange={(e) => updateEmployeeBenefit(benefit.id, 'amount', Number(e.target.value))}
                            />
                          </div>
                        ) : (
                          <div>
                            <Label>Percentage of Salary (%)</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={benefit.percentage || ''}
                              onChange={(e) => updateEmployeeBenefit(benefit.id, 'percentage', Number(e.target.value))}
                            />
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {employeeBenefits.length === 0 && !isAddingBenefit && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No employee benefits added yet.</p>
                  <p className="text-sm">Click "Add Benefit" to include health care, benefits, recruitment costs, or other employee-related costs.</p>
                </div>
              )}
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
                  {Object.entries(getDepartmentReport()).map(([dept, deptData]) => (
                    <div key={dept} className="p-4 border rounded-lg space-y-3">
                      <h4 className="font-medium capitalize text-sm text-gray-700">{dept}</h4>
                      <div className="space-y-1 text-xs">
                        <p>Employees: {deptData.employeeCount}</p>
                        <p>Consultants: {deptData.consultantCount}</p>
                        <p>Salaries: {formatCurrency(deptData.totalSalary)}</p>
                        <p>Consultant Costs: {formatCurrency(deptData.totalConsultantCost)}</p>
                        <p>Benefits: {formatCurrency(deptData.totalBenefitsCost)}</p>
                        <p className="font-semibold border-t pt-1">Total: {formatCurrency(deptData.totalCost)}</p>
                      </div>
                      <div className="space-y-1">
                        {deptData.employees.map(emp => (
                          <Badge key={emp.id} variant="outline" className="mr-1 mb-1 text-xs">
                            {emp.name || 'Unnamed'} {emp.isCapitalized && '(IP)'}
                          </Badge>
                        ))}
                        {deptData.consultants.map(consultant => (
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
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="hr">Human Resources</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
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

          {['legal', 'accounting', 'other'].map((key) => (
            <Card key={key} className={`border-l-4 ${key === 'legal' ? 'border-yellow-500' : key === 'accounting' ? 'border-indigo-500' : 'border-cyan-500'}`}>
              <CardHeader>
                <CardTitle className="text-lg">{key === 'legal' ? 'Legal & Professional Services' : key === 'accounting' ? 'Accounting & Bookkeeping' : 'Other Admin Expenses'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Year 1 ($)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={data.admin[key as keyof FinancialData['costs']['admin']].year1 || ''}
                      onChange={(e) => updateAdminCost(key as keyof FinancialData['costs']['admin'], 'year1', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Year 2 ($)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={data.admin[key as keyof FinancialData['costs']['admin']].year2 || ''}
                      onChange={(e) => updateAdminCost(key as keyof FinancialData['costs']['admin'], 'year2', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Year 3 ($)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={data.admin[key as keyof FinancialData['costs']['admin']].year3 || ''}
                      onChange={(e) => updateAdminCost(key as keyof FinancialData['costs']['admin'], 'year3', Number(e.target.value))}
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
                  onCheckedChange={(checked) => onChange({
                    ...data,
                    marketing: {
                      ...data.marketing,
                      isPercentageOfRevenue: checked
                    }
                  })}
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
                    onChange={(e) => onChange({
                      ...data,
                      marketing: {
                        ...data.marketing,
                        percentageOfRevenue: Number(e.target.value)
                      }
                    })}
                  />
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Budget Year 1: ${revenueStreams.reduce((sum, stream) => sum + stream.year1, 0) * (data.marketing.percentageOfRevenue / 100)}</p>
                    <p>Budget Year 2: ${revenueStreams.reduce((sum, stream) => sum + stream.year2, 0) * (data.marketing.percentageOfRevenue / 100)}</p>
                    <p>Budget Year 3: ${revenueStreams.reduce((sum, stream) => sum + stream.year3, 0) * (data.marketing.percentageOfRevenue / 100)}</p>
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
                      onChange={(e) => onChange({
                        ...data,
                        marketing: {
                          ...data.marketing,
                          manualBudget: {
                            ...data.marketing.manualBudget,
                            year1: Number(e.target.value)
                          }
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Year 2 Budget ($)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={data.marketing.manualBudget.year2 || ''}
                      onChange={(e) => onChange({
                        ...data,
                        marketing: {
                          ...data.marketing,
                          manualBudget: {
                            ...data.marketing.manualBudget,
                            year2: Number(e.target.value)
                          }
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Year 3 Budget ($)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={data.marketing.manualBudget.year3 || ''}
                      onChange={(e) => onChange({
                        ...data,
                        marketing: {
                          ...data.marketing,
                          manualBudget: {
                            ...data.marketing.manualBudget,
                            year3: Number(e.target.value)
                          }
                        }
                      })}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {['digitalAdvertising', 'contentCreation', 'events', 'pr', 'brandingDesign', 'tools', 'other'].map((key) => (
            <Card key={key} className={`border-l-4 ${key === 'digitalAdvertising' ? 'border-blue-500' : key === 'contentCreation' ? 'border-green-500' : key === 'events' ? 'border-purple-500' : key === 'pr' ? 'border-orange-500' : key === 'brandingDesign' ? 'border-red-500' : key === 'tools' ? 'border-yellow-500' : 'border-gray-500'}`}>
              <CardHeader>
                <CardTitle className="text-lg">{key === 'digitalAdvertising' ? 'Digital Advertising' : key === 'contentCreation' ? 'Content Creation' : key === 'events' ? 'Events & Conferences' : key === 'pr' ? 'Public Relations' : key === 'brandingDesign' ? 'Branding & Design' : key === 'tools' ? 'Marketing Tools & Software' : 'Other Marketing Expenses'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Year 1 ($)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={data.marketing[key as keyof Omit<FinancialData['costs']['marketing'], 'isPercentageOfRevenue' | 'percentageOfRevenue' | 'manualBudget'>].year1 || ''}
                      onChange={(e) => onChange({
                        ...data,
                        marketing: {
                          ...data.marketing,
                          [key]: {
                            ...(data.marketing[key as keyof typeof data.marketing] as any),
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
                      value={data.marketing[key as keyof Omit<FinancialData['costs']['marketing'], 'isPercentageOfRevenue' | 'percentageOfRevenue' | 'manualBudget'>].year2 || ''}
                      onChange={(e) => onChange({
                        ...data,
                        marketing: {
                          ...data.marketing,
                          [key]: {
                            ...(data.marketing[key as keyof typeof data.marketing] as any),
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
                      value={data.marketing[key as keyof Omit<FinancialData['costs']['marketing'], 'isPercentageOfRevenue' | 'percentageOfRevenue' | 'manualBudget'>].year3 || ''}
                      onChange={(e) => onChange({
                        ...data,
                        marketing: {
                          ...data.marketing,
                          [key]: {
                            ...(data.marketing[key as keyof typeof data.marketing] as any),
                            year3: Number(e.target.value)
                          }
                        }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* IP Asset Dialog */}
      <Dialog open={showIPDialog} onOpenChange={setShowIPDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Create Intangible Asset?
            </DialogTitle>
            <DialogDescription>
              We detected that you've added a technology role. Would you like to create an intangible asset 
              representing the intellectual property this employee will develop?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Asset Name</Label>
              <Input
                value={ipAssetName}
                onChange={(e) => setIpAssetName(e.target.value)}
                placeholder="IP Development - Software Engineer"
              />
            </div>
            <div>
              <Label>Asset Cost ($)</Label>
              <Input
                type="number"
                value={ipAssetCost}
                onChange={(e) => setIpAssetCost(Number(e.target.value))}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={declineIPAsset}>
              Skip
            </Button>
            <Button onClick={confirmIPAsset}>
              Create Asset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OperationalExpenses;
