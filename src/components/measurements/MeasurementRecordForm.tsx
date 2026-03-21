'use client';

import { useState } from 'react';
import { Plus, Trash2, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface CustomField {
  label: string;
  value: string;
  unit: string;
}

interface MeasurementRecordFormProps {
  templates: MeasurementTemplate[];
  onSubmit: (data: { templateId: string; measurements: Record<string, number> }) => void;
  isSubmitting?: boolean;
}

function normalizeFields(template: MeasurementTemplate): MeasurementField[] {
  if (!template) return [];
  return Array.isArray(template.fields)
    ? template.fields
    : (template.fields as any).fields ?? [];
}

export function MeasurementRecordForm({
  templates,
  onSubmit,
  isSubmitting,
}: MeasurementRecordFormProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldUnit, setNewFieldUnit] = useState('cm');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
  const templateFields = selectedTemplate ? normalizeFields(selectedTemplate) : [];

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setFieldValues({});
    setCustomFields([]);
    setErrors({});
  };

  const setFieldValue = (name: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => { const e = { ...prev }; delete e[name]; return e; });
  };

  const setCustomFieldValue = (index: number, value: string) => {
    setCustomFields((prev) => prev.map((f, i) => i === index ? { ...f, value } : f));
  };

  const addCustomField = () => {
    if (!newFieldLabel.trim()) return;
    setCustomFields((prev) => [
      ...prev,
      { label: newFieldLabel.trim(), value: '', unit: newFieldUnit },
    ]);
    setNewFieldLabel('');
  };

  const removeCustomField = (index: number) => {
    setCustomFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplateId) return;

    const newErrors: Record<string, string> = {};

    // Valider les champs obligatoires du template
    for (const field of templateFields) {
      if (field.required && (!fieldValues[field.name] || Number(fieldValues[field.name]) <= 0)) {
        newErrors[field.name] = 'Champ obligatoire';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Construire les mesures finales
    const measurements: Record<string, number> = {};

    // Champs du template
    for (const field of templateFields) {
      const val = Number(fieldValues[field.name]);
      if (!isNaN(val) && val > 0) {
        measurements[field.name] = val;
      }
    }

    // Champs personnalisés (clé = label normalisé)
    for (const cf of customFields) {
      const val = Number(cf.value);
      if (cf.label && !isNaN(val) && val > 0) {
        const key = cf.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        measurements[`custom_${key}`] = val;
      }
    }

    onSubmit({ templateId: selectedTemplateId, measurements });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sélection template */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Modèle de mesures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            <Label>Choisir un modèle de base <span className="text-red-500">*</span></Label>
            <Select onValueChange={handleTemplateChange} value={selectedTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un modèle..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-400">
              Sélectionnez un modèle pour partir d&apos;une base, puis ajoutez des mesures libres si besoin.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Champs du template */}
      {selectedTemplateId && templateFields.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-gray-500" />
              <CardTitle className="text-base">Mesures · {selectedTemplate?.name}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {templateFields.map((field) => (
                <div key={field.name} className="space-y-1.5">
                  <Label>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="0"
                      value={fieldValues[field.name] ?? ''}
                      onChange={(e) => setFieldValue(field.name, e.target.value)}
                      className={`pr-12 ${errors[field.name] ? 'border-red-400' : ''}`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      {field.unit}
                    </span>
                  </div>
                  {errors[field.name] && (
                    <p className="text-xs text-red-500">{errors[field.name]}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mesures libres supplémentaires */}
      {selectedTemplateId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mesures supplémentaires</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Champs déjà ajoutés */}
            {customFields.length > 0 && (
              <div className="grid gap-3 md:grid-cols-2">
                {customFields.map((cf, i) => (
                  <div key={i} className="space-y-1.5">
                    <Label className="flex items-center justify-between">
                      <span>{cf.label}</span>
                      <button
                        type="button"
                        onClick={() => removeCustomField(i)}
                        className="text-gray-300 hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="0"
                        value={cf.value}
                        onChange={(e) => setCustomFieldValue(i, e.target.value)}
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                        {cf.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Ajouter un champ libre */}
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs text-gray-500">Nom de la mesure</Label>
                <Input
                  placeholder="Ex : Tour de tête, Longueur dos..."
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomField())}
                />
              </div>
              <div className="w-24 space-y-1.5">
                <Label className="text-xs text-gray-500">Unité</Label>
                <select
                  value={newFieldUnit}
                  onChange={(e) => setNewFieldUnit(e.target.value)}
                  className="w-full border border-input rounded-md px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                >
                  <option value="cm">cm</option>
                  <option value="mm">mm</option>
                  <option value="in">in</option>
                </select>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCustomField}
                disabled={!newFieldLabel.trim()}
                className="h-9"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {customFields.length === 0 && (
              <p className="text-xs text-gray-400">
                Ajoutez des mesures spécifiques à ce client (ex : tour de tête, longueur bras...).
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* État vide */}
      {!selectedTemplateId && (
        <div className="text-center py-12 bg-stone-50 rounded-lg border border-input border-dashed">
          <Ruler className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Sélectionnez un modèle pour commencer</p>
          <p className="text-xs text-gray-400 mt-1">Vous pourrez ensuite ajouter des mesures libres</p>
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
  );
}
