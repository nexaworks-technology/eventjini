"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, DollarSign, CheckCircle, Eye } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { StaggerContainer, FadeInUp, staggerChildVariants } from "@/components/animations/motion";
import { motion } from "framer-motion";
import { getEventStats } from "@/app/actions/os";
import { use } from "react";

export default function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    getEventStats(unwrappedParams.id).then(setStats);
  }, [unwrappedParams.id]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-cyan-500 animate-pulse font-medium">Loading analytics...</div>
      </div>
    );
  }

  const kpis = [
    { label: "Total Revenue", value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "text-cyan-500", bg: "bg-cyan-500/10" },
    { label: "Registrations", value: stats.registrationsCount, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Check-ins", value: stats.checkInsCount, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Page Views", value: stats.pageViews.toLocaleString(), icon: Eye, color: "text-blue-500", bg: "bg-blue-500/10" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <FadeInUp>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Analytics</h1>
        <p className="text-white/60">Overview of your event's performance.</p>
      </FadeInUp>

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <motion.div key={idx} variants={staggerChildVariants}>
            <GlassCard hoverGlow animate={false} className="h-full flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-white/60">{kpi.label}</span>
                <div className={`p-2 rounded-lg ${kpi.bg}`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <h2 className="text-3xl font-bold text-white">{kpi.value}</h2>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </StaggerContainer>

      <FadeInUp delay={0.3}>
        <GlassCard className="mt-6 p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Registration Trend (Last 7 Days)</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(5,5,5,0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    boxShadow: "0 4px 24px -1px rgba(0,0,0,0.25)",
                    backdropFilter: "blur(12px)",
                  }}
                  itemStyle={{ color: "#06b6d4", fontWeight: "bold" }}
                  labelStyle={{ color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}
                />
                <Area
                  type="monotone"
                  dataKey="registrations"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRegistrations)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </FadeInUp>

      {/* UTM Attribution Table */}
      <FadeInUp delay={0.4}>
        <GlassCard className="mt-6 p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Marketing Attribution (UTM)</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Source</th>
                  <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Medium</th>
                  <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Campaign</th>
                  <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider text-right">Clicks</th>
                  <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider text-right">Conversions</th>
                  <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider text-right">Conv. Rate</th>
                </tr>
              </thead>
              <tbody>
                {stats.trackingLinks?.length > 0 ? (
                  stats.trackingLinks.map((link: any) => (
                    <tr key={link.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 text-sm font-medium text-white">{link.source}</td>
                      <td className="p-4 text-sm text-slate-300">{link.medium}</td>
                      <td className="p-4 text-sm text-slate-300">{link.campaign}</td>
                      <td className="p-4 text-sm text-slate-300 text-right">{link.clicks}</td>
                      <td className="p-4 text-sm font-bold text-emerald-400 text-right">{link.conversions}</td>
                      <td className="p-4 text-sm text-brand-secondary text-right">
                        {link.clicks > 0 ? Math.round((link.conversions / link.clicks) * 100) : 0}%
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 text-sm">
                      No tracking link data available. Add ?utm_source=... to your event URL to start tracking.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </FadeInUp>
    </div>
  );
}
