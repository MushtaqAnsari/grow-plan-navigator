import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Save, Trash2, Percent, Edit, Check, X } from 'lucide-react';
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
  const [directCosts, setDirectCosts] = useState<DirectCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCost, setEditingCost] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ year1: number; year2: number; year3: number }>({ year1: 0, year2: 0, year3: 0 });
  const [paymentProcessing, setPaymentProcessing] = useState<PaymentProcessingSettings>({ enabled: true, percentage: 2.5 });
  const { toast } = useToast();

  // Load direct costs from database
  useEffect(() => {
    loadDirectCosts();
  }, [financialModelId]);

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

  const addCustomDirectCost = async () => {
    if (!newCostName.trim() || !selectedStream) return;
    
    try {
      const { error } = await supabase
        .from('direct_costs')
        .insert({
          revenue_stream_name: selectedStream,
          cost_type: 'custom',
          cost_name: newCostName,
          year1: 0,
          year2: 0,
          year3: 0,
          financial_model_id: financialModelId,
          user_id: userId,
        });

      if (error) throw error;
      
      await loadDirectCosts();
      setNewCostName('');
      setSelectedStream('');
      setShowAddCustom(false);
      
      toast({
        title: "Custom Cost Added",
        description: "Your custom direct cost has been added successfully.",
      });
    } catch (error) {
      console.error('Error adding custom cost:', error);
      toast({
        title: "Error Adding Cost",
        description: "Failed to add the custom cost. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updatePaymentProcessing = async () => {
    try {
      // Delete existing payment processing costs
      await supabase
        .from('direct_costs')
        .delete()
        .eq('financial_model_id', financialModelId)
        .eq('user_id', userId)
        .eq('cost_type', 'payment_processing');

      // Add new payment processing costs if enabled
      if (paymentProcessing.enabled) {
        const costsToSave = revenueStreams.map(stream => ({
          revenue_stream_name: stream.name,
          cost_type: 'payment_processing',
          cost_name: 'Payment Processing Fees',
          year1: (stream.year1 * paymentProcessing.percentage) / 100,
          year2: (stream.year2 * paymentProcessing.percentage) / 100,
          year3: (stream.year3 * paymentProcessing.percentage) / 100,
          financial_model_id: financialModelId,
          user_id: userId,
        }));

        if (costsToSave.length > 0) {
          const { error } = await supabase
            .from('direct_costs')
            .insert(costsToSave);

          if (error) throw error;
        }
      }

      await loadDirectCosts();
      
      toast({
        title: "Payment Processing Updated",
        description: "Payment processing settings have been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating payment processing:', error);
      toast({
        title: "Error Updating Payment Processing",
        description: "Failed to update payment processing settings.",
        variant: "destructive",
      });
    }
  };

  const startEdit = (cost: DirectCost) => {
    if (!cost.id) return;
    setEditingCost(cost.id);
    setEditValues({
      year1: cost.year1,
      year2: cost.year2,
      year3: cost.year3,
    });
  };

  const saveEdit = async (costId: string) => {
    try {
      const { error } = await supabase
        .from('direct_costs')
        .update({
          year1: editValues.year1,
          year2: editValues.year2,
          year3: editValues.year3,
        })
        .eq('id', costId);

      if (error) throw error;
      
      await loadDirectCosts();
      setEditingCost(null);
      
      toast({
        title: "Cost Updated",
        description: "The direct cost has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating cost:', error);
      toast({
        title: "Error Updating Cost",
        description: "Failed to update the cost. Please try again.",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setEditingCost(null);
    setEditValues({ year1: 0, year2: 0, year3: 0 });
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

  const calculateTotalDirectCosts = () => {
    return {
      year1: directCosts.reduce((sum, cost) => sum + cost.year1, 0),
      year2: directCosts.reduce((sum, cost) => sum + cost.year2, 0),
      year3: directCosts.reduce((sum, cost) => sum + cost.year3, 0),
    };
  };

  const groupedCosts = directCosts.reduce((grouped, cost) => {
    if (!grouped[cost.revenue_stream_name]) {
      grouped[cost.revenue_stream_name] = [];
    }
    grouped[cost.revenue_stream_name].push(cost);
    return grouped;
  }, {} as Record<string, DirectCost[]>);

  if (revenueStreams.length === 0) {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
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
                    }}
                    className="pr-8"
                  />
                  <Percent className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 mt-1">Applied to all revenue streams</p>
              </div>
              <div className="flex items-end">
                <Button onClick={updatePaymentProcessing} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Update Processing Fees
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Custom Direct Cost */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Custom Direct Costs
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
        </CardContent>
      </Card>

      {/* Direct Costs Display */}
      {Object.keys(groupedCosts).length > 0 && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-800">Direct Costs Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(groupedCosts).map(([streamName, costs]) => (
                <div key={streamName} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-lg text-gray-800 mb-4 border-b border-gray-100 pb-2">
                    {streamName}
                  </h3>
                  <div className="space-y-3">
                    {costs.map((cost) => (
                      <div key={cost.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200">
                        <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                          <div>
                            <div className="font-medium text-gray-700">
                              {cost.cost_name || cost.cost_type.replace('_', ' ')}
                            </div>
                            <div className="text-xs text-gray-500 capitalize">{cost.cost_type.replace('_', ' ')}</div>
                          </div>
                          {editingCost === cost.id ? (
                            // Edit mode
                            <>
                              {['year1', 'year2', 'year3'].map((year, index) => (
                                <div key={year} className="text-center">
                                  <Input
                                    type="number"
                                    value={editValues[year as keyof typeof editValues]}
                                    onChange={(e) => setEditValues({
                                      ...editValues,
                                      [year]: parseFloat(e.target.value) || 0
                                    })}
                                    className="text-sm text-center"
                                  />
                                  <div className="text-xs text-gray-500 mt-1">Year {index + 1}</div>
                                </div>
                              ))}
                            </>
                          ) : (
                            // Display mode
                            <>
                              {[cost.year1, cost.year2, cost.year3].map((value, index) => (
                                <div key={index} className="text-center">
                                  <div className="text-sm font-medium text-gray-800">{formatCurrency(value)}</div>
                                  <div className="text-xs text-gray-500">Year {index + 1}</div>
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {editingCost === cost.id ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => cost.id && saveEdit(cost.id)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={cancelEdit}
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
                                onClick={() => startEdit(cost)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => cost.id && deleteCost(cost.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Subtotal for this revenue stream */}
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                      <span>Subtotal for {streamName}:</span>
                      <div className="flex gap-8">
                        <span>{formatCurrency(costs.reduce((sum, cost) => sum + cost.year1, 0))}</span>
                        <span>{formatCurrency(costs.reduce((sum, cost) => sum + cost.year2, 0))}</span>
                        <span>{formatCurrency(costs.reduce((sum, cost) => sum + cost.year3, 0))}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Grand Total */}
              <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
                <div className="flex items-center justify-between font-bold text-blue-800">
                  <span className="text-lg">Total Direct Costs:</span>
                  <div className="flex gap-12 text-lg">
                    {['year1', 'year2', 'year3'].map((year, index) => {
                      const totals = calculateTotalDirectCosts();
                      return (
                        <div key={year} className="text-center">
                          <div>{formatCurrency(totals[year as keyof typeof totals])}</div>
                          <div className="text-xs font-normal text-blue-600">Year {index + 1}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DirectCosts;