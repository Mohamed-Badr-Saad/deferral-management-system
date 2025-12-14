// src/components/deferral/DatesSection.tsx
"use client";

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DeferralFormData } from '@/types';

interface DatesSectionProps {
  formData: Partial<DeferralFormData>;
  updateFormData: (field: string, value: any) => void;
}

export function DatesSection({ formData, updateFormData }: DatesSectionProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Date Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Deferral Request Date */}
        <div className="space-y-2">
          <Label>Deferral Request Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !formData.deferralRequestDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.deferralRequestDate ? (
                  format(formData.deferralRequestDate, 'PPP')
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.deferralRequestDate}
                onSelect={(date) => updateFormData('deferralRequestDate', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Current LAFD */}
        <div className="space-y-2">
          <Label>Current LAFD</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !formData.currentLAFD && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.currentLAFD ? (
                  format(formData.currentLAFD, 'PPP')
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.currentLAFD}
                onSelect={(date) => updateFormData('currentLAFD', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Deferred To (New LAFD) */}
        <div className="space-y-2">
          <Label>Deferred To (New LAFD) *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !formData.deferredToNewLAFD && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.deferredToNewLAFD ? (
                  format(formData.deferredToNewLAFD, 'PPP')
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.deferredToNewLAFD}
                onSelect={(date) => updateFormData('deferredToNewLAFD', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> LAFD stands for Latest Allowable Finish Date. 
          Please ensure the new LAFD date is realistic and approved by your supervisor.
        </p>
      </div>
    </div>
  );
}
