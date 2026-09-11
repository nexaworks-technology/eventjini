"use client";

import { useState, useTransition } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { FadeInUp, StaggerContainer, staggerChildVariants } from "@/components/animations/motion";
import { Plus, Building2, Phone, Mail, FileText, IndianRupee, Trash2, CheckCircle2, CircleDashed, CheckCircle } from "lucide-react";
import { createVendor, updateVendor, deleteVendor } from "@/app/actions/vendors";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function VendorsClient({ eventId, initialVendors }: { eventId: string, initialVendors: any[] }) {
  const [vendors, setVendors] = useState(initialVendors);
  const [isPending, startTransition] = useTransition();
  const [showAddForm, setShowAddForm] = useState(false);

  // New Vendor Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("catering");
  const [budget, setBudget] = useState("");

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    startTransition(async () => {
      const budgetCents = budget ? Math.round(parseFloat(budget) * 100) : 0;
      const res = await createVendor(eventId, {
        name,
        category,
        status: "shortlisted",
        budget_allocated_cents: budgetCents,
        payment_status: "unpaid",
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Vendor added!");
        setShowAddForm(false);
        setName("");
        setBudget("");
        // Optimistic refresh would be ideal, but rely on router refresh via server action
        window.location.reload();
      }
    });
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    startTransition(async () => {
      setVendors(prev => prev.map(v => v.id === id ? { ...v, status: newStatus } : v));
      await updateVendor(id, eventId, { status: newStatus });
    });
  };

  const handlePaymentChange = (id: string, newStatus: string) => {
    startTransition(async () => {
      setVendors(prev => prev.map(v => v.id === id ? { ...v, payment_status: newStatus } : v));
      await updateVendor(id, eventId, { payment_status: newStatus });
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Remove this vendor?")) return;
    startTransition(async () => {
      setVendors(prev => prev.filter(v => v.id !== id));
      await deleteVendor(id, eventId);
    });
  };

  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'catering': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'printing': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'av_tech': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'venue': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'logistics': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <FadeInUp>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Vendors</h1>
          <p className="text-white/60">Manage caterers, printers, and external event contractors.</p>
        </FadeInUp>
        <FadeInUp delay={0.1}>
          <Button onClick={() => setShowAddForm(!showAddForm)} variant="primary" className="whitespace-nowrap">
            <Plus className="w-4 h-4 mr-2" />
            Add Vendor
          </Button>
        </FadeInUp>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <FadeInUp delay={0.2}>
          <GlassCard className="p-6 border-brand-primary/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/10 to-transparent pointer-events-none" />
            <form onSubmit={handleAddVendor} className="relative z-10 flex flex-col md:flex-row items-end gap-4">
              <div className="space-y-1.5 w-full md:w-1/3">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider">Vendor Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                  placeholder="e.g. Acme Catering"
                />
              </div>
              <div className="space-y-1.5 w-full md:w-1/4">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 appearance-none"
                >
                  <option value="catering">Catering</option>
                  <option value="printing">Printing</option>
                  <option value="av_tech">AV / Tech</option>
                  <option value="venue">Venue</option>
                  <option value="logistics">Logistics</option>
                  <option value="security">Security</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-1.5 w-full md:w-1/4">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider">Budget (₹)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                  placeholder="0.00"
                />
              </div>
              <Button type="submit" disabled={isPending} variant="primary" className="w-full md:w-auto px-8 py-2.5">
                Save
              </Button>
            </form>
          </GlassCard>
        </FadeInUp>
      )}

      {/* Vendors Grid */}
      {vendors.length > 0 ? (
        <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {vendors.map((vendor) => (
            <motion.div key={vendor.id} variants={staggerChildVariants}>
              <GlassCard className="p-6 flex flex-col h-full relative overflow-hidden group">
                
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-muted" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-brand-primary transition-colors line-clamp-1">{vendor.name}</h3>
                      <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full border ${getCategoryColor(vendor.category)}`}>
                        {vendor.category.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(vendor.id)} className="text-white/20 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Budget & Payment */}
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div>
                    <p className="text-xs text-muted mb-1 flex items-center gap-1.5"><IndianRupee className="w-3 h-3"/> Allocated</p>
                    <p className="text-sm font-bold text-white">₹{(vendor.budget_allocated_cents / 100).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">Payment</p>
                    <select
                      value={vendor.payment_status}
                      onChange={(e) => handlePaymentChange(vendor.id, e.target.value)}
                      disabled={isPending}
                      className={`text-sm font-bold bg-transparent focus:outline-none cursor-pointer ${
                        vendor.payment_status === 'paid' ? 'text-emerald-400' : 
                        vendor.payment_status === 'partial' ? 'text-amber-400' : 'text-red-400'
                      }`}
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="partial">Partial</option>
                      <option value="paid">Paid Full</option>
                    </select>
                  </div>
                </div>

                {/* Contract Status Pipeline */}
                <div className="mt-auto pt-4 border-t border-white/[0.04]">
                  <p className="text-[10px] text-muted uppercase tracking-widest font-semibold mb-3">Workflow Status</p>
                  <div className="flex bg-[#0a0a0a]/50 p-1 rounded-lg border border-white/5">
                    {['shortlisted', 'contracted', 'completed'].map((status) => {
                      const isActive = vendor.status === status;
                      return (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(vendor.id, status)}
                          disabled={isPending}
                          className={`flex-1 text-xs font-semibold py-1.5 rounded-md capitalize transition-all ${
                            isActive 
                              ? 'bg-white/10 text-white shadow-sm' 
                              : 'text-muted hover:text-white/70 hover:bg-white/5'
                          }`}
                        >
                          {status}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </StaggerContainer>
      ) : (
        <FadeInUp delay={0.2} className="py-20 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
            <Building2 className="w-8 h-8 text-muted/50" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 tracking-tight">No vendors added yet</h3>
          <p className="text-muted max-w-sm mb-6">Keep track of your caterers, venues, and suppliers all in one place.</p>
          <Button onClick={() => setShowAddForm(true)} variant="secondary">
            <Plus className="w-4 h-4 mr-2" /> Add First Vendor
          </Button>
        </FadeInUp>
      )}
    </div>
  );
}
