// src/components/deferral/MitigationsSection.tsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import type { DeferralFormData, MitigationAction } from '@/types';

interface MitigationsSectionProps {
  formData: Partial<DeferralFormData>;
  updateFormData: (field: string, value: any) => void;
}

export function MitigationsSection({ formData, updateFormData }: MitigationsSectionProps) {
  const mitigations = formData.mitigations || [];

  const addMitigation = () => {
    const newMitigation: MitigationAction = {
      actionNo: mitigations.length + 1,
      action: '',
      owner: '',
      date: '',
      comments: '',
    };
    updateFormData('mitigations', [...mitigations, newMitigation]);
  };

  const updateMitigation = (index: number, field: keyof MitigationAction, value: string | number) => {
    const updated = [...mitigations];
    updated[index] = { ...updated[index], [field]: value };
    updateFormData('mitigations', updated);
  };

  const removeMitigation = (index: number) => {
    const updated = mitigations.filter((_, i) => i !== index);
    // Re-number actions
    const renumbered = updated.map((m, i) => ({ ...m, actionNo: i + 1 }));
    updateFormData('mitigations', renumbered);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Mitigation Actions</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Define actions to mitigate risks while the activity is deferred
          </p>
        </div>
        <Button onClick={addMitigation} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Action
        </Button>
      </div>

      {mitigations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No mitigation actions added</p>
            <Button onClick={addMitigation} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add First Mitigation Action
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {mitigations.map((mitigation, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-semibold">Action #{mitigation.actionNo}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMitigation(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Action Description *</Label>
                    <Textarea
                      value={mitigation.action}
                      onChange={(e) => updateMitigation(index, 'action', e.target.value)}
                      placeholder="Describe the mitigation action to be taken"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Owner *</Label>
                      <Input
                        value={mitigation.owner}
                        onChange={(e) => updateMitigation(index, 'owner', e.target.value)}
                        placeholder="Person responsible"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Target Date</Label>
                      <Input
                        type="date"
                        value={mitigation.date}
                        onChange={(e) => updateMitigation(index, 'date', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Comments</Label>
                    <Textarea
                      value={mitigation.comments}
                      onChange={(e) => updateMitigation(index, 'comments', e.target.value)}
                      placeholder="Additional comments or notes"
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Include specific, actionable mitigation measures with clear ownership 
          and timelines to improve approval chances.
        </p>
      </div>
    </div>
  );
}
