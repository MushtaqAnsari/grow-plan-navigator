import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Bot, FileText } from 'lucide-react';

interface FinancialModelAgentProps {
  onDataGenerated: (data: any) => void;
  onSwitchToManual: () => void;
}

const FinancialModelAgent: React.FC<FinancialModelAgentProps> = ({ 
  onDataGenerated, 
  onSwitchToManual 
}) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateModel = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter your financial model requirements",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-financial-model', {
        body: { prompt: prompt.trim() }
      });

      if (error) throw error;

      if (data?.financialData) {
        onDataGenerated(data.financialData);
        toast({
          title: "Success",
          description: "Financial model generated successfully!",
        });
      } else {
        throw new Error('No financial data received');
      }
    } catch (error) {
      console.error('Error generating financial model:', error);
      
      // Create user-friendly error messages
      let userMessage = 'Failed to generate your financial model.';
      let suggestion = 'Please try again or use manual entry.';
      
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('quota') || errorMsg.includes('insufficient')) {
          userMessage = 'AI service is temporarily unavailable due to high demand.';
          suggestion = 'You can create your model manually instead.';
        } else if (errorMsg.includes('network') || errorMsg.includes('timeout')) {
          userMessage = 'Connection issue while generating model.';
          suggestion = 'Please check your internet and try again.';
        } else if (errorMsg.includes('unauthorized') || errorMsg.includes('permission')) {
          userMessage = 'Authentication expired.';
          suggestion = 'Please sign in again.';
        } else if (errorMsg.includes('429') || errorMsg.includes('rate')) {
          userMessage = 'Too many requests. Please wait a moment.';
          suggestion = 'Try again in a few seconds.';
        }
      }
      
      toast({
        title: "Generation Failed",
        description: `${userMessage} ${suggestion}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Bot className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Financial Model Assistant</CardTitle>
          <CardDescription>
            Describe your financial requirements and I'll generate a complete model for you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="prompt" className="text-sm font-medium">
              Tell me about your financial model requirements:
            </label>
            <Textarea
              id="prompt"
              placeholder="Example: I need a SaaS company with $10M valuation, 50 employees, $5M annual revenue, and seed funding of $2M from Sequoia Capital..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px]"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={handleGenerateModel}
              disabled={isLoading || !prompt.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Model...
                </>
              ) : (
                <>
                  <Bot className="mr-2 h-4 w-4" />
                  Generate Financial Model
                </>
              )}
            </Button>

            <Button 
              variant="outline" 
              onClick={onSwitchToManual}
              disabled={isLoading}
              className="w-full"
            >
              <FileText className="mr-2 h-4 w-4" />
              Enter Data Manually
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-2">
            <p><strong>Examples of what you can include:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Target valuation and funding requirements</li>
              <li>Number of employees by department</li>
              <li>Expected revenue streams and amounts</li>
              <li>Operational expenses and costs</li>
              <li>Investor information and cap table</li>
              <li>Tax rates and jurisdiction</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialModelAgent;