import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Code, 
  ShoppingBag, 
  Briefcase, 
  Factory, 
  Stethoscope, 
  GraduationCap,
  Building,
  Truck
} from 'lucide-react';

interface IndustrySelectorProps {
  onIndustrySelect: (industry: string) => void;
}

const industries = [
  {
    id: 'saas',
    name: 'SaaS / Software',
    description: 'Subscription-based software services',
    icon: Code,
    color: 'bg-blue-100 text-blue-600 border-blue-200'
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Online retail and marketplace',
    icon: ShoppingBag,
    color: 'bg-green-100 text-green-600 border-green-200'
  },
  {
    id: 'consulting',
    name: 'Consulting Services',
    description: 'Professional services and consulting',
    icon: Briefcase,
    color: 'bg-purple-100 text-purple-600 border-purple-200'
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    description: 'Physical product manufacturing',
    icon: Factory,
    color: 'bg-orange-100 text-orange-600 border-orange-200'
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Medical and healthcare services',
    icon: Stethoscope,
    color: 'bg-red-100 text-red-600 border-red-200'
  },
  {
    id: 'education',
    name: 'Education',
    description: 'Educational services and platforms',
    icon: GraduationCap,
    color: 'bg-indigo-100 text-indigo-600 border-indigo-200'
  },
  {
    id: 'realestate',
    name: 'Real Estate',
    description: 'Property and real estate services',
    icon: Building,
    color: 'bg-yellow-100 text-yellow-600 border-yellow-200'
  },
  {
    id: 'logistics',
    name: 'Logistics',
    description: 'Transportation and logistics',
    icon: Truck,
    color: 'bg-gray-100 text-gray-600 border-gray-200'
  }
];

const IndustrySelector: React.FC<IndustrySelectorProps> = ({ onIndustrySelect }) => {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">What industry is your startup in?</CardTitle>
        <CardDescription>
          Select your industry to get customized revenue stream templates and metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {industries.map((industry) => {
            const Icon = industry.icon;
            return (
              <Button
                key={industry.id}
                variant="outline"
                className={`h-auto p-6 flex flex-col items-center gap-3 hover:scale-105 transition-transform ${industry.color}`}
                onClick={() => onIndustrySelect(industry.id)}
              >
                <Icon className="w-8 h-8" />
                <div className="text-center">
                  <h3 className="font-semibold text-sm">{industry.name}</h3>
                  <p className="text-xs opacity-70 mt-1">{industry.description}</p>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default IndustrySelector;