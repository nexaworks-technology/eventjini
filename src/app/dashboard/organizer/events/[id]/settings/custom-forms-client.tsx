"use client";

import { useState, useTransition } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { addCustomField, deleteCustomField } from "@/app/actions/custom-forms";
import { toast } from "sonner";
import { FadeInUp } from "@/components/animations/motion";

export default function CustomFormsClient({ eventId, initialFields }: { eventId: string, initialFields: any[] }) {
  const [fields, setFields] = useState(initialFields);
  const [isPending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);

  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldType, setFieldType] = useState("text");
  const [isRequired, setIsRequired] = useState(false);
  const [optionsStr, setOptionsStr] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldLabel) return;
    
    // Auto-generate a machine readable field_name from the label
    const fieldName = fieldLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    
    let options = null;
    if (fieldType === 'select') {
      options = optionsStr.split(',').map(s => s.trim()).filter(s => s);
      if (options.length === 0) {
        toast.error("Please provide at least one option for the dropdown.");
        return;
      }
    }

    startTransition(async () => {
      const newField = {
        field_name: fieldName,
        field_label: fieldLabel,
        field_type: fieldType,
        is_required: isRequired,
        options,
        order_index: fields.length
      };

      const res = await addCustomField(eventId, newField);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Field added!");
        setShowAdd(false);
        setFieldLabel("");
        setOptionsStr("");
        window.location.reload();
      }
    });
  };

  const handleDelete = (id: string) => {
    if(!confirm("Remove this field?")) return;
    startTransition(async () => {
      const res = await deleteCustomField(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        setFields(prev => prev.filter(f => f.id !== id));
      }
    });
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Custom Checkout Questions</h2>
          <p className="text-muted text-sm mt-1">Ask attendees custom questions during checkout.</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} variant="secondary" size="sm">
          <Plus className="w-4 h-4 mr-2" /> Add Question
        </Button>
      </div>

      {showAdd && (
        <FadeInUp>
          <GlassCard className="p-5 border-brand-primary/30 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/10 to-transparent pointer-events-none rounded-2xl" />
            <form onSubmit={handleAdd} className="relative z-10 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider">Question Label</label>
                  <input
                    required
                    value={fieldLabel}
                    onChange={e => setFieldLabel(e.target.value)}
                    placeholder="e.g., T-Shirt Size"
                    className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider">Answer Type</label>
                  <select
                    value={fieldType}
                    onChange={e => setFieldType(e.target.value)}
                    className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 appearance-none"
                  >
                    <option value="text">Short Text</option>
                    <option value="long_text">Long Text</option>
                    <option value="select">Dropdown (Select)</option>
                    <option value="checkbox">Checkbox (Yes/No)</option>
                  </select>
                </div>
              </div>

              {fieldType === 'select' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider">Dropdown Options (Comma Separated)</label>
                  <input
                    required
                    value={optionsStr}
                    onChange={e => setOptionsStr(e.target.value)}
                    placeholder="Small, Medium, Large, XL"
                    className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isRequired}
                    onChange={e => setIsRequired(e.target.checked)}
                    className="rounded border-white/20 bg-black/50 text-brand-primary focus:ring-brand-primary focus:ring-offset-black"
                  />
                  Required field
                </label>
                <Button type="submit" disabled={isPending} variant="primary">
                  Save Question
                </Button>
              </div>
            </form>
          </GlassCard>
        </FadeInUp>
      )}

      {fields.length > 0 ? (
        <div className="space-y-2">
          {fields.map((f, i) => (
            <GlassCard key={f.id} className="p-4 flex items-center gap-4 group">
              <GripVertical className="w-5 h-5 text-white/20 cursor-grab" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{f.field_label}</span>
                  {f.is_required && <span className="text-[10px] uppercase font-bold text-red-400 border border-red-400/20 px-1.5 py-0.5 rounded">Required</span>}
                </div>
                <div className="text-xs text-muted flex gap-2 mt-1">
                  <span className="capitalize">{f.field_type.replace('_', ' ')}</span>
                  {f.options && (
                    <>
                      <span>&bull;</span>
                      <span className="truncate max-w-[200px]">{f.options.join(', ')}</span>
                    </>
                  )}
                </div>
              </div>
              <button 
                onClick={() => handleDelete(f.id)}
                disabled={isPending}
                className="opacity-0 group-hover:opacity-100 p-2 text-white/40 hover:text-red-400 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="p-6 border border-dashed border-white/10 rounded-2xl text-center text-muted">
          No custom questions added yet. Attendees will only be asked for their Name and Email.
        </div>
      )}
    </div>
  );
}
