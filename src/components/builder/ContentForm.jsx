import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ContentForm = ({ pageName, fields, formData, onChange, onRevert }) => {
  // Group fields by section
  const groupedFields = fields.reduce((acc, field) => {
    const section = field.section || 'General';
    if (!acc[section]) acc[section] = [];
    acc[section].push(field);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold capitalize">{pageName.replace(/_/g, ' ')} Content</h2>
        <Badge variant="secondary">{fields.length} Fields</Badge>
      </div>

      <Accordion type="multiple" defaultValue={Object.keys(groupedFields)} className="space-y-4">
        {Object.entries(groupedFields).map(([section, sectionFields]) => (
          <AccordionItem key={section} value={section} className="border border-slate-800 rounded-lg bg-slate-900/50 px-4">
            <AccordionTrigger className="hover:no-underline py-4">
              <span className="text-lg font-semibold text-slate-200">{section}</span>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-6 space-y-6">
              {sectionFields.map((field) => (
                <div key={field.field_name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={field.field_name} className="text-slate-300">
                      {field.field_label}
                    </Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onRevert(field.field_name)}
                      className="h-6 px-2 text-slate-500 hover:text-slate-300"
                      title="Revert to default"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                  </div>

                  {field.content_type === 'textarea' ? (
                    <div className="relative">
                      <Textarea
                        id={field.field_name}
                        value={formData[field.field_name] || ''}
                        onChange={(e) => onChange(field.field_name, e.target.value)}
                        className="min-h-[100px] bg-slate-950 border-slate-700 focus:border-blue-500 text-slate-100 placeholder:text-slate-600"
                        placeholder={`Enter ${field.field_label.toLowerCase()}...`}
                      />
                      <span className="absolute bottom-2 right-2 text-xs text-slate-600">
                        {formData[field.field_name]?.length || 0} chars
                      </span>
                    </div>
                  ) : (
                    <div className="relative">
                      <Input
                        id={field.field_name}
                        value={formData[field.field_name] || ''}
                        onChange={(e) => onChange(field.field_name, e.target.value)}
                        className="bg-slate-950 border-slate-700 focus:border-blue-500 text-slate-100 placeholder:text-slate-600"
                        placeholder={`Enter ${field.field_label.toLowerCase()}...`}
                      />
                    </div>
                  )}
                  {field.field_name.startsWith('meta_') && (
                     <p className="text-xs text-slate-500">
                       Used for SEO. Recommended length: {field.field_name.includes('title') ? '50-60' : '150-160'} characters.
                     </p>
                  )}
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default ContentForm;