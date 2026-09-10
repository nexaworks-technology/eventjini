"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createEvent } from "@/app/actions/events";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { FadeInUp, StaggerContainer, staggerChildVariants } from "@/components/animations/motion";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightIcon, ArrowLeftIcon, CheckIcon, CalendarIcon, MapPinIcon, InfoIcon, SettingsIcon, ImageIcon } from "lucide-react";
import Image from "next/image";

export default function CreateEventPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    banner_url: "",
    start_date: "",
    end_date: "",
    timezone: "UTC",
    location: "",
    capacity: "",
    is_paid: false,
    ticket_price: "",
    requires_approval: false,
    require_b2b_data: false,
  });

  const updateForm = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      
      // Auto-generate slug if title is updated
      if (name === "title" && !formData.slug) {
        setFormData((prev) => ({
          ...prev,
          slug: value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
        }));
      }
    }
  };

  const toggleBoolean = (name: keyof typeof formData) => {
    setFormData((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "ticket_price") {
           data.append("ticket_price_cents", Math.round(parseFloat(value as string) * 100).toString());
        } else if (key === "location") {
           data.append("location_name", value.toString());
        } else {
           data.append(key, typeof value === "boolean" ? (value ? "true" : "false") : value.toString());
        }
      });

      const result = await createEvent(data);
      
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Event created successfully!");
        router.push("/dashboard/organizer/events");
      }
    } catch (err) {
      toast.error("An error occurred while creating the event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full bg-canvas border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-muted/40 focus:outline-none focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/20 transition-all";
  const labelClass = "block text-xs font-semibold text-muted uppercase tracking-widest mb-2 pl-1";

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Create New Event</h1>
        <p className="text-slate-400">Set up your next amazing experience in just a few steps.</p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/5 rounded-full z-0"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full z-0 transition-all duration-500"
          style={{ width: `${((step - 1) / 3) * 100}%` }}
        ></div>
        
        {[
          { icon: InfoIcon, label: "Basics" },
          { icon: CalendarIcon, label: "Date & Time" },
          { icon: SettingsIcon, label: "Settings" },
          { icon: CheckIcon, label: "Review" }
        ].map((item, index) => {
          const stepNum = index + 1;
          const isActive = step >= stepNum;
          const isCurrent = step === stepNum;
          
          return (
            <div key={stepNum} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isActive 
                    ? "bg-[#050505] border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]" 
                    : "bg-[#050505] border-white/10 text-slate-500"
                }`}
              >
                <item.icon className="w-5 h-5" />
              </div>
              <span className={`absolute -bottom-6 text-xs whitespace-nowrap font-medium ${isCurrent ? "text-cyan-400" : "text-slate-500"}`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-12">
        <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-6">Event Basics</h2>
                    
                    <div className="space-y-5">
                      <div>
                        <label htmlFor="title" className={labelClass}>Event Title *</label>
                        <input
                          id="title"
                          name="title"
                          required
                          value={formData.title}
                          onChange={updateForm}
                          placeholder="e.g. Neon Nights Tech Summit 2026"
                          className={inputClass}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="slug" className={labelClass}>Custom URL Slug *</label>
                        <div className="flex">
                          <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-white/10 bg-white/5 text-slate-400 text-sm">
                            eventjini.com/e/
                          </span>
                          <input
                            id="slug"
                            name="slug"
                            required
                            value={formData.slug}
                            onChange={updateForm}
                            placeholder="neon-nights"
                            className={`${inputClass} rounded-l-none`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>Event Cover Image</label>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                              { label: "Tech", url: "/demo/tech.jpg" },
                              { label: "Music", url: "/demo/music.jpg" },
                              { label: "Wellness", url: "/demo/wellness.jpg" },
                              { label: "Custom", url: "custom" },
                            ].map((preset) => (
                              <button
                                key={preset.url}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, banner_url: preset.url === "custom" ? "" : preset.url }))}
                                className={`relative h-20 rounded-xl overflow-hidden border-2 transition-all ${
                                  (preset.url === "custom" && !["/demo/tech.jpg", "/demo/music.jpg", "/demo/wellness.jpg"].includes(formData.banner_url) && formData.banner_url !== undefined) || formData.banner_url === preset.url
                                    ? "border-brand-primary ring-2 ring-brand-primary/20"
                                    : "border-transparent opacity-50 hover:opacity-100"
                                }`}
                              >
                                {preset.url !== "custom" ? (
                                  <>
                                    <Image src={preset.url} alt={preset.label} fill className="object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                      <span className="text-xs font-semibold text-white tracking-widest uppercase">{preset.label}</span>
                                    </div>
                                  </>
                                ) : (
                                  <div className="absolute inset-0 bg-white/5 flex items-center justify-center flex-col gap-1">
                                    <ImageIcon className="w-5 h-5 text-muted" />
                                    <span className="text-[10px] font-medium text-muted tracking-widest uppercase">Custom</span>
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                          
                          {(!["/demo/tech.jpg", "/demo/music.jpg", "/demo/wellness.jpg"].includes(formData.banner_url)) && (
                            <input
                              id="banner_url"
                              name="banner_url"
                              value={formData.banner_url}
                              onChange={updateForm}
                              placeholder="https://example.com/your-image.jpg"
                              className={inputClass}
                            />
                          )}
                        </div>
                        <p className="text-xs text-muted mt-2">Choose a demo cover or provide a URL to a custom image.</p>
                      </div>

                      <div>
                        <label htmlFor="description" className={labelClass}>Description</label>
                        <textarea
                          id="description"
                          name="description"
                          rows={5}
                          value={formData.description}
                          onChange={updateForm}
                          placeholder="Tell people what your event is about..."
                          className={`${inputClass} resize-none`}
                        />
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-6">Date, Time & Location</h2>
                    
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label htmlFor="start_date" className={labelClass}>Start Date & Time *</label>
                          <input
                            id="start_date"
                            name="start_date"
                            type="datetime-local"
                            required
                            value={formData.start_date}
                            onChange={updateForm}
                            className={inputClass}
                            style={{ colorScheme: "dark" }}
                          />
                        </div>
                        <div>
                          <label htmlFor="end_date" className={labelClass}>End Date & Time</label>
                          <input
                            id="end_date"
                            name="end_date"
                            type="datetime-local"
                            required
                            value={formData.end_date}
                            onChange={updateForm}
                            className={inputClass}
                            style={{ colorScheme: "dark" }}
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="timezone" className={labelClass}>Timezone</label>
                        <select
                          id="timezone"
                          name="timezone"
                          value={formData.timezone}
                          onChange={updateForm}
                          className={inputClass}
                        >
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">Eastern Time (ET)</option>
                          <option value="America/Chicago">Central Time (CT)</option>
                          <option value="America/Denver">Mountain Time (MT)</option>
                          <option value="America/Los_Angeles">Pacific Time (PT)</option>
                          <option value="Europe/London">London (GMT)</option>
                          <option value="Europe/Paris">Central European Time (CET)</option>
                          <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
                          <option value="Asia/Kolkata">India Standard Time (IST)</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="location" className={labelClass}>Location</label>
                        <div className="relative">
                          <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={updateForm}
                            placeholder="Full address or virtual link..."
                            className={`${inputClass} pl-12`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-6">Ticketing & Settings</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="capacity" className={labelClass}>Capacity (0 for unlimited)</label>
                        <input
                          id="capacity"
                          name="capacity"
                          type="number"
                          min="0"
                          value={formData.capacity}
                          onChange={updateForm}
                          placeholder="e.g. 100"
                          className={inputClass}
                        />
                      </div>

                      <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-medium">Paid Event</h3>
                          <p className="text-sm text-slate-400">Charge attendees for tickets</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            name="is_paid" 
                            className="sr-only peer"
                            checked={formData.is_paid}
                            onChange={(e) => setFormData(prev => ({ ...prev, is_paid: e.target.checked }))}
                          />
                          <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                        </label>
                      </div>

                      {formData.is_paid && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="pl-4 border-l-2 border-cyan-500/50"
                        >
                          <label htmlFor="ticket_price" className={labelClass}>Ticket Price (₹)</label>
                          <input
                            id="ticket_price"
                            name="ticket_price"
                            type="number"
                            min="0"
                            step="0.01"
                            required={formData.is_paid}
                            value={formData.ticket_price}
                            onChange={updateForm}
                            placeholder="0.00"
                            className={inputClass}
                          />
                        </motion.div>
                      )}

                      <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-medium">Require Approval</h3>
                          <p className="text-sm text-slate-400">Manually approve attendees</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            name="requires_approval" 
                            className="sr-only peer"
                            checked={formData.requires_approval}
                            onChange={(e) => setFormData(prev => ({ ...prev, requires_approval: e.target.checked }))}
                          />
                          <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                        </label>
                      </div>

                      <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-medium">Require B2B Data</h3>
                          <p className="text-sm text-slate-400">Ask for Company, Job Title, etc.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            name="require_b2b_data" 
                            className="sr-only peer"
                            checked={formData.require_b2b_data}
                            onChange={(e) => setFormData(prev => ({ ...prev, require_b2b_data: e.target.checked }))}
                          />
                          <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-400 mb-4">
                      <CheckIcon className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Review your Event</h2>
                    <p className="text-slate-400">Make sure everything looks good before creating.</p>
                  </div>

                  <div className="bg-black/40 rounded-xl p-6 border border-white/5 space-y-4">
                    <div className="grid grid-cols-3 gap-4 border-b border-white/5 pb-4">
                      <div className="col-span-1 text-slate-400">Title</div>
                      <div className="col-span-2 text-white font-medium">{formData.title || "Untitled Event"}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 border-b border-white/5 pb-4">
                      <div className="col-span-1 text-slate-400">URL</div>
                      <div className="col-span-2 text-cyan-400">eventjini.com/e/{formData.slug}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 border-b border-white/5 pb-4">
                      <div className="col-span-1 text-slate-400">Date</div>
                      <div className="col-span-2 text-white">
                        {formData.start_date ? new Date(formData.start_date).toLocaleString() : "Not set"}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 border-b border-white/5 pb-4">
                      <div className="col-span-1 text-slate-400">Location</div>
                      <div className="col-span-2 text-white">{formData.location || "TBA"}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-1 text-slate-400">Ticketing</div>
                      <div className="col-span-2 text-white">
                        {formData.is_paid ? `$${formData.ticket_price}` : "Free"} 
                        {formData.capacity ? ` • ${formData.capacity} spots` : " • Unlimited spots"}
                        {formData.requires_approval ? " • Approval Required" : ""}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <Button type="button" variant="ghost" onClick={prevStep}>
                <ArrowLeftIcon className="w-4 h-4 mr-2" /> Back
              </Button>
            ) : (
              <div></div> // Empty div for spacing
            )}
            
            {step < 4 ? (
              <Button type="submit" variant="primary">
                Next <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                type="submit" 
                variant="primary" 
                disabled={isSubmitting}
                className={isSubmitting ? "opacity-70 cursor-wait" : ""}
              >
                {isSubmitting ? "Creating Event..." : "Create Event"} 
                {!isSubmitting && <CheckIcon className="w-4 h-4 ml-2" />}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
