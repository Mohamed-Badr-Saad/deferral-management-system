// src/components/deferral/RiskAssessmentSection.tsx
"use client";

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RISK_CATEGORIES, SEVERITY_LEVELS, LIKELIHOOD_LEVELS } from '@/lib/constants';
import type { DeferralFormData, RiskAssessment } from '@/types';

interface RiskAssessmentSectionProps {
  formData: Partial<DeferralFormData>;
  updateFormData: (field: string, value: any) => void;
}

export function RiskAssessmentSection({ formData, updateFormData }: RiskAssessmentSectionProps) {
  const riskAssessment = formData.riskAssessment || {
    people: { severity: '', likelihood: '', justification: '' },
    asset: { severity: '', likelihood: '', justification: '' },
    environment: { severity: '', likelihood: '', justification: '' },
    reputation: { severity: '', likelihood: '', justification: '' },
  };

  const updateRiskItem = (category: string, field: string, value: string) => {
    const updated = {
      ...riskAssessment,
      [category]: {
        ...riskAssessment[category as keyof RiskAssessment],
        [field]: value,
      },
    };
    updateFormData('riskAssessment', updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Associated Risk Assessment</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Assess the risk for each category if this activity is deferred
        </p>
      </div>

      <div className="space-y-6">
        {RISK_CATEGORIES.map((category) => {
          const categoryKey = category.toLowerCase() as keyof RiskAssessment;
          const riskItem = riskAssessment[categoryKey];

          return (
            <div key={category} className="border rounded-lg p-4 space-y-4">
              <h4 className="font-semibold text-base">{category}</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Severity</Label>
                  <Select
                    value={riskItem.severity}
                    onValueChange={(value) => updateRiskItem(categoryKey, 'severity', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEVERITY_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Likelihood</Label>
                  <Select
                    value={riskItem.likelihood}
                    onValueChange={(value) => updateRiskItem(categoryKey, 'likelihood', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select likelihood" />
                    </SelectTrigger>
                    <SelectContent>
                      {LIKELIHOOD_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Justification</Label>
                <Textarea
                  value={riskItem.justification}
                  onChange={(e) => updateRiskItem(categoryKey, 'justification', e.target.value)}
                  placeholder={`Justify the ${category.toLowerCase()} risk assessment`}
                  rows={3}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Important:</strong> Risk assessment is critical for approval. 
          Please provide accurate severity and likelihood ratings with proper justification.
        </p>
      </div>
    </div>
  );
}
