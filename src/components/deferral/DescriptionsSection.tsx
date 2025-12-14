// src/components/deferral/DescriptionsSection.tsx
"use client";

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { DeferralFormData } from '@/types';

interface DescriptionsSectionProps {
  formData: Partial<DeferralFormData>;
  updateFormData: (field: string, value: any) => void;
}

export function DescriptionsSection({ formData, updateFormData }: DescriptionsSectionProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Deferral Details</h3>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => updateFormData('description', e.target.value)}
          placeholder="Provide a detailed description of the maintenance activity being deferred"
          rows={4}
          required
        />
        <p className="text-xs text-muted-foreground">
          Describe what maintenance or inspection activity is being deferred
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="justification">Justification *</Label>
        <Textarea
          id="justification"
          value={formData.justification || ''}
          onChange={(e) => updateFormData('justification', e.target.value)}
          placeholder="Explain why this deferral is necessary"
          rows={4}
          required
        />
        <p className="text-xs text-muted-foreground">
          Provide clear reasons why this activity needs to be deferred
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="consequence">Consequence *</Label>
        <Textarea
          id="consequence"
          value={formData.consequence || ''}
          onChange={(e) => updateFormData('consequence', e.target.value)}
          placeholder="Describe potential consequences of deferring this activity"
          rows={4}
          required
        />
        <p className="text-xs text-muted-foreground">
          What are the potential impacts if this activity is deferred?
        </p>
      </div>
    </div>
  );
}
