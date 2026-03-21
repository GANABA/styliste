'use client';

import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const measurementFieldSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  label: z.string().min(1, 'Le libellé est requis'),
  unit: z.string().min(1, "L'unité est requise"),
  required: z.boolean(),
});

const templateFormSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  fields: z
    .array(measurementFieldSchema)
    .min(1, 'Au moins un champ est requis')
    .refine(
      (fields) => {
        const names = fields.map((f) => f.name);
        return names.length === new Set(names).size;
      },
      { message: 'Les noms de champs doivent être uniques' }
    ),
});

export type TemplateFormData = z.infer<typeof templateFormSchema>;

interface MeasurementTemplateFormProps {
  defaultValues?: Partial<TemplateFormData>;
  onSubmit: (data: TemplateFormData) => void;
  isSubmitting?: boolean;
}

const COMMON_UNITS = ['cm', 'mm', 'pouces'];

export function MeasurementTemplateForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}: MeasurementTemplateFormProps) {
  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: '',
      fields: [
        { name: '', label: '', unit: 'cm', required: true },
      ],
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'fields',
  });

  const handleAddField = () => {
    append({ name: '', label: '', unit: 'cm', required: false });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Template Name */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du template</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nom du template <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Homme, Femme, Enfant, Robe de mariée..."
                      {...field}
                      className="text-base"
                    />
                  </FormControl>
                  <FormDescription>
                    Un nom descriptif pour identifier ce template
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Fields */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Champs de mesures</CardTitle>
              <Button type="button" size="sm" onClick={handleAddField} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un champ
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                Aucun champ ajouté. Cliquez sur &ldquo;Ajouter un champ&rdquo; pour commencer.
              </p>
            )}

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="border rounded-lg p-4 space-y-4 bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                      Champ {index + 1}
                    </span>
                  </div>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Name */}
                  <FormField
                    control={form.control}
                    name={`fields.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Nom technique <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: tour_poitrine"
                            {...field}
                            className="text-base"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Minuscules, underscores, pas d&apos;espaces
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Label */}
                  <FormField
                    control={form.control}
                    name={`fields.${index}.label`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Libellé <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Tour de poitrine"
                            {...field}
                            className="text-base"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Nom affiché à l&apos;utilisateur
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Unit */}
                  <FormField
                    control={form.control}
                    name={`fields.${index}.unit`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Unité <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choisir une unité" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {COMMON_UNITS.map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Required */}
                  <FormField
                    control={form.control}
                    name={`fields.${index}.required`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-8">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Champ obligatoire</FormLabel>
                          <FormDescription className="text-xs">
                            Requis lors de la prise de mesure
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}

            {form.formState.errors.fields?.root && (
              <p className="text-sm text-red-600">
                {form.formState.errors.fields.root.message}
              </p>
            )}
          </CardContent>
        </Card>

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
          <Button type="submit" disabled={isSubmitting || fields.length === 0}>
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
