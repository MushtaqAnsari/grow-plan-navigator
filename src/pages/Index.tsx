import IncomeStatement from "@/components/IncomeStatement";
import Analysis from "@/components/Analysis";
import ValuationModel from "@/components/ValuationModel";
import FundUtilization from "@/components/FundUtilization";
import Valuation from "@/components/Valuation";
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import BalanceSheet from "@/components/BalanceSheet";
import IndustrySelector from "@/components/IndustrySelector";
import { BarChart3, FileText, TrendingUp, Users, DollarSign, Target } from "lucide-react";

export interface FinancialData {
  revenueStreams: {
    name: string;
    type: 'saas' | 'ecommerce' | 'advertising' | 'one-time' | 'consulting' | 'commission' | 'freemium';
    year1: number;
    year2: number;
    year3: number;
    growthRate: number;
    arDays: number; // Individual AR days per revenue stream
  }[];
  costs: {
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
      employees: {
        id: string;
        name: string;
        designation: string;
        department: 'technology' | 'sales' | 'marketing' | 'operations' | 'hr' | 'finance' | 'other';
        salary: number;
        isCapitalized?: boolean;
      }[];
      consultants: {
        id: string;
        name: string;
        designation: string;
        department: 'technology' | 'sales' | 'marketing' | 'operations' | 'hr' | 'finance' | 'other';
        monthlyCost: number;
      }[];
      healthCare: { amount: number; percentage: number; };
      benefits: { amount: number; percentage: number; };
      iqama: { amount: number; percentage: number; };
      recruitment: { year1: number; year2: number; year3: number; };
    };
    admin: {
      rent: { 
        monthlyAmount: number; 
        utilitiesPercentage: number; 
        year1: number; year2: number; year3: number; 
      };
      travel: {
        tripsPerMonth: number;
        domesticCostPerTrip: number;
        internationalCostPerTrip: number;
        domesticTripsRatio: number; // percentage of domestic vs international
        year1: number; year2: number; year3: number;
      };
      insurance: { 
        percentageOfAssets: number; 
        year1: number; year2: number; year3: number; 
      };
      legal: { year1: number; year2: number; year3: number; };
      accounting: { year1: number; year2: number; year3: number; };
      software: {
        items: {
          id: string;
          name: string;
          department: 'technology' | 'sales' | 'marketing' | 'operations' | 'hr' | 'finance' | 'other';
          costType: 'monthly' | 'yearly' | 'one-time';
          amount: number;
        }[];
        year1: number; year2: number; year3: number;
      };
      other: { year1: number; year2: number; year3: number; };
    };
    balanceSheet: {
      fixedAssets: {
        assets: {
          id: string;
          name: string;
          cost: number;
          usefulLife: number; // in years
          assetClass: 'tangible' | 'intangible';
          isFromCapitalizedPayroll?: boolean;
          linkedEmployeeId?: string;
        }[];
        year1: number; year2: number; year3: number;
      };
      accountsReceivable: {
        revenueStreamARs: {
          [key: string]: { // revenue stream name as key
            arDays: number;
            year1: number;
            year2: number;
            year3: number;
          };
        };
        totalYear1: number;
        totalYear2: number;
        totalYear3: number;
      };
      accountsPayable: {
        daysForPayment: number;
        year1: number; year2: number; year3: number;
      };
      cashAndBank: { year1: number; year2: number; year3: number; };
      inventory: { year1: number; year2: number; year3: number; };
      otherAssets: { year1: number; year2: number; year3: number; };
      otherLiabilities: { year1: number; year2: number; year3: number; };
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
  };
  loansAndFinancing: {
    loans: {
      id: string;
      name: string;
      type: 'term' | 'line-of-credit' | 'convertible-note';
      principalAmount: number;
      interestRate: number;
      termMonths: number;
      startYear: 'year1' | 'year2' | 'year3';
      isInterestOnly?: boolean;
      conversionDetails?: {
        discountRate: number;
        valuationCap: number;
        automaticConversion: boolean;
      };
    }[];
    totalInterestExpense: {
      year1: number;
      year2: number;
      year3: number;
    };
  };
  taxation?: {
    incomeTax: {
      enabled: boolean;
      corporateRate: number;
      year1: number;
      year2: number;
      year3: number;
    };
    zakat: {
      enabled: boolean;
      rate: number;
      calculationMethod: 'net-worth' | 'profit';
      year1: number;
      year2: number;
      year3: number;
    };
  };
  employees: {
    id: string;
    name: string;
    designation: string;
    department: 'technology' | 'sales' | 'marketing' | 'operations' | 'hr' | 'finance' | 'other';
    salary: number;
    isCapitalized?: boolean; // For technology department
  }[];
  funding: {
    totalFunding: number;
    burnRate: number;
    useOfFunds: {
      category: string;
      percentage: number;
      amount: number;
    }[];
  };
}

const Index = () => {
  const [industry, setIndustry] = useState<string>("");
  const [financialData, setFinancialData] = useState<FinancialData>({
    revenueStreams: [
      {
        name: "Basic Plan Subscriptions",
        type: "saas",
        year1: 450000,
        year2: 720000,
        year3: 1080000,
        growthRate: 60,
        arDays: 15
      },
      {
        name: "Premium Plan Subscriptions", 
        type: "saas",
        year1: 300000,
        year2: 540000,
        year3: 900000,
        growthRate: 80,
        arDays: 20
      },
      {
        name: "Enterprise Licenses",
        type: "saas", 
        year1: 200000,
        year2: 400000,
        year3: 720000,
        growthRate: 80,
        arDays: 45
      },
      {
        name: "Professional Services",
        type: "consulting",
        year1: 150000,
        year2: 225000,
        year3: 315000,
        growthRate: 50,
        arDays: 30
      }
    ],
    costs: {
      revenueStreamCosts: {
        "Basic Plan Subscriptions": {
          directCosts: {
            cogs: { year1: 67500, year2: 108000, year3: 162000 },
            processing: { year1: 13500, year2: 21600, year3: 32400 },
            fulfillment: { year1: 22500, year2: 36000, year3: 54000 },
            support: { year1: 45000, year2: 72000, year3: 108000 }
          }
        },
        "Premium Plan Subscriptions": {
          directCosts: {
            cogs: { year1: 45000, year2: 81000, year3: 135000 },
            processing: { year1: 9000, year2: 16200, year3: 27000 },
            fulfillment: { year1: 15000, year2: 27000, year3: 45000 },
            support: { year1: 30000, year2: 54000, year3: 90000 }
          }
        },
        "Enterprise Licenses": {
          directCosts: {
            cogs: { year1: 30000, year2: 60000, year3: 108000 },
            processing: { year1: 6000, year2: 12000, year3: 21600 },
            fulfillment: { year1: 10000, year2: 20000, year3: 36000 },
            support: { year1: 40000, year2: 80000, year3: 144000 }
          }
        },
        "Professional Services": {
          directCosts: {
            cogs: { year1: 90000, year2: 135000, year3: 189000 },
            processing: { year1: 4500, year2: 6750, year3: 9450 },
            fulfillment: { year1: 7500, year2: 11250, year3: 15750 },
            support: { year1: 15000, year2: 22500, year3: 31500 }
          }
        }
      },
      team: {
        employees: [
          {
            id: "emp-1",
            name: "Sarah Johnson",
            designation: "CEO & Co-founder",
            department: "operations",
            salary: 180000,
            isCapitalized: false
          },
          {
            id: "emp-2", 
            name: "Ahmed Al-Rashid",
            designation: "CTO & Co-founder",
            department: "technology",
            salary: 170000,
            isCapitalized: true
          },
          {
            id: "emp-3",
            name: "Maria Garcia",
            designation: "Senior Full-Stack Developer",
            department: "technology", 
            salary: 95000,
            isCapitalized: true
          },
          {
            id: "emp-4",
            name: "David Kim",
            designation: "Frontend Developer",
            department: "technology",
            salary: 80000,
            isCapitalized: true
          },
          {
            id: "emp-5",
            name: "Fatima Al-Zahra",
            designation: "UX/UI Designer",
            department: "technology",
            salary: 70000,
            isCapitalized: true
          },
          {
            id: "emp-6",
            name: "James Wilson",
            designation: "VP of Sales",
            department: "sales",
            salary: 120000,
            isCapitalized: false
          },
          {
            id: "emp-7",
            name: "Lisa Chen",
            designation: "Sales Manager",
            department: "sales",
            salary: 85000,
            isCapitalized: false
          },
          {
            id: "emp-8",
            name: "Omar Hassan",
            designation: "Customer Success Manager",
            department: "sales",
            salary: 75000,
            isCapitalized: false
          },
          {
            id: "emp-9",
            name: "Emily Rodriguez",
            designation: "Marketing Director",
            department: "marketing",
            salary: 95000,
            isCapitalized: false
          },
          {
            id: "emp-10",
            name: "Ryan Thompson",
            designation: "Content Marketing Specialist",
            department: "marketing",
            salary: 60000,
            isCapitalized: false
          },
          {
            id: "emp-11",
            name: "Nadia Mahmoud",
            designation: "Customer Support Lead",
            department: "operations",
            salary: 65000,
            isCapitalized: false
          },
          {
            id: "emp-12",
            name: "Michael Brown",
            designation: "Operations Manager",
            department: "operations",
            salary: 80000,
            isCapitalized: false
          },
          {
            id: "emp-13",
            name: "Jennifer Lee",
            designation: "HR Manager",
            department: "hr",
            salary: 75000,
            isCapitalized: false
          },
          {
            id: "emp-14",
            name: "Alex Turner",
            designation: "Financial Analyst",
            department: "finance",
            salary: 70000,
            isCapitalized: false
          }
        ],
        consultants: [
          {
            id: "cons-1",
            name: "TechLegal Advisors",
            designation: "Legal Consultant",
            department: "other",
            monthlyCost: 8000
          },
          {
            id: "cons-2",
            name: "EduConsult Group",
            designation: "EdTech Strategy Consultant", 
            department: "operations",
            monthlyCost: 12000
          },
          {
            id: "cons-3",
            name: "DataSec Solutions",
            designation: "Security Consultant",
            department: "technology",
            monthlyCost: 15000
          }
        ],
        healthCare: { amount: 500, percentage: 3 },
        benefits: { amount: 1000, percentage: 2 },
        iqama: { amount: 2000, percentage: 0 },
        recruitment: { year1: 25000, year2: 40000, year3: 60000 }
      },
      admin: {
        rent: { 
          monthlyAmount: 15000, 
          utilitiesPercentage: 20, 
          year1: 216000, year2: 216000, year3: 216000 
        },
        travel: {
          tripsPerMonth: 4,
          domesticCostPerTrip: 800,
          internationalCostPerTrip: 2500,
          domesticTripsRatio: 60,
          year1: 67200, year2: 67200, year3: 67200
        },
        insurance: { 
          percentageOfAssets: 1.5, 
          year1: 8000, year2: 12000, year3: 18000 
        },
        legal: { year1: 35000, year2: 45000, year3: 60000 },
        accounting: { year1: 25000, year2: 35000, year3: 45000 },
        software: {
          items: [
            {
              id: "soft-1",
              name: "AWS Cloud Infrastructure",
              department: "technology",
              costType: "monthly",
              amount: 8000
            },
            {
              id: "soft-2", 
              name: "Salesforce CRM",
              department: "sales",
              costType: "yearly",
              amount: 36000
            },
            {
              id: "soft-3",
              name: "HubSpot Marketing",
              department: "marketing", 
              costType: "monthly",
              amount: 3200
            },
            {
              id: "soft-4",
              name: "Slack Enterprise",
              department: "operations",
              costType: "yearly",
              amount: 12000
            },
            {
              id: "soft-5",
              name: "Figma Professional",
              department: "technology",
              costType: "yearly", 
              amount: 1800
            }
          ],
          year1: 185400, year2: 185400, year3: 185400
        },
        other: { year1: 15000, year2: 18000, year3: 22000 }
      },
      balanceSheet: {
        fixedAssets: {
          assets: [
            {
              id: "asset-1",
              name: "Development Equipment & Laptops",
              cost: 85000,
              usefulLife: 3,
              assetClass: "tangible",
              isFromCapitalizedPayroll: false
            },
            {
              id: "asset-2",
              name: "Office Furniture & Setup",
              cost: 45000,
              usefulLife: 7,
              assetClass: "tangible", 
              isFromCapitalizedPayroll: false
            },
            {
              id: "asset-3",
              name: "EduLearn Platform IP",
              cost: 415000,
              usefulLife: 10,
              assetClass: "intangible",
              isFromCapitalizedPayroll: true
            },
            {
              id: "asset-4",
              name: "Servers & Infrastructure",
              cost: 65000,
              usefulLife: 5,
              assetClass: "tangible",
              isFromCapitalizedPayroll: false
            }
          ],
          year1: 555500, year2: 507000, year3: 458500
        },
        accountsReceivable: {
          revenueStreamARs: {
            "Basic Plan Subscriptions": {
              arDays: 15,
              year1: 18493,
              year2: 29589,
              year3: 44384
            },
            "Premium Plan Subscriptions": {
              arDays: 20,
              year1: 16438,
              year2: 29589,
              year3: 49315
            },
            "Enterprise Licenses": {
              arDays: 45,
              year1: 24658,
              year2: 49315,
              year3: 88767
            },
            "Professional Services": {
              arDays: 30,
              year1: 12329,
              year2: 18493,
              year3: 25890
            }
          },
          totalYear1: 67809,
          totalYear2: 126986,
          totalYear3: 208356
        },
        accountsPayable: {
          daysForPayment: 45,
          year1: 85000,
          year2: 125000,
          year3: 185000
        },
        cashAndBank: { year1: 1250000, year2: 980000, year3: 1150000 },
        inventory: { year1: 5000, year2: 8000, year3: 12000 },
        otherAssets: { year1: 25000, year2: 35000, year3: 50000 },
        otherLiabilities: { year1: 45000, year2: 65000, year3: 85000 }
      },
      marketing: {
        isPercentageOfRevenue: true,
        percentageOfRevenue: 25,
        manualBudget: { year1: 0, year2: 0, year3: 0 },
        digitalAdvertising: { year1: 150000, year2: 200000, year3: 280000 },
        contentCreation: { year1: 80000, year2: 120000, year3: 160000 },
        events: { year1: 45000, year2: 75000, year3: 120000 },
        pr: { year1: 25000, year2: 40000, year3: 60000 },
        brandingDesign: { year1: 35000, year2: 45000, year3: 65000 },
        tools: { year1: 60000, year2: 85000, year3: 120000 },
        other: { year1: 20000, year2: 30000, year3: 45000 }
      }
    },
    loansAndFinancing: {
      loans: [],
      totalInterestExpense: {
        year1: 0,
        year2: 0, 
        year3: 0
      }
    },
    employees: [],
    funding: {
      totalFunding: 2000000,
      burnRate: 95000,
      useOfFunds: [
        {
          category: "Product Development",
          percentage: 40,
          amount: 800000
        },
        {
          category: "Sales & Marketing",
          percentage: 35,
          amount: 700000
        },
        {
          category: "Operations",
          percentage: 15,
          amount: 300000
        },
        {
          category: "Working Capital",
          percentage: 10,
          amount: 200000
        }
      ]
    }
  });

  const [activeTab, setActiveTab] = useState("income-statement");

  const updateFinancialData = (section: keyof FinancialData, data: any) => {
    setFinancialData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Financial Modeling Platform
          </h1>
          <p className="text-lg text-slate-600">
            Build comprehensive financial models for your startup across any sector
          </p>
        </div>

        {/* Industry Selection or Main Content */}
        {!industry ? (
          <IndustrySelector onIndustrySelect={(selectedIndustry) => {
            setIndustry(selectedIndustry);
            setActiveTab("income-statement");
          }} />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Industry:</span>
                <span className="font-medium text-slate-800 capitalize">{industry}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIndustry("")}
                >
                  Change Industry
                </Button>
              </div>
            </div>
            
            <TabsList className="grid w-full grid-cols-6 bg-white shadow-sm">
              <TabsTrigger value="income-statement" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Income Statement
              </TabsTrigger>
              <TabsTrigger value="balance-sheet" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Balance Sheet
              </TabsTrigger>
              <TabsTrigger value="valuation" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Valuation
              </TabsTrigger>
              <TabsTrigger value="cap-table" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Cap Table
              </TabsTrigger>
              <TabsTrigger value="fund-utilization" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Fund Utilization
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Analysis & Ratios
              </TabsTrigger>
            </TabsList>

            <TabsContent value="income-statement">
              <IncomeStatement 
                data={financialData}
                onUpdateData={setFinancialData}
              />
            </TabsContent>

            <TabsContent value="balance-sheet">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Balance Sheet
                  </CardTitle>
                  <CardDescription>
                    Assets, liabilities, and equity projections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BalanceSheet 
                    data={financialData.costs.balanceSheet}
                    onChange={(data) => updateFinancialData('costs', {
                      ...financialData.costs,
                      balanceSheet: data
                    })}
                    revenueStreams={financialData.revenueStreams}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="valuation">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Company Valuation
                  </CardTitle>
                  <CardDescription>
                    Multiple valuation methods including revenue multiples, EBITDA multiples, DCF analysis, and football field comparison
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Valuation financialData={financialData} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cap-table">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Capitalization Table
                  </CardTitle>
                  <CardDescription>
                    Share ownership, investments, and dilution analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ValuationModel />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fund-utilization">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Fund Utilization & Runway Analysis
                  </CardTitle>
                  <CardDescription>
                    Fund allocation planning, runway scenarios, and milestone tracking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FundUtilization />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Financial Analysis & Performance Ratios
                  </CardTitle>
                  <CardDescription>
                    Comprehensive business analysis with key financial ratios, performance metrics, and strategic insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Analysis data={financialData} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Index;