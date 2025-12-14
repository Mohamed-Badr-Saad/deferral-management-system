// src/components/deferral/BasicInfoSection.tsx
"use client";

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { DEPARTMENTS, CRITICALITY_LEVELS } from '@/lib/constants';
import type { DeferralFormData } from '@/types';

interface BasicInfoSectionProps {
  formData: Partial<DeferralFormData>;
  updateFormData: (field: string, value: any) => void;
}

export function BasicInfoSection({ formData, updateFormData }: BasicInfoSectionProps) {
  const addWorkOrder = () => {
    const workOrders = formData.workOrderNumbers || [];
    updateFormData('workOrderNumbers', [...workOrders, '']);
  };

  const updateWorkOrder = (index: number, value: string) => {
    const workOrders = [...(formData.workOrderNumbers || [])];
    workOrders[index] = value;
    updateFormData('workOrderNumbers', workOrders);
  };

  const removeWorkOrder = (index: number) => {
    const workOrders = formData.workOrderNumbers?.filter((_, i) => i !== index) || [];
    updateFormData('workOrderNumbers', workOrders);
  };

  const addEquipmentCode = () => {
    const codes = formData.equipmentFullCodes || [];
    updateFormData('equipmentFullCodes', [...codes, '']);
  };

  const updateEquipmentCode = (index: number, value: string) => {
    const codes = [...(formData.equipmentFullCodes || [])];
    codes[index] = value;
    updateFormData('equipmentFullCodes', codes);
  };

  const removeEquipmentCode = (index: number) => {
    const codes = formData.equipmentFullCodes?.filter((_, i) => i !== index) || [];
    updateFormData('equipmentFullCodes', codes);
  };

  return (
    <div className="space-y-6">
      {/* Initiator Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Initiator Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="initiatorName">Initiator Name *</Label>
            <Input
              id="initiatorName"
              value={formData.initiatorName || ''}
              onChange={(e) => updateFormData('initiatorName', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job Title *</Label>
            <Input
              id="jobTitle"
              value={formData.jobTitle || ''}
              onChange={(e) => updateFormData('jobTitle', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department *</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => updateFormData('department', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Work Order Numbers */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Work Order Number(s)</h3>
          <Button type="button" variant="outline" size="sm" onClick={addWorkOrder}>
            <Plus className="h-4 w-4 mr-2" />
            Add Work Order
          </Button>
        </div>
        
        {formData.workOrderNumbers && formData.workOrderNumbers.length > 0 ? (
          <div className="space-y-2">
            {formData.workOrderNumbers.map((wo, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={wo}
                  onChange={(e) => updateWorkOrder(index, e.target.value)}
                  placeholder="Enter work order number"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeWorkOrder(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No work orders added</p>
        )}
      </div>

      {/* Equipment Full Codes */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Equipment Full Code(s)</h3>
          <Button type="button" variant="outline" size="sm" onClick={addEquipmentCode}>
            <Plus className="h-4 w-4 mr-2" />
            Add Equipment Code
          </Button>
        </div>
        
        {formData.equipmentFullCodes && formData.equipmentFullCodes.length > 0 ? (
          <div className="space-y-2">
            {formData.equipmentFullCodes.map((code, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={code}
                  onChange={(e) => updateEquipmentCode(index, e.target.value)}
                  placeholder="Enter equipment code"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEquipmentCode(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No equipment codes added</p>
        )}
      </div>

      {/* Equipment Description */}
      <div className="space-y-2">
        <Label htmlFor="equipmentDescription">Equipment Description *</Label>
        <Input
          id="equipmentDescription"
          value={formData.equipmentDescription || ''}
          onChange={(e) => updateFormData('equipmentDescription', e.target.value)}
          placeholder="Describe the equipment"
          required
        />
      </div>

      {/* Criticality Levels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="equipmentSafetyCriticality">Equipment Safety Criticality</Label>
          <Select
            value={formData.equipmentSafetyCriticality}
            onValueChange={(value) => updateFormData('equipmentSafetyCriticality', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select criticality" />
            </SelectTrigger>
            <SelectContent>
              {CRITICALITY_LEVELS.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="taskCriticality">Task Criticality</Label>
          <Select
            value={formData.taskCriticality}
            onValueChange={(value) => updateFormData('taskCriticality', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select criticality" />
            </SelectTrigger>
            <SelectContent>
              {CRITICALITY_LEVELS.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
