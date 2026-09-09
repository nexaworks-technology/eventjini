"use client";

import { FadeInUp, StaggerContainer } from "@/components/animations/motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { DollarSign } from "lucide-react";

interface BudgetItem {
  id: string;
  category: string;
  estimated: number;
  actual: number;
}

export default function BudgetClient({ initialBudgets }: { initialBudgets: BudgetItem[] }) {
  const totalEstimated = initialBudgets.reduce((acc, curr) => acc + curr.estimated, 0);
  const totalActual = initialBudgets.reduce((acc, curr) => acc + curr.actual, 0);

  return (
    <StaggerContainer className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FadeInUp>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-3xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                <DollarSign className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Total Estimated</p>
                <p className="text-3xl font-bold text-white">${totalEstimated.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.1}>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-3xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                <DollarSign className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Total Actual</p>
                <p className="text-3xl font-bold text-white">${totalActual.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </FadeInUp>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FadeInUp delay={0.2} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-3xl flex flex-col h-[400px]">
          <h3 className="text-lg font-semibold text-white mb-6">Budget Overview</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={initialBudgets} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="category" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="estimated" name="Estimated" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" name="Actual" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.3} className="bg-white/5 border border-white/10 rounded-2xl p-0 backdrop-blur-3xl overflow-hidden h-fit">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-lg font-semibold text-white">Line Items</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="p-4 text-sm font-medium text-slate-400">Category</th>
                  <th className="p-4 text-sm font-medium text-slate-400 text-right">Estimated</th>
                  <th className="p-4 text-sm font-medium text-slate-400 text-right">Actual</th>
                  <th className="p-4 text-sm font-medium text-slate-400 text-right">Variance</th>
                </tr>
              </thead>
              <tbody>
                {initialBudgets.map((item) => {
                  const variance = item.estimated - item.actual;
                  const isOverBudget = variance < 0;

                  return (
                    <tr key={item.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 text-slate-200">{item.category}</td>
                      <td className="p-4 text-slate-300 text-right">${item.estimated.toLocaleString()}</td>
                      <td className="p-4 text-slate-300 text-right">${item.actual.toLocaleString()}</td>
                      <td className={`p-4 text-right font-medium ${isOverBudget ? 'text-red-400' : 'text-emerald-400'}`}>
                        {isOverBudget ? '-' : '+'}${Math.abs(variance).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </FadeInUp>
      </div>
    </StaggerContainer>
  );
}
