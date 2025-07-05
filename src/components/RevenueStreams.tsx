import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from 'lucide-react';

interface RevenueStream {
  name: string;
  year1: number;
  year2: number;
  year3: number;
  growthRate: number;
}

interface RevenueStreamsProps {
  data: RevenueStream[];
  onChange: (data: RevenueStream[]) => void;
}

const RevenueStreams: React.FC<RevenueStreamsProps> = ({ data, onChange }) => {
  const [newStream, setNewStream] = useState<RevenueStream>({
    name: '',
    year1: 0,
    year2: 0,
    year3: 0,
    growthRate: 0
  });

  const addRevenueStream = () => {
    if (newStream.name) {
      onChange([...data, newStream]);
      setNewStream({
        name: '',
        year1: 0,
        year2: 0,
        year3: 0,
        growthRate: 0
      });
    }
  };

  const removeRevenueStream = (index: number) => {
    const updatedData = data.filter((_, i) => i !== index);
    onChange(updatedData);
  };

  const updateRevenueStream = (index: number, field: keyof RevenueStream, value: string | number) => {
    const updatedData = data.map((stream, i) => 
      i === index ? { ...stream, [field]: value } : stream
    );
    onChange(updatedData);
  };

  const totalRevenue = (year: 'year1' | 'year2' | 'year3') => {
    return data.reduce((sum, stream) => sum + stream[year], 0);
  };

  return (
    <div className="space-y-6">
      {/* Add New Revenue Stream */}
      <Card className="border-dashed border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Revenue Stream
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="stream-name">Stream Name</Label>
              <Input
                id="stream-name"
                placeholder="e.g., SaaS Subscriptions"
                value={newStream.name}
                onChange={(e) => setNewStream({ ...newStream, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="year1">Year 1 ($)</Label>
              <Input
                id="year1"
                type="number"
                placeholder="0"
                value={newStream.year1 || ''}
                onChange={(e) => setNewStream({ ...newStream, year1: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="year2">Year 2 ($)</Label>
              <Input
                id="year2"
                type="number"
                placeholder="0"
                value={newStream.year2 || ''}
                onChange={(e) => setNewStream({ ...newStream, year2: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="year3">Year 3 ($)</Label>
              <Input
                id="year3"
                type="number"
                placeholder="0"
                value={newStream.year3 || ''}
                onChange={(e) => setNewStream({ ...newStream, year3: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addRevenueStream} className="w-full">
                Add Stream
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Revenue Streams */}
      {data.map((stream, index) => (
        <Card key={index} className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">{stream.name}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeRevenueStream(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Year 1 ($)</Label>
                <Input
                  type="number"
                  value={stream.year1 || ''}
                  onChange={(e) => updateRevenueStream(index, 'year1', Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Year 2 ($)</Label>
                <Input
                  type="number"
                  value={stream.year2 || ''}
                  onChange={(e) => updateRevenueStream(index, 'year2', Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Year 3 ($)</Label>
                <Input
                  type="number"
                  value={stream.year3 || ''}
                  onChange={(e) => updateRevenueStream(index, 'year3', Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Growth Rate (%)</Label>
                <Input
                  type="number"
                  value={stream.growthRate || ''}
                  onChange={(e) => updateRevenueStream(index, 'growthRate', Number(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Revenue Summary */}
      {data.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Total Revenue Projection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  ${totalRevenue('year1').toLocaleString()}
                </p>
                <p className="text-sm text-green-700">Year 1</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  ${totalRevenue('year2').toLocaleString()}
                </p>
                <p className="text-sm text-green-700">Year 2</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  ${totalRevenue('year3').toLocaleString()}
                </p>
                <p className="text-sm text-green-700">Year 3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RevenueStreams;
