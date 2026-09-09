"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { getSponsorshipTiers, SponsorshipTier, createSponsorshipTier } from "@/app/actions/sponsors";
import { Plus, Check, DollarSign, Users, Layers } from "lucide-react";

export default function SponsorsTiersPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [tiers, setTiers] = useState<SponsorshipTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // New Tier form state
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newSlots, setNewSlots] = useState("");
  const [newBenefits, setNewBenefits] = useState("");

  useEffect(() => {
    async function loadTiers() {
      try {
        const data = await getSponsorshipTiers(eventId);
        setTiers(data);
      } catch (error) {
        console.error("Failed to load tiers", error);
      } finally {
        setLoading(false);
      }
    }
    loadTiers();
  }, [eventId]);

  const handleAddTier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice || !newSlots) return;

    try {
      const added = await createSponsorshipTier({
        name: newName,
        price: Number(newPrice),
        slotsTotal: Number(newSlots),
        slotsAvailable: Number(newSlots),
        benefits: newBenefits.split(",").map((b) => b.trim()).filter((b) => b.length > 0),
      });
      setTiers([...tiers, added]);
      setIsAdding(false);
      setNewName("");
      setNewPrice("");
      setNewSlots("");
      setNewBenefits("");
    } catch (error) {
      console.error("Error adding tier", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-8 h-8 border-2 border-[#06b6d4] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Sponsorship Tiers</h2>
          <p className="text-sm text-white/60">Manage your event's sponsorship packages.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} variant="primary" className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Tier</span>
        </Button>
      </div>

      {isAdding && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <GlassCard className="p-6">
            <form onSubmit={handleAddTier} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-white/70">Tier Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#06b6d4] transition-colors"
                    placeholder="e.g. Diamond"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-white/70">Price ($)</label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#06b6d4] transition-colors"
                    placeholder="5000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-white/70">Total Slots</label>
                  <input
                    type="number"
                    required
                    value={newSlots}
                    onChange={(e) => setNewSlots(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#06b6d4] transition-colors"
                    placeholder="5"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/70">Benefits (comma separated)</label>
                <input
                  type="text"
                  value={newBenefits}
                  onChange={(e) => setNewBenefits(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#06b6d4] transition-colors"
                  placeholder="Logo on website, Booth space, etc."
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Tier
                </Button>
              </div>
            </form>
          </GlassCard>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <GlassCard key={tier.id} className="p-6 flex flex-col h-full hover:border-[#06b6d4]/30 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">{tier.name}</h3>
              <div className="bg-[#06b6d4]/10 text-[#06b6d4] px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                {tier.price.toLocaleString()}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-white/70 text-sm mb-6 bg-white/5 px-3 py-2 rounded-lg w-fit">
              <Users className="w-4 h-4 text-[#a855f7]" />
              <span>{tier.slotsAvailable} / {tier.slotsTotal} slots available</span>
            </div>

            <div className="flex-1 space-y-3">
              <p className="text-xs uppercase tracking-wider text-white/50 font-semibold">Benefits</p>
              <ul className="space-y-2">
                {tier.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start text-sm text-white/80">
                    <Check className="w-4 h-4 text-[#06b6d4] mr-2 mt-0.5 shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
                {tier.benefits.length === 0 && (
                  <li className="text-sm text-white/40 italic">No benefits listed</li>
                )}
              </ul>
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/10 flex space-x-3">
              <Button variant="ghost" className="w-full text-xs py-2">Edit</Button>
            </div>
          </GlassCard>
        ))}
        {tiers.length === 0 && !isAdding && (
          <div className="col-span-full py-12 text-center border border-dashed border-white/20 rounded-2xl bg-white/[0.01]">
            <Layers className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/60 mb-4">No sponsorship tiers created yet.</p>
            <Button onClick={() => setIsAdding(true)} variant="ghost">
              Create First Tier
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
