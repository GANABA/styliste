'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MeasurementField {
  name: string;
  label: string;
  unit: string;
  required: boolean;
}

interface MeasurementTemplate {
  id: string;
  name: string;
  fields: MeasurementField[] | { fields: MeasurementField[] };
}

interface MeasurementRecordFormProps {
  templates: MeasurementTemplate[];
  onSubmit: (data: { templateId: string; measurements: Record<string, number> }) => void;
  isSubmitting?: boolean;
}

export function MeasurementRecordForm({
  templates,
  onSubmit,
  isSubmitting,
}: MeasurementRecordFormProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  // Get selected template
  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  // Normalize fields structure
  const templateFields = selectedTemplate
    ? Array.isArray(selectedTemplate.fields)
      ? selectedTemplate.fields
      : selectedTemplate.fields.fields || []
    : [];

  // Build dynamic schema based on selected template
  const measurementSchema = z.object({
    templateId: z.string().min(1, 'Veuillez sélectionner un template'),
    measurements: z.record(z.string(), z.coerce.number().positive('Doit être un nombre positif')),
  });

  const form = useForm({
    resolver: zodResolver(measurementSchema),
    defaultValues: {
      templateId: '',
      measurements: {},
    },
  });

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    form.setValue('templateId', templateId);
    form.setValue('measurements', {});
  };

  const handleSubmit = (data: any) => {
    // Validate required fields
    const requiredFields = templateFields.filter((f) => f.required);
    const missingFields = requiredFields.filter(
      (f) => !data.measurements[f.name] || data.measurements[f.name] <= 0
    );

    if (missingFields.length > 0) {
      missingFields.forEach((field) => {
        form.setError(`measurements.${field.name}`, {
          message: 'Ce champ est obligatoire',
        });
      });
      return;
    }

    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Template Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Sélectionner un template</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="templateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Template de mesures <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleTemplateChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un template..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Measurements Fields */}
        {selectedTemplateId && templateFields.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Ruler className="h-5 w-5 text-gray-600" />
                <CardTitle>Mesures</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {templateFields.map((field) => (
                  <FormField
                    key={field.name}
                    control={form.control}
                    name={`measurements.${field.name}`}
                    render={() => (
                      <FormItem>
                        <FormLabel>
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="0"
                              {...form.register(`measurements.${field.name}`)}
                              className="text-base pr-12"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                              {field.unit}
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!selectedTemplateId && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
            <Ruler className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Sélectionnez un template pour commencer</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting || !selectedTemplateId}>
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer les mesures'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
