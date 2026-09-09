"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/app/actions/profile";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { User, Mail, Phone, MapPin, Link as LinkIcon, AlignLeft, Info } from "lucide-react";

export function ProfileForm({ profile }: { profile: any }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Profile updated successfully!");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <GlassCard className="space-y-8">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Personal Information</h2>
          <p className="text-sm text-white/60">
            Update your personal details and how we can reach you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 flex items-center gap-2">
              <User className="w-4 h-4 text-[#06b6d4]" />
              Full Name
            </label>
            <input
              type="text"
              name="full_name"
              defaultValue={profile.full_name || ""}
              readOnly
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/50 cursor-not-allowed focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#06b6d4]" />
              Email
            </label>
            <input
              type="email"
              name="email"
              defaultValue={profile.email || ""}
              readOnly
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/50 cursor-not-allowed focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#06b6d4]" />
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              defaultValue={profile.phone || ""}
              placeholder="+1 (555) 000-0000"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#06b6d4]/50 focus:ring-1 focus:ring-[#06b6d4]/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#06b6d4]" />
              Location
            </label>
            <input
              type="text"
              name="location"
              defaultValue={profile.location || ""}
              placeholder="City, Country"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#06b6d4]/50 focus:ring-1 focus:ring-[#06b6d4]/50 transition-all"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-white/80 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-[#06b6d4]" />
              LinkedIn Profile
            </label>
            <input
              type="url"
              name="linkedin_url"
              defaultValue={profile.linkedin_url || ""}
              placeholder="https://linkedin.com/in/username"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#06b6d4]/50 focus:ring-1 focus:ring-[#06b6d4]/50 transition-all"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-white/80 flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-[#06b6d4]" />
              Bio
            </label>
            <textarea
              name="bio"
              defaultValue={profile.bio || ""}
              placeholder="Tell us a little bit about yourself..."
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#06b6d4]/50 focus:ring-1 focus:ring-[#06b6d4]/50 transition-all resize-none"
            />
          </div>
        </div>

        <hr className="border-white/10 my-8" />

        <div>
          <h2 className="text-xl font-bold text-white mb-2">Preferences</h2>
          <p className="text-sm text-white/60 mb-6">
            Event-related preferences and settings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Dietary Preference</label>
            <div className="relative">
              <select
                name="dietary_preference"
                defaultValue={profile.dietary_preference || ""}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-[#06b6d4]/50 focus:ring-1 focus:ring-[#06b6d4]/50 transition-all [&>option]:bg-[#050505]"
              >
                <option value="" disabled>Select a preference...</option>
                <option value="none">None</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="gluten_free">Gluten Free</option>
                <option value="halal">Halal</option>
                <option value="kosher">Kosher</option>
                <option value="other">Other</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/50">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">T-Shirt Size</label>
            <div className="relative">
              <select
                name="tshirt_size"
                defaultValue={profile.tshirt_size || ""}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-[#06b6d4]/50 focus:ring-1 focus:ring-[#06b6d4]/50 transition-all [&>option]:bg-[#050505]"
              >
                <option value="" disabled>Select a size...</option>
                <option value="xs">XS</option>
                <option value="s">S</option>
                <option value="m">M</option>
                <option value="l">L</option>
                <option value="xl">XL</option>
                <option value="xxl">XXL</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/50">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10">
          <label className="flex items-center gap-4 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                name="opt_in_recommendations"
                defaultChecked={profile.opt_in_recommendations}
                className="peer sr-only"
              />
              <div className="block w-12 h-7 rounded-full bg-white/10 border border-white/5 peer-checked:bg-[#06b6d4] peer-checked:border-[#06b6d4] transition-all"></div>
              <div className="absolute left-1 top-1 w-5 h-5 rounded-full bg-white peer-checked:translate-x-5 transition-transform duration-300"></div>
            </div>
            <div>
              <div className="font-medium text-white group-hover:text-white transition-colors">
                Opt-in for Event Recommendations
              </div>
              <div className="text-sm text-white/50 flex items-center gap-1 mt-0.5">
                <Info className="w-3.5 h-3.5" />
                Receive personalized suggestions for networking and sessions.
              </div>
            </div>
          </label>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </GlassCard>
    </form>
  );
}
