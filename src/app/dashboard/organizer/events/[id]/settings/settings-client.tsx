"use client";

import { useState, useTransition } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { updateEventDetails } from "@/app/actions/os";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsClient({ event }: { event: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    title: event.title || "",
    description: event.description || "",
    start_date: event.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : "",
    end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : "",
    location_name: event.location_name || "",
    capacity: event.capacity || "",
    banner_url: event.banner_url || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        data.append(key, val.toString());
      });
      
      const res = await updateEventDetails(event.id, data);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Event details updated!");
        router.refresh();
      }
    });
  };

  const inputClass = "w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all";
  const labelClass = "block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <GlassCard level={2} className="p-6">
        <div className="space-y-6">
          <div>
            <label className={labelClass}>Event Title</label>
            <input name="title" value={formData.title} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className={inputClass} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Start Date & Time</label>
              <input type="datetime-local" name="start_date" value={formData.start_date} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>End Date & Time</label>
              <input type="datetime-local" name="end_date" value={formData.end_date} onChange={handleChange} required className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Location</label>
              <input name="location_name" value={formData.location_name} onChange={handleChange} className={inputClass} placeholder="Venue or Online Link" />
            </div>
            <div>
              <label className={labelClass}>Capacity</label>
              <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} className={inputClass} placeholder="Leave empty for unlimited" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Banner Image URL</label>
            <input name="banner_url" value={formData.banner_url} onChange={handleChange} className={inputClass} placeholder="https://..." />
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <Button type="submit" variant="primary" disabled={isPending}>
            {isPending ? "Saving..." : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </GlassCard>
    </form>
  );
}
