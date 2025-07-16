import { FinancialData } from "@/pages/Index";

export const createCyberLabsDemoData = (): FinancialData => {
  return {
    revenueStreams: [
      {
        name: "Educational Platform Subscriptions",
        type: "saas",
        year1: 600000,  // 3000 students * $200/year
        year2: 1400000, // 7000 students * $200/year  
        year3: 2400000, // 12000 students * $200/year
        growthRate: 133.3,
        arDays: 30
      },
      {
        name: "Corporate Training Programs",
        type: "consulting",
        year1: 150000,
        year2: 300000,
        year3: 450000,
        growthRate: 100,
        arDays: 45
      }
    ],
    costs: {
      revenueStreamCosts: {
        "Educational Platform Subscriptions": {
          directCosts: {
            cogs: { year1: 60000, year2: 140000, year3: 240000 }, // ~10% of revenue
            processing: { year1: 18000, year2: 42000, year3: 72000 }, // 3% payment processing
            fulfillment: { year1: 30000, year2: 70000, year3: 120000 }, // 5% customer support
            support: { year1: 24000, year2: 56000, year3: 96000 } // 4% technical support
          }
        },
        "Corporate Training Programs": {
          directCosts: {
            cogs: { year1: 45000, year2: 90000, year3: 135000 }, // 30% of consulting revenue
            processing: { year1: 4500, year2: 9000, year3: 13500 }, // 3% payment processing
            fulfillment: { year1: 7500, year2: 15000, year3: 22500 }, // 5% delivery costs
            support: { year1: 3000, year2: 6000, year3: 9000 } // 2% support
          }
        }
      },
      team: {
        employees: [
          {
            id: "1",
            name: "Alex Chen - CTO",
            designation: "Chief Technology Officer",
            department: "technology",
            salary: 120000,
            isCapitalized: true
          },
          {
            id: "2", 
            name: "Sarah Williams - Lead Developer",
            designation: "Lead Full Stack Developer",
            department: "technology",
            salary: 85000,
            isCapitalized: true
          },
          {
            id: "3",
            name: "Mike Rodriguez - DevOps Engineer",
            designation: "DevOps Engineer",
            department: "technology", 
            salary: 75000,
            isCapitalized: true
          },
          {
            id: "4",
            name: "Emily Davis - Marketing Manager",
            designation: "Marketing Manager",
            department: "marketing",
            salary: 65000
          },
          {
            id: "5",
            name: "John Smith - Sales Manager",
            designation: "Sales Manager", 
            department: "sales",
            salary: 70000
          },
          {
            id: "6",
            name: "Lisa Johnson - Customer Success",
            designation: "Customer Success Manager",
            department: "operations",
            salary: 55000
          }
        ],
        consultants: [
          {
            id: "1",
            name: "Legal Advisor",
            designation: "Legal Counsel",
            department: "other",
            monthlyCost: 2000
          }
        ],
        healthCare: { amount: 4000, percentage: 8 },
        benefits: { amount: 3000, percentage: 6 },
        iqama: { amount: 1500, percentage: 3 },
        recruitment: { year1: 15000, year2: 25000, year3: 35000 }
      },
      admin: {
        rent: {
          monthlyAmount: 8000,
          utilitiesPercentage: 15,
          year1: 110400, // $8000 * 12 + 15% utilities
          year2: 110400,
          year3: 110400
        },
        travel: {
          tripsPerMonth: 2,
          domesticCostPerTrip: 1500,
          internationalCostPerTrip: 4000,
          domesticTripsRatio: 70,
          year1: 21600, // Mixed domestic/international
          year2: 25200,
          year3: 28800
        },
        insurance: {
          percentageOfAssets: 2,
          year1: 5000,
          year2: 7500,
          year3: 10000
        },
        legal: { year1: 25000, year2: 30000, year3: 35000 },
        accounting: { year1: 18000, year2: 22000, year3: 26000 },
        software: {
          items: [
            {
              id: "1",
              name: "AWS Cloud Services",
              department: "technology",
              costType: "monthly",
              amount: 3000
            },
            {
              id: "2", 
              name: "Salesforce CRM",
              department: "sales",
              costType: "monthly",
              amount: 500
            },
            {
              id: "3",
              name: "HubSpot Marketing",
              department: "marketing", 
              costType: "monthly",
              amount: 800
            }
          ],
          year1: 51600, // $4300 * 12
          year2: 61200, // Increased usage
          year3: 72000
        },
        other: { year1: 15000, year2: 18000, year3: 22000 }
      },
      balanceSheet: {
        fixedAssets: {
          assets: [
            {
              id: "1",
              name: "Office Equipment & Computers",
              cost: 50000,
              usefulLife: 3,
              assetClass: "tangible"
            },
            {
              id: "2",
              name: "Educational Platform IP",
              cost: 200000,
              usefulLife: 5,
              assetClass: "intangible",
              isFromCapitalizedPayroll: true
            }
          ],
          year1: 250000,
          year2: 200000, // Depreciation
          year3: 150000
        },
        accountsReceivable: {
          revenueStreamARs: {
            "Educational Platform Subscriptions": {
              arDays: 30,
              year1: 50000,
              year2: 116667,
              year3: 200000
            },
            "Corporate Training Programs": {
              arDays: 45,
              year1: 18750,
              year2: 37500,
              year3: 56250
            }
          },
          totalYear1: 68750,
          totalYear2: 154167,
          totalYear3: 256250
        },
        accountsPayable: {
          daysForPayment: 30,
          year1: 25000,
          year2: 35000,
          year3: 45000
        },
        cashAndBank: { year1: 350000, year2: 750000, year3: 1200000 },
        inventory: { year1: 0, year2: 0, year3: 0 }, // Digital platform
        otherAssets: { year1: 15000, year2: 20000, year3: 25000 },
        otherLiabilities: { year1: 10000, year2: 15000, year3: 20000 }
      },
      marketing: {
        isPercentageOfRevenue: true,
        percentageOfRevenue: 15,
        manualBudget: { year1: 112500, year2: 255000, year3: 427500 },
        digitalAdvertising: { year1: 60000, year2: 140000, year3: 240000 },
        contentCreation: { year1: 25000, year2: 55000, year3: 90000 },
        events: { year1: 15000, year2: 35000, year3: 60000 },
        pr: { year1: 8000, year2: 15000, year3: 25000 },
        brandingDesign: { year1: 4500, year2: 10000, year3: 12500 },
        tools: { year1: 0, year2: 0, year3: 0 }, // Included in software costs
        other: { year1: 0, year2: 0, year3: 0 }
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
    taxation: {
      incomeTax: {
        enabled: true,
        corporateRate: 20,
        year1: 25000,
        year2: 75000,
        year3: 150000
      },
      zakat: {
        enabled: false,
        rate: 0,
        calculationMethod: "net-worth",
        year1: 0,
        year2: 0,
        year3: 0
      }
    },
    employees: [
      {
        id: "1",
        name: "Alex Chen - CTO",
        designation: "Chief Technology Officer",
        department: "technology",
        salary: 120000,
        isCapitalized: true
      },
      {
        id: "2",
        name: "Sarah Williams - Lead Developer", 
        designation: "Lead Full Stack Developer",
        department: "technology",
        salary: 85000,
        isCapitalized: true
      },
      {
        id: "3",
        name: "Mike Rodriguez - DevOps Engineer",
        designation: "DevOps Engineer",
        department: "technology",
        salary: 75000,
        isCapitalized: true
      },
      {
        id: "4", 
        name: "Emily Davis - Marketing Manager",
        designation: "Marketing Manager",
        department: "marketing",
        salary: 65000
      },
      {
        id: "5",
        name: "John Smith - Sales Manager",
        designation: "Sales Manager",
        department: "sales", 
        salary: 70000
      },
      {
        id: "6",
        name: "Lisa Johnson - Customer Success",
        designation: "Customer Success Manager",
        department: "operations",
        salary: 55000
      }
    ],
    funding: {
      totalFunding: 1000000, // $1M funding needed
      burnRate: 45000, // Monthly burn rate
      useOfFunds: [
        {
          category: "Product Development",
          percentage: 40,
          amount: 400000
        },
        {
          category: "Marketing & Sales",
          percentage: 30,
          amount: 300000
        },
        {
          category: "Operations", 
          percentage: 20,
          amount: 200000
        },
        {
          category: "Working Capital",
          percentage: 10,
          amount: 100000
        }
      ]
    }
  };
};

export const createCyberLabsCompanyData = () => {
  return {
    companyName: "CyberLabs",
    industry: "edtech",
    currency: "USD",
    language: "English",
    founderName: "David Park",
    businessStage: "Growth Stage",
    fundingStage: "series-a"
  };
};

// Cap table with 2 partners: 80% and 20% equity split
export const createCyberLabsCapTable = () => {
  return {
    stakeholders: [
      {
        id: "1",
        name: "David Park",
        type: "founder" as const,
        email: "david@cyberlabs.com",
        sharesOwned: 8000000,
        shareClass: "common",
        vestingSchedule: {
          totalShares: 8000000,
          vestedShares: 6000000,
          startDate: "2023-01-01",
          cliffMonths: 12,
          vestingMonths: 48
        }
      },
      {
        id: "2", 
        name: "Sarah Martinez",
        type: "founder" as const,
        email: "sarah@cyberlabs.com",
        sharesOwned: 2000000,
        shareClass: "common",
        vestingSchedule: {
          totalShares: 2000000,
          vestedShares: 1500000,
          startDate: "2023-01-01",
          cliffMonths: 12,
          vestingMonths: 48
        }
      }
    ],
    shareClasses: [
      {
        id: "1",
        name: "Common Stock",
        type: "common" as const,
        sharesAuthorized: 12000000,
        sharesIssued: 10000000,
        pricePerShare: 1.40, // $14M valuation / 10M shares
        votingRights: true
      }
    ],
    companyValuation: 15000000, // Post-money valuation after $1M investment
    totalShares: 10000000
  };
};