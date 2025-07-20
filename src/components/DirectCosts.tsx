import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Save, Trash2, Percent } from 'lucide-react';
import { FinancialData } from "@/pages/Index";
import { formatCurrency } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RevenueStream {
  name: string;
  type: string;
  year1: number;
  year2: number;
  year3: number;
}

interface DirectCost {
  id?: string;
  revenue_stream_name: string;
  cost_type: string;
  cost_name?: string;
  year1: number;
  year2: number;
  year3: number;
}

interface PaymentProcessingSettings {
  enabled: boolean;
  percentage: number;
}

interface DirectCostsProps {
  data: FinancialData['costs']['revenueStreamCosts'];
  onChange: (data: FinancialData['costs']['revenueStreamCosts']) => void;
  revenueStreams: RevenueStream[];
  financialModelId: string;
  userId: string;
}

const DirectCosts: React.FC<DirectCostsProps> = ({ data, onChange, revenueStreams, financialModelId, userId }) => {
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [selectedStream, setSelectedStream] = useState('');
  const [newCostName, setNewCostName] = useState('');
  const [localData, setLocalData] = useState(data);
  const [hasChanges, setHasChanges] = useState(false);
  const [directCosts, setDirectCosts] = useState<DirectCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentProcessing, setPaymentProcessing] = useState<PaymentProcessingSettings>({ enabled: true, percentage: 2.5 });
  const { toast } = useToast();

  // Load direct costs from database
  useEffect(() => {
    loadDirectCosts();
  }, [financialModelId]);

  // Sync localData with props when data changes
  useEffect(() => {
    setLocalData(data);
    setHasChanges(false);
  }, [data]);

  const updateCustomCost = (
    streamName: string, 
    costName: string,
    year: 'year1' | 'year2' | 'year3', 
    value: number
  ) => {
    const updatedData = { ...localData };
    if (!updatedData[streamName]) {
      updatedData[streamName] = {
        directCosts: {
          cogs: { year1: 0, year2: 0, year3: 0 },
          processing: { year1: 0, year2: 0, year3: 0 },
          fulfillment: { year1: 0, year2: 0, year3: 0 }
        }
      };
    }
    
    if (!updatedData[streamName].directCosts[costName]) {
      updatedData[streamName].directCosts[costName] = { year1: 0, year2: 0, year3: 0 };
    }
    
    updatedData[streamName].directCosts[costName][year] = value;
    setLocalData(updatedData);
    setHasChanges(true);
  };

  const addCustomDirectCost = () => {
    if (!newCostName.trim() || !selectedStream) return;
    
    const updatedData = { ...localData };
    const costKey = newCostName.toLowerCase().replace(/\s+/g, '_');
    
    if (!updatedData[selectedStream]) {
      updatedData[selectedStream] = {
        directCosts: {
          cogs: { year1: 0, year2: 0, year3: 0 },
          processing: { year1: 0, year2: 0, year3: 0 },
          fulfillment: { year1: 0, year2: 0, year3: 0 }
        }
      };
    }
    
    updatedData[selectedStream].directCosts[costKey] = { year1: 0, year2: 0, year3: 0 };
    
    setLocalData(updatedData);
    setHasChanges(true);
    setNewCostName('');
    setSelectedStream('');
    setShowAddCustom(false);
  };

  const loadDirectCosts = async () => {
    try {
      setLoading(true);
      const { data: costs, error } = await supabase
        .from('direct_costs')
        .select('*')
        .eq('financial_model_id', financialModelId)
        .eq('user_id', userId);

      if (error) throw error;
      setDirectCosts(costs || []);
    } catch (error) {
      console.error('Error loading direct costs:', error);
      toast({
        title: "Error Loading Direct Costs",
        description: "Failed to load your direct costs from the database.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Convert localData to DirectCost format for saving
      const costsToSave: DirectCost[] = [];
      
      // Add payment processing costs
      if (paymentProcessing.enabled) {
        revenueStreams.forEach(stream => {
          costsToSave.push({
            revenue_stream_name: stream.name,
            cost_type: 'payment_processing',
            cost_name: 'Payment Processing Fees',
            year1: (stream.year1 * paymentProcessing.percentage) / 100,
            year2: (stream.year2 * paymentProcessing.percentage) / 100,
            year3: (stream.year3 * paymentProcessing.percentage) / 100,
          });
        });
      }
      
      // Add custom costs
      Object.entries(localData).forEach(([streamName, streamData]) => {
        Object.entries(streamData.directCosts).forEach(([costType, costData]) => {
          if (!['cogs', 'processing', 'fulfillment'].includes(costType)) {
            costsToSave.push({
              revenue_stream_name: streamName,
              cost_type: 'custom',
              cost_name: costType.replace(/_/g, ' '),
              year1: costData.year1 || 0,
              year2: costData.year2 || 0,
              year3: costData.year3 || 0,
            });
          }
        });
      });

      // Delete existing costs for this financial model
      await supabase
        .from('direct_costs')
        .delete()
        .eq('financial_model_id', financialModelId)
        .eq('user_id', userId);

      // Insert new costs
      if (costsToSave.length > 0) {
        const { error } = await supabase
          .from('direct_costs')
          .insert(
            costsToSave.map(cost => ({
              ...cost,
              financial_model_id: financialModelId,
              user_id: userId,
            }))
          );

        if (error) throw error;
      }

      await loadDirectCosts();
      onChange(localData);
      setHasChanges(false);
      
      toast({
        title: "Direct Costs Saved",
        description: "Your direct costs have been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving direct costs:', error);
      toast({
        title: "Error Saving Direct Costs",
        description: "Failed to save your direct costs. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteCost = async (costId: string) => {
    try {
      const { error } = await supabase
        .from('direct_costs')
        .delete()
        .eq('id', costId);

      if (error) throw error;
      
      await loadDirectCosts();
      toast({
        title: "Direct Cost Deleted",
        description: "The direct cost has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting direct cost:', error);
      toast({
        title: "Error Deleting Direct Cost",
        description: "Failed to delete the direct cost. Please try again.",
        variant: "destructive",
      });
    }
  };

  const calculatePaymentProcessingCosts = () => {
    if (!paymentProcessing.enabled) return { year1: 0, year2: 0, year3: 0 };
    
    return {
      year1: revenueStreams.reduce((sum, stream) => sum + (stream.year1 * paymentProcessing.percentage) / 100, 0),
      year2: revenueStreams.reduce((sum, stream) => sum + (stream.year2 * paymentProcessing.percentage) / 100, 0),
      year3: revenueStreams.reduce((sum, stream) => sum + (stream.year3 * paymentProcessing.percentage) / 100, 0),
    };
  };

  const calculateCustomCosts = () => {
    const totals = { year1: 0, year2: 0, year3: 0 };
    
    Object.values(localData).forEach(streamData => {
      Object.entries(streamData.directCosts).forEach(([costType, costData]) => {
        if (!['cogs', 'processing', 'fulfillment'].includes(costType)) {
          totals.year1 += costData.year1 || 0;
          totals.year2 += costData.year2 || 0;
          totals.year3 += costData.year3 || 0;
        }
      });
    });
    
    return totals;
  };

  const calculateTotalDirectCosts = () => {
    const paymentCosts = calculatePaymentProcessingCosts();
    const customCosts = calculateCustomCosts();
    
    return {
      year1: paymentCosts.year1 + customCosts.year1,
      year2: paymentCosts.year2 + customCosts.year2,
      year3: paymentCosts.year3 + customCosts.year3,
    };
  };

  return (
    <div className="space-y-6">
      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={!hasChanges}
          className="bg-primary hover:bg-primary/90 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Direct Costs
        </Button>
      </div>

      {revenueStreams.length === 0 ? (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6 text-center">
            <div className="text-orange-600 mb-2">
              <svg className="w-12 h-12 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-orange-700 font-medium mb-2">No Revenue Streams Found</p>
            <p className="text-orange-600 text-sm">
              Please add revenue streams first in the <strong>"Revenue"</strong> tab, then return here to define their associated direct costs.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Global Payment Processing Settings */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center gap-2">
                <Percent className="w-5 h-5" />
                Payment Processing Fees (Global)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={paymentProcessing.enabled}
                    onChange={(e) => {
                      setPaymentProcessing({ ...paymentProcessing, enabled: e.target.checked });
                      setHasChanges(true);
                    }}
                    className="rounded"
                  />
                  Enable payment processing fees
                </Label>
              </div>
              
              {paymentProcessing.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Processing Fee Percentage</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={paymentProcessing.percentage}
                        onChange={(e) => {
                          setPaymentProcessing({ ...paymentProcessing, percentage: parseFloat(e.target.value) || 0 });
                          setHasChanges(true);
                        }}
                        className="pr-8"
                      />
                      <Percent className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Applied to all revenue streams</p>
                  </div>
                  <div className="bg-white p-4 rounded border border-blue-200">
                    <h4 className="font-medium text-sm mb-2">Estimated Processing Costs</h4>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      {['year1', 'year2', 'year3'].map((year, index) => {
                        const costs = calculatePaymentProcessingCosts();
                        return (
                          <div key={year} className="text-center">
                            <div className="font-medium">{formatCurrency(costs[year as keyof typeof costs])}</div>
                            <div className="text-xs text-gray-500">Year {index + 1}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Custom Direct Costs */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Custom Direct Costs by Revenue Stream
                </span>
                <Button 
                  onClick={() => setShowAddCustom(true)}
                  variant="outline" 
                  size="sm"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Cost
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showAddCustom && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label>Revenue Stream</Label>
                      <Select value={selectedStream} onValueChange={setSelectedStream}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select revenue stream" />
                        </SelectTrigger>
                        <SelectContent>
                          {revenueStreams.map(stream => (
                            <SelectItem key={stream.name} value={stream.name}>
                              {stream.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Cost Name</Label>
                      <Input
                        placeholder="e.g., Raw Materials, Licensing Fees"
                        value={newCostName}
                        onChange={(e) => setNewCostName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addCustomDirectCost} size="sm">
                      Add Cost
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setShowAddCustom(false);
                        setNewCostName('');
                        setSelectedStream('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Compact view of custom costs */}
              <div className="space-y-4">
                {revenueStreams.map(stream => {
                  const streamCosts = localData[stream.name]?.directCosts || {};
                  const customCosts = Object.entries(streamCosts).filter(([key]) => !['cogs', 'processing', 'fulfillment'].includes(key));
                  
                  if (customCosts.length === 0) return null;
                  
                  return (
                    <div key={stream.name} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-800 mb-3">{stream.name}</h3>
                      <div className="space-y-3">
                        {customCosts.map(([costKey, costData]) => (
                          <div key={costKey} className="grid grid-cols-4 gap-4 items-center bg-gray-50 p-3 rounded">
                            <div className="font-medium text-sm capitalize">
                              {costKey.replace(/_/g, ' ')}
                            </div>
                            {['year1', 'year2', 'year3'].map(year => (
                              <div key={year}>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  value={costData[year] || ''}
                                  onChange={(e) => updateCustomCost(
                                    stream.name, 
                                    costKey,
                                    year as 'year1' | 'year2' | 'year3', 
                                    parseFloat(e.target.value) || 0
                                  )}
                                  className="text-sm"
                                />
                                <div className="text-xs text-gray-500 mt-1">Year {year.slice(-1)}</div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-slate-50 border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-800">Direct Costs Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Payment Processing */}
                {paymentProcessing.enabled && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="font-medium">Payment Processing ({paymentProcessing.percentage}%)</span>
                    <div className="flex gap-6 text-sm">
                      {['year1', 'year2', 'year3'].map((year, index) => {
                        const costs = calculatePaymentProcessingCosts();
                        return (
                          <div key={year} className="text-center">
                            <div className="font-medium">{formatCurrency(costs[year as keyof typeof costs])}</div>
                            <div className="text-xs text-gray-500">Y{index + 1}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Custom Costs */}
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="font-medium">Custom Direct Costs</span>
                  <div className="flex gap-6 text-sm">
                    {['year1', 'year2', 'year3'].map((year, index) => {
                      const costs = calculateCustomCosts();
                      return (
                        <div key={year} className="text-center">
                          <div className="font-medium">{formatCurrency(costs[year as keyof typeof costs])}</div>
                          <div className="text-xs text-gray-500">Y{index + 1}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Total */}
                <div className="flex justify-between items-center py-3 bg-blue-50 px-4 rounded border-l-4 border-l-blue-400">
                  <span className="font-bold text-blue-800">Total Direct Costs</span>
                  <div className="flex gap-6">
                    {['year1', 'year2', 'year3'].map((year, index) => {
                      const totals = calculateTotalDirectCosts();
                      return (
                        <div key={year} className="text-center">
                          <div className="font-bold text-blue-800">{formatCurrency(totals[year as keyof typeof totals])}</div>
                          <div className="text-xs text-blue-600">Year {index + 1}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default DirectCosts;