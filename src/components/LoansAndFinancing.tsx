import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { FinancialData } from "@/pages/Index";
import { Plus, Trash2, Calculator, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface Loan {
  id: string;
  name: string;
  type: 'term' | 'line-of-credit' | 'convertible-note';
  principalAmount: number;
  interestRate: number;
  termMonths: number;
  startYear: 'year1' | 'year2' | 'year3';
  paymentFrequency: 'monthly' | 'quarterly' | 'annually';
  gracePeriodMonths: number;
  isInterestOnly?: boolean;
  conversionDetails?: {
    discountRate: number;
    valuationCap: number;
    automaticConversion: boolean;
  };
}

interface LoansAndFinancingProps {
  data: {
    loans: Loan[];
    totalInterestExpense: {
      year1: number;
      year2: number;
      year3: number;
    };
  };
  onChange: (data: {
    loans: Loan[];
    totalInterestExpense: {
      year1: number;
      year2: number;
      year3: number;
    };
  }) => void;
  financialData: FinancialData;
}

const LoansAndFinancing: React.FC<LoansAndFinancingProps> = ({ data, onChange, financialData }) => {
  const [selectedLoanType, setSelectedLoanType] = useState<'term' | 'line-of-credit' | 'convertible-note'>('term');

  const calculateEBITDA = (year: 'year1' | 'year2' | 'year3') => {
    const revenue = financialData.revenueStreams.reduce((sum, stream) => sum + stream[year], 0);
    const directCosts = Object.values(financialData.costs.revenueStreamCosts).reduce((sum, stream) => {
      return sum + Object.values(stream.directCosts).reduce((streamSum, cost) => streamSum + cost[year], 0);
    }, 0);
    const grossProfit = revenue - directCosts;
    
    const teamCosts = Object.values(financialData.costs.team).reduce((sum, cost) => sum + cost[year], 0);
    const adminCosts = Object.values(financialData.costs.admin).reduce((sum, cost) => sum + cost[year], 0);
    const marketingCosts = financialData.costs.marketing.isPercentageOfRevenue 
      ? revenue * (financialData.costs.marketing.percentageOfRevenue / 100)
      : financialData.costs.marketing.manualBudget[year];
    
    const operationalExpenses = teamCosts + adminCosts + marketingCosts;
    return grossProfit - operationalExpenses;
  };

  const calculatePaymentAmount = (loan: Loan): number => {
    if (loan.isInterestOnly) {
      return loan.principalAmount * (loan.interestRate / 100) / (loan.paymentFrequency === 'monthly' ? 12 : loan.paymentFrequency === 'quarterly' ? 4 : 1);
    }
    
    const periodsPerYear = loan.paymentFrequency === 'monthly' ? 12 : loan.paymentFrequency === 'quarterly' ? 4 : 1;
    const totalPayments = loan.termMonths / (12 / periodsPerYear);
    const periodicRate = loan.interestRate / 100 / periodsPerYear;
    
    if (periodicRate === 0) return loan.principalAmount / totalPayments;
    
    return loan.principalAmount * (periodicRate * Math.pow(1 + periodicRate, totalPayments)) / (Math.pow(1 + periodicRate, totalPayments) - 1);
  };

  const calculateTotalPayments = (loan: Loan, year: 'year1' | 'year2' | 'year3'): number => {
    const yearNum = parseInt(year.replace('year', ''));
    const startYearNum = parseInt(loan.startYear.replace('year', ''));
    
    if (yearNum < startYearNum) return 0;
    
    const paymentAmount = calculatePaymentAmount(loan);
    const periodsPerYear = loan.paymentFrequency === 'monthly' ? 12 : loan.paymentFrequency === 'quarterly' ? 4 : 1;
    
    // Account for grace period
    const effectiveStartMonth = (startYearNum - 1) * 12 + loan.gracePeriodMonths;
    const yearStartMonth = (yearNum - 1) * 12;
    const yearEndMonth = yearNum * 12;
    
    if (effectiveStartMonth >= yearEndMonth) return 0;
    
    const paymentsInYear = Math.min(periodsPerYear, Math.max(0, (yearEndMonth - Math.max(effectiveStartMonth, yearStartMonth)) / (12 / periodsPerYear)));
    
    return paymentAmount * paymentsInYear;
  };

  const addLoan = () => {
    const newLoan: Loan = {
      id: Date.now().toString(),
      name: '',
      type: selectedLoanType,
      principalAmount: 0,
      interestRate: 0,
      termMonths: 12,
      startYear: 'year1',
      paymentFrequency: 'monthly',
      gracePeriodMonths: 0,
      isInterestOnly: false,
      ...(selectedLoanType === 'convertible-note' && {
        conversionDetails: {
          discountRate: 20,
          valuationCap: 0,
          automaticConversion: false
        }
      })
    };

    const updatedLoans = [...data.loans, newLoan];
    updateInterestCalculations(updatedLoans);
  };

  const updateLoan = (id: string, field: string, value: any) => {
    const updatedLoans = data.loans.map(loan => 
      loan.id === id ? { ...loan, [field]: value } : loan
    );
    updateInterestCalculations(updatedLoans);
  };

  const updateConversionDetails = (id: string, field: string, value: any) => {
    const updatedLoans = data.loans.map(loan => 
      loan.id === id ? { 
        ...loan, 
        conversionDetails: { 
          ...loan.conversionDetails, 
          [field]: value 
        } 
      } : loan
    );
    updateInterestCalculations(updatedLoans);
  };

  const removeLoan = (id: string) => {
    const updatedLoans = data.loans.filter(loan => loan.id !== id);
    updateInterestCalculations(updatedLoans);
  };

  const calculateLoanInterest = (loan: Loan, year: 'year1' | 'year2' | 'year3') => {
    const yearNum = parseInt(year.replace('year', ''));
    const startYearNum = parseInt(loan.startYear.replace('year', ''));
    
    if (yearNum < startYearNum) return 0;
    
    const yearsActive = yearNum - startYearNum + 1;
    const monthsIntoLoan = Math.min(yearsActive * 12, loan.termMonths);
    
    if (loan.type === 'convertible-note') {
      // Convertible notes typically only pay interest until conversion
      return loan.principalAmount * (loan.interestRate / 100);
    }
    
    if (loan.isInterestOnly) {
      return loan.principalAmount * (loan.interestRate / 100);
    }
    
    // For term loans, calculate interest on declining balance
    const monthlyRate = loan.interestRate / 100 / 12;
    const remainingPrincipal = loan.principalAmount * Math.max(0, (loan.termMonths - (yearsActive - 1) * 12) / loan.termMonths);
    
    return remainingPrincipal * (loan.interestRate / 100);
  };

  const updateInterestCalculations = (loans: Loan[]) => {
    const newInterestExpense = {
      year1: loans.reduce((sum, loan) => sum + calculateLoanInterest(loan, 'year1'), 0),
      year2: loans.reduce((sum, loan) => sum + calculateLoanInterest(loan, 'year2'), 0),
      year3: loans.reduce((sum, loan) => sum + calculateLoanInterest(loan, 'year3'), 0)
    };

    onChange({
      loans,
      totalInterestExpense: newInterestExpense
    });
  };

  // Interest Expense data for chart
  const interestExpenseData = [1, 2, 3].map(year => {
    const yearKey = `year${year}` as 'year1' | 'year2' | 'year3';
    return {
      year: `Year ${year}`,
      interestExpense: data.totalInterestExpense[yearKey],
      totalPayments: data.loans.reduce((sum, loan) => sum + calculateTotalPayments(loan, yearKey), 0)
    };
  });

  const loanBreakdownData = data.loans.map(loan => ({
    name: loan.name || 'Unnamed Loan',
    amount: loan.principalAmount,
    rate: loan.interestRate,
    type: loan.type
  }));

  return (
    <div className="space-y-6">
      {/* Add Loan Section */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Loans & Financing</CardTitle>
          <div className="flex gap-2 items-center">
            <Select value={selectedLoanType} onValueChange={(value: any) => setSelectedLoanType(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select loan type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="term">Term Loan</SelectItem>
                <SelectItem value="line-of-credit">Line of Credit</SelectItem>
                <SelectItem value="convertible-note">Convertible Note</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addLoan} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add {selectedLoanType === 'convertible-note' ? 'Note' : 'Loan'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.loans.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No loans or financing added yet. Click "Add Loan" to get started.
            </div>
          ) : (
            data.loans.map((loan) => (
              <div key={loan.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge variant={loan.type === 'convertible-note' ? 'secondary' : 'default'}>
                      {loan.type.replace('-', ' ').toUpperCase()}
                    </Badge>
                    <Input
                      placeholder="Loan/Note Name"
                      value={loan.name}
                      onChange={(e) => updateLoan(loan.id, 'name', e.target.value)}
                      className="w-48"
                    />
                  </div>
                  <Button onClick={() => removeLoan(loan.id)} variant="outline" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">Principal Amount ($)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={loan.principalAmount || ''}
                      onChange={(e) => updateLoan(loan.id, 'principalAmount', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Interest Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="0"
                      value={loan.interestRate || ''}
                      onChange={(e) => updateLoan(loan.id, 'interestRate', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Term (Months)</Label>
                    <Input
                      type="number"
                      placeholder="12"
                      value={loan.termMonths || ''}
                      onChange={(e) => updateLoan(loan.id, 'termMonths', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Start Year</Label>
                    <Select value={loan.startYear} onValueChange={(value) => updateLoan(loan.id, 'startYear', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="year1">Year 1</SelectItem>
                        <SelectItem value="year2">Year 2</SelectItem>
                        <SelectItem value="year3">Year 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Payment Frequency</Label>
                    <Select value={loan.paymentFrequency} onValueChange={(value) => updateLoan(loan.id, 'paymentFrequency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Grace Period (Months)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={loan.gracePeriodMonths || ''}
                      onChange={(e) => updateLoan(loan.id, 'gracePeriodMonths', Number(e.target.value))}
                    />
                  </div>
                </div>

                {loan.type !== 'convertible-note' && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={loan.isInterestOnly || false}
                      onCheckedChange={(checked) => updateLoan(loan.id, 'isInterestOnly', checked)}
                    />
                    <Label className="text-sm">Interest Only Payments</Label>
                  </div>
                )}

                {loan.type === 'convertible-note' && loan.conversionDetails && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Conversion Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs text-gray-500">Discount Rate (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="20"
                          value={loan.conversionDetails.discountRate || ''}
                          onChange={(e) => updateConversionDetails(loan.id, 'discountRate', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Valuation Cap ($)</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={loan.conversionDetails.valuationCap || ''}
                          onChange={(e) => updateConversionDetails(loan.id, 'valuationCap', Number(e.target.value))}
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-4">
                        <Switch
                          checked={loan.conversionDetails.automaticConversion || false}
                          onCheckedChange={(checked) => updateConversionDetails(loan.id, 'automaticConversion', checked)}
                        />
                        <Label className="text-sm">Auto Convert</Label>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 p-3 rounded-lg space-y-3">
                  <div>
                    <h5 className="font-medium mb-2">Payment Details</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Payment Frequency:</span>
                        <span className="ml-2 font-medium capitalize">{loan.paymentFrequency}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Payment Amount:</span>
                        <span className="ml-2 font-medium">${calculatePaymentAmount(loan).toLocaleString()}</span>
                      </div>
                      {loan.gracePeriodMonths > 0 && (
                        <div>
                          <span className="text-gray-600">Grace Period:</span>
                          <span className="ml-2 font-medium">{loan.gracePeriodMonths} months</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Annual Interest Expense</h5>
                    <div className="flex gap-4 text-sm">
                      <span>Year 1: ${calculateLoanInterest(loan, 'year1').toLocaleString()}</span>
                      <span>Year 2: ${calculateLoanInterest(loan, 'year2').toLocaleString()}</span>
                      <span>Year 3: ${calculateLoanInterest(loan, 'year3').toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Interest Expense Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(year => {
          const yearKey = `year${year}` as 'year1' | 'year2' | 'year3';
          const interestExpense = data.totalInterestExpense[yearKey];
          const totalPayments = data.loans.reduce((sum, loan) => sum + calculateTotalPayments(loan, yearKey), 0);
          const principalPayments = totalPayments - interestExpense;
          
          return (
            <Card key={year} className="border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="text-lg">Year {year} Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Interest Expense:</span>
                    <span className="font-medium text-red-600">${interestExpense.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Principal Payments:</span>
                    <span className="font-medium text-blue-600">${principalPayments.toLocaleString()}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Loan Payments:</span>
                    <span className="font-bold text-gray-900">${totalPayments.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Interest Expense Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Payment Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={interestExpenseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                <Bar dataKey="interestExpense" fill="#ef4444" name="Interest Expense" />
                <Bar dataKey="totalPayments" fill="#3b82f6" name="Total Payments" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Loan Summary */}
      {data.loans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Financing Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  ${data.loans.reduce((sum, loan) => sum + loan.principalAmount, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Financing</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  ${data.totalInterestExpense.year1.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Year 1 Interest</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {data.loans.length}
                </div>
                <div className="text-sm text-gray-600">Active Loans</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {data.loans.filter(l => l.type === 'convertible-note').length}
                </div>
                <div className="text-sm text-gray-600">Convertible Notes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LoansAndFinancing;