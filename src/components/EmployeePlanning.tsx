import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from 'lucide-react';

interface Employee {
  role: string;
  count: number;
  salary: number;
  year: number;
}

interface EmployeePlanningProps {
  data: Employee[];
  onChange: (data: Employee[]) => void;
}

const EmployeePlanning: React.FC<EmployeePlanningProps> = ({ data, onChange }) => {
  const [newEmployee, setNewEmployee] = useState<Employee>({
    role: '',
    count: 1,
    salary: 0,
    year: 1
  });

  const addEmployee = () => {
    if (newEmployee.role) {
      onChange([...data, newEmployee]);
      setNewEmployee({
        role: '',
        count: 1,
        salary: 0,
        year: 1
      });
    }
  };

  const removeEmployee = (index: number) => {
    const updatedData = data.filter((_, i) => i !== index);
    onChange(updatedData);
  };

  const updateEmployee = (index: number, field: keyof Employee, value: string | number) => {
    const updatedData = data.map((employee, i) => 
      i === index ? { ...employee, [field]: value } : employee
    );
    onChange(updatedData);
  };

  const getPayrollByYear = (year: number) => {
    return data
      .filter(emp => emp.year <= year)
      .reduce((sum, emp) => sum + (emp.count * emp.salary), 0);
  };

  const getTotalEmployeesByYear = (year: number) => {
    return data
      .filter(emp => emp.year <= year)
      .reduce((sum, emp) => sum + emp.count, 0);
  };

  const commonRoles = [
    'CEO/Founder',
    'CTO/Tech Lead',
    'Software Engineer',
    'Product Manager',
    'Sales Manager',
    'Marketing Manager',
    'Operations Manager',
    'Customer Success',
    'Designer',
    'Data Analyst',
    'Administrative Assistant'
  ];

  return (
    <div className="space-y-6">
      {/* Add New Employee */}
      <Card className="border-dashed border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Employee Role
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="role">Role</Label>
              <Select 
                value={newEmployee.role} 
                onValueChange={(value) => setNewEmployee({ ...newEmployee, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {commonRoles.map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Role</SelectItem>
                </SelectContent>
              </Select>
              {newEmployee.role === 'custom' && (
                <Input
                  className="mt-2"
                  placeholder="Enter custom role"
                  onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                />
              )}
            </div>
            <div>
              <Label htmlFor="count">Count</Label>
              <Input
                id="count"
                type="number"
                min="1"
                value={newEmployee.count}
                onChange={(e) => setNewEmployee({ ...newEmployee, count: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="salary">Annual Salary ($)</Label>
              <Input
                id="salary"
                type="number"
                placeholder="0"
                value={newEmployee.salary || ''}
                onChange={(e) => setNewEmployee({ ...newEmployee, salary: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="hire-year">Hire in Year</Label>
              <Select 
                value={newEmployee.year.toString()} 
                onValueChange={(value) => setNewEmployee({ ...newEmployee, year: Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Year 1</SelectItem>
                  <SelectItem value="2">Year 2</SelectItem>
                  <SelectItem value="3">Year 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={addEmployee} className="w-full md:w-auto">
              Add Employee
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Employees */}
      {data.map((employee, index) => (
        <Card key={index} className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                {employee.role} ({employee.count} person{employee.count > 1 ? 's' : ''})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeEmployee(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Role</Label>
                <Input
                  value={employee.role}
                  onChange={(e) => updateEmployee(index, 'role', e.target.value)}
                />
              </div>
              <div>
                <Label>Count</Label>
                <Input
                  type="number"
                  min="1"
                  value={employee.count}
                  onChange={(e) => updateEmployee(index, 'count', Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Annual Salary ($)</Label>
                <Input
                  type="number"
                  value={employee.salary || ''}
                  onChange={(e) => updateEmployee(index, 'salary', Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Hire in Year</Label>
                <Select 
                  value={employee.year.toString()} 
                  onValueChange={(value) => updateEmployee(index, 'year', Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Year 1</SelectItem>
                    <SelectItem value="2">Year 2</SelectItem>
                    <SelectItem value="3">Year 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              Total Cost: ${(employee.count * employee.salary).toLocaleString()} annually
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Employee Summary */}
      {data.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Team & Payroll Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((year) => (
                <div key={year} className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {getTotalEmployeesByYear(year)}
                  </p>
                  <p className="text-sm text-blue-700 mb-2">Employees</p>
                  <p className="text-xl font-semibold text-blue-800">
                    ${getPayrollByYear(year).toLocaleString()}
                  </p>
                  <p className="text-xs text-blue-600">Year {year} Payroll</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmployeePlanning;
