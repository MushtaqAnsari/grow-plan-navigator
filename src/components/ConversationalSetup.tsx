import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { MessageCircle, Sparkles, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConversationalSetupProps {
  onComplete: (data: any) => void;
}

interface Message {
  type: 'bot' | 'user';
  text: string;
}

const ConversationalSetup = ({ onComplete }: ConversationalSetupProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { type: 'bot', text: "Hey there! 👋 I'm here to help you build an awesome financial model. What's your company called?" }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [step, setStep] = useState(0);
  const [confidence, setConfidence] = useState(10);
  const [collectedData, setCollectedData] = useState<any>({});

  const questions = [
    { 
      key: 'companyName', 
      question: "Awesome! What industry are you in? (e.g., SaaS, E-commerce, FinTech)",
      confidenceBoost: 15
    },
    { 
      key: 'industry', 
      question: "Cool! 🚀 How much revenue are you targeting in Year 1? (Just a rough number is fine)",
      confidenceBoost: 20
    },
    { 
      key: 'targetRevenue', 
      question: "Nice! How many people are on your team right now?",
      confidenceBoost: 15
    },
    { 
      key: 'teamSize', 
      question: "Got it! What's your monthly burn rate? (Roughly how much you spend per month)",
      confidenceBoost: 20
    },
    { 
      key: 'burnRate', 
      question: "Perfect! Last one - tell me briefly about your main revenue streams or business model",
      confidenceBoost: 20
    }
  ];

  const handleSend = () => {
    if (!currentInput.trim()) return;

    const userMessage: Message = { type: 'user', text: currentInput };
    setMessages(prev => [...prev, userMessage]);

    const currentQuestion = questions[step];
    if (currentQuestion) {
      setCollectedData(prev => ({
        ...prev,
        [currentQuestion.key]: currentInput
      }));

      setConfidence(prev => Math.min(100, prev + currentQuestion.confidenceBoost));

      if (step < questions.length - 1) {
        setTimeout(() => {
          const botMessage: Message = { type: 'bot', text: questions[step + 1].question };
          setMessages(prev => [...prev, botMessage]);
          setStep(step + 1);
        }, 500);
      } else {
        setTimeout(() => {
          const botMessage: Message = { 
            type: 'bot', 
            text: "Amazing! 🎉 I've got everything I need. Let me create your financial model now..." 
          };
          setMessages(prev => [...prev, botMessage]);
          
          setTimeout(() => {
            generateFinancialModel();
          }, 1500);
        }, 500);
      }
    }

    setCurrentInput('');
  };

  const generateFinancialModel = () => {
    const modelData = {
      companyData: {
        companyName: collectedData.companyName || 'My Startup',
        industry: collectedData.industry || 'Technology',
        currency: 'USD',
        language: 'en',
        planningPeriod: 3
      },
      revenueStreams: [{
        name: 'Primary Revenue',
        type: 'saas' as const,
        year1: parseFloat(collectedData.targetRevenue?.replace(/[^0-9.]/g, '')) || 100000,
        year2: (parseFloat(collectedData.targetRevenue?.replace(/[^0-9.]/g, '')) || 100000) * 1.5,
        year3: (parseFloat(collectedData.targetRevenue?.replace(/[^0-9.]/g, '')) || 100000) * 2.25,
        growthRate: 50,
        arDays: 30
      }],
      costs: {
        revenueStreamCosts: {},
        team: {
          employees: Array.from({ length: parseInt(collectedData.teamSize) || 5 }, (_, i) => ({
            id: `emp-${i}`,
            name: `Team Member ${i + 1}`,
            designation: 'Employee',
            department: 'operations' as const,
            salary: 60000,
            isCapitalized: false
          })),
          consultants: [],
          healthCare: { amount: 0, percentage: 5 },
          benefits: { amount: 0, percentage: 3 },
          iqama: { amount: 0, percentage: 0 },
          recruitment: { year1: 5000, year2: 8000, year3: 10000 }
        },
        admin: {
          rent: { monthlyAmount: 5000, utilitiesPercentage: 10, year1: 60000, year2: 65000, year3: 70000 },
          travel: { tripsPerMonth: 2, domesticCostPerTrip: 500, internationalCostPerTrip: 2000, domesticTripsRatio: 0.7, year1: 12000, year2: 15000, year3: 18000 },
          insurance: { percentageOfAssets: 2, year1: 5000, year2: 6000, year3: 7000 },
          legal: { year1: 10000, year2: 12000, year3: 15000 },
          accounting: { year1: 8000, year2: 10000, year3: 12000 },
          software: { items: [], year1: 20000, year2: 25000, year3: 30000 },
          other: { year1: 10000, year2: 12000, year3: 15000 }
        },
        balanceSheet: {
          fixedAssets: { assets: [], year1: 50000, year2: 60000, year3: 70000 },
          accountsReceivable: { revenueStreamARs: {}, totalYear1: 0, totalYear2: 0, totalYear3: 0 },
          accountsPayable: { daysForPayment: 30, year1: 0, year2: 0, year3: 0 },
          cashAndBank: { year1: 100000, year2: 150000, year3: 200000 },
          inventory: { year1: 0, year2: 0, year3: 0 },
          otherAssets: { year1: 10000, year2: 15000, year3: 20000 },
          otherLiabilities: { year1: 0, year2: 0, year3: 0 }
        },
        marketing: {
          isPercentageOfRevenue: true,
          percentageOfRevenue: 15,
          manualBudget: { year1: 0, year2: 0, year3: 0 },
          digitalAdvertising: { year1: 0, year2: 0, year3: 0 },
          contentCreation: { year1: 0, year2: 0, year3: 0 },
          events: { year1: 0, year2: 0, year3: 0 },
          pr: { year1: 0, year2: 0, year3: 0 },
          brandingDesign: { year1: 0, year2: 0, year3: 0 },
          tools: { year1: 0, year2: 0, year3: 0 },
          other: { year1: 0, year2: 0, year3: 0 }
        }
      },
      funding: {
        totalFunding: (parseFloat(collectedData.burnRate?.replace(/[^0-9.]/g, '')) || 10000) * 18,
        burnRate: parseFloat(collectedData.burnRate?.replace(/[^0-9.]/g, '')) || 10000,
        useOfFunds: [
          { category: 'Team & Operations', percentage: 60, amount: 0 },
          { category: 'Marketing', percentage: 20, amount: 0 },
          { category: 'Technology', percentage: 15, amount: 0 },
          { category: 'Other', percentage: 5, amount: 0 }
        ]
      }
    };

    onComplete(modelData);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl shadow-2xl border-2 border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6" />
              <CardTitle className="text-2xl">Financial Model Builder</CardTitle>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-semibold">{confidence}% Confidence</span>
            </div>
          </div>
          <Progress value={confidence} className="mt-3 h-2 bg-white/30" />
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-4 mb-6 h-96 overflow-y-auto">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'bg-white border-2 border-purple-200 text-gray-800'
                    }`}
                  >
                    {message.type === 'bot' && (
                      <MessageCircle className="w-4 h-4 inline mr-2 text-purple-600" />
                    )}
                    {message.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {step < questions.length && (
            <div className="flex gap-2">
              <Input
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your answer here..."
                className="flex-1 border-2 border-purple-200 focus:border-purple-400 text-lg"
              />
              <Button 
                onClick={handleSend}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8"
              >
                Send
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversationalSetup;
