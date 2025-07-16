import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Building2, User, Languages, Settings } from 'lucide-react';

interface CompanySetupProps {
  onSetupComplete: (companyData: any) => void;
}

const industries = [
  { id: 'saas', name: 'SaaS / Software', description: 'Subscription-based software services' },
  { id: 'ecommerce', name: 'E-commerce', description: 'Online retail and marketplace' },
  { id: 'consulting', name: 'Consulting Services', description: 'Professional services and consulting' },
  { id: 'manufacturing', name: 'Manufacturing', description: 'Physical product manufacturing' },
  { id: 'healthcare', name: 'Healthcare', description: 'Medical and healthcare services' },
  { id: 'education', name: 'Education', description: 'Educational services and platforms' },
  { id: 'realestate', name: 'Real Estate', description: 'Property and real estate services' },
  { id: 'logistics', name: 'Logistics', description: 'Transportation and logistics' },
  { id: 'fintech', name: 'FinTech', description: 'Financial technology and services' },
  { id: 'foodtech', name: 'Food & Beverage', description: 'Food technology and F&B services' },
  { id: 'media', name: 'Media & Entertainment', description: 'Digital media and entertainment' },
  { id: 'energy', name: 'Energy & Utilities', description: 'Energy and utility services' }
];

const businessStages = [
  { id: 'idea', name: 'Idea Stage', description: 'Concept development and validation' },
  { id: 'mvp', name: 'MVP Development', description: 'Building minimum viable product' },
  { id: 'early', name: 'Early Stage', description: 'Initial customers and revenue' },
  { id: 'growth', name: 'Growth Stage', description: 'Scaling operations and revenue' },
  { id: 'expansion', name: 'Expansion', description: 'Market expansion and optimization' },
  { id: 'mature', name: 'Mature', description: 'Established market presence' }
];

const fundingStages = [
  { id: 'bootstrap', name: 'Bootstrapped', description: 'Self-funded' },
  { id: 'pre-seed', name: 'Pre-Seed', description: 'Early funding from founders/friends' },
  { id: 'seed', name: 'Seed Round', description: 'First institutional funding' },
  { id: 'series-a', name: 'Series A', description: 'First major VC round' },
  { id: 'series-b', name: 'Series B', description: 'Growth funding round' },
  { id: 'series-c', name: 'Series C+', description: 'Later stage funding' },
  { id: 'ipo-ready', name: 'IPO Ready', description: 'Preparing for public offering' }
];

const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'ج.م' },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك' }
];

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' }
];

const CompanySetup: React.FC<CompanySetupProps> = ({ onSetupComplete }) => {
  const [isFounderOperator, setIsFounderOperator] = useState(true);
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    businessStage: '',
    fundingStage: '',
    description: '',
    foundedYear: new Date().getFullYear(),
    location: '',
    website: '',
    currency: 'USD',
    language: 'en',
    // Founder Information
    founderName: '',
    founderEmail: '',
    founderPhone: '',
    founderRole: '',
    // Operator Information (if different from founder)
    operatorName: '',
    operatorEmail: '',
    operatorPhone: '',
    operatorRole: '',
    // Business Details
    targetMarket: '',
    businessModel: '',
    keyProducts: '',
    competitiveAdvantage: ''
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.companyName || !formData.industry || !formData.founderName) {
      alert('Please fill in the required fields (Company Name, Industry, and Founder Name)');
      return;
    }
    
    // If founder is operator, copy founder info to operator fields
    const finalData = isFounderOperator ? {
      ...formData,
      operatorName: formData.founderName,
      operatorEmail: formData.founderEmail,
      operatorPhone: formData.founderPhone,
      operatorRole: formData.founderRole,
      isFounderOperator: true
    } : {
      ...formData,
      isFounderOperator: false
    };
    
    onSetupComplete({ ...finalData, industry: finalData.industry });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 py-8 px-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-blue-900/20 to-purple-900/20 opacity-30"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl mb-6 border border-white/20">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            FinModel Pro
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Create comprehensive financial models tailored to your business with professional-grade analytics and reporting
          </p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-md relative overflow-hidden">
          {/* Card Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50"></div>
          <div className="relative z-10">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl text-slate-800 bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent">
                Company Setup
              </CardTitle>
              <CardDescription className="text-slate-600 text-lg">
                Provide your company details to get started with financial modeling
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-8">
              {/* Settings Row */}
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200/50 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Settings className="w-3 h-3 text-blue-600" />
                  </div>
                  Preferences
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Language</Label>
                    <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            <div className="flex items-center gap-2">
                              <Languages className="w-4 h-4" />
                              <span>{lang.nativeName}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Currency</Label>
                    <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm">{currency.symbol}</span>
                              <span>{currency.name} ({currency.code})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Founder is Operator</Label>
                    <div className="flex items-center space-x-2 h-10">
                      <Switch
                        checked={isFounderOperator}
                        onCheckedChange={setIsFounderOperator}
                        id="founder-operator"
                      />
                      <Label htmlFor="founder-operator" className="text-sm text-slate-600">
                        {isFounderOperator ? 'Same person' : 'Different people'}
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Company Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-sm font-medium text-slate-700">
                      Company Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="Enter your company name"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry" className="text-sm font-medium text-slate-700">
                      Industry <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry.id} value={industry.id}>
                            <div>
                              <div className="font-medium">{industry.name}</div>
                              <div className="text-xs text-slate-500">{industry.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessStage" className="text-sm font-medium text-slate-700">
                      Business Stage
                    </Label>
                    <Select value={formData.businessStage} onValueChange={(value) => handleInputChange('businessStage', value)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select business stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessStages.map((stage) => (
                          <SelectItem key={stage.id} value={stage.id}>
                            <div>
                              <div className="font-medium">{stage.name}</div>
                              <div className="text-xs text-slate-500">{stage.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fundingStage" className="text-sm font-medium text-slate-700">
                      Funding Stage
                    </Label>
                    <Select value={formData.fundingStage} onValueChange={(value) => handleInputChange('fundingStage', value)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select funding stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {fundingStages.map((stage) => (
                          <SelectItem key={stage.id} value={stage.id}>
                            <div>
                              <div className="font-medium">{stage.name}</div>
                              <div className="text-xs text-slate-500">{stage.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="foundedYear" className="text-sm font-medium text-slate-700">
                      Founded Year
                    </Label>
                    <Input
                      id="foundedYear"
                      type="number"
                      value={formData.foundedYear}
                      onChange={(e) => handleInputChange('foundedYear', parseInt(e.target.value))}
                      placeholder="2024"
                      min="1900"
                      max={new Date().getFullYear()}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-medium text-slate-700">
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="City, Country"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="text-sm font-medium text-slate-700">
                    Website
                  </Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://www.yourcompany.com"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                    Company Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Brief description of your company and what you do..."
                    className="min-h-20"
                  />
                </div>
              </div>

              {/* Founder Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {isFounderOperator ? 'Founder / Operator Information' : 'Founder Information'}
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="founderName" className="text-sm font-medium text-slate-700">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="founderName"
                      value={formData.founderName}
                      onChange={(e) => handleInputChange('founderName', e.target.value)}
                      placeholder="Enter founder's name"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="founderRole" className="text-sm font-medium text-slate-700">
                      Role/Title
                    </Label>
                    <Input
                      id="founderRole"
                      value={formData.founderRole}
                      onChange={(e) => handleInputChange('founderRole', e.target.value)}
                      placeholder="CEO, Founder, etc."
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="founderEmail" className="text-sm font-medium text-slate-700">
                      Email
                    </Label>
                    <Input
                      id="founderEmail"
                      type="email"
                      value={formData.founderEmail}
                      onChange={(e) => handleInputChange('founderEmail', e.target.value)}
                      placeholder="founder@company.com"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="founderPhone" className="text-sm font-medium text-slate-700">
                      Phone
                    </Label>
                    <Input
                      id="founderPhone"
                      value={formData.founderPhone}
                      onChange={(e) => handleInputChange('founderPhone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              {/* Operator Information - Only show if different from founder */}
              {!isFounderOperator && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Operator Information</h3>
                    <span className="text-sm text-slate-500">(Different from founder)</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="operatorName" className="text-sm font-medium text-slate-700">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="operatorName"
                        value={formData.operatorName}
                        onChange={(e) => handleInputChange('operatorName', e.target.value)}
                        placeholder="Enter operator's name"
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="operatorRole" className="text-sm font-medium text-slate-700">
                        Role/Title
                      </Label>
                      <Input
                        id="operatorRole"
                        value={formData.operatorRole}
                        onChange={(e) => handleInputChange('operatorRole', e.target.value)}
                        placeholder="COO, General Manager, etc."
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="operatorEmail" className="text-sm font-medium text-slate-700">
                        Email
                      </Label>
                      <Input
                        id="operatorEmail"
                        type="email"
                        value={formData.operatorEmail}
                        onChange={(e) => handleInputChange('operatorEmail', e.target.value)}
                        placeholder="operator@company.com"
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="operatorPhone" className="text-sm font-medium text-slate-700">
                        Phone
                      </Label>
                      <Input
                        id="operatorPhone"
                        value={formData.operatorPhone}
                        onChange={(e) => handleInputChange('operatorPhone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col items-center gap-4 pt-8">
                <Button 
                  onClick={handleSubmit} 
                  size="lg"
                  className="px-16 h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-0"
                >
                  <Building2 className="w-5 h-5 mr-3" />
                  Create Financial Model
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-slate-500 mb-2">Or explore with demo data</p>
                  <Button 
                    variant="outline"
                    onClick={() => onSetupComplete({
                      companyName: "CyberLabs",
                      industry: "edtech", 
                      currency: "USD",
                      language: "English",
                      founderName: "David Park",
                      businessStage: "Growth Stage",
                      fundingStage: "series-a"
                    })}
                    className="text-primary border-primary hover:bg-primary/5"
                  >
                    Load CyberLabs Demo Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CompanySetup;