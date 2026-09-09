"use client";

import { useState } from "react";
import { updateGuestStatus } from "@/app/actions/event-management";
import { Check, X } from "lucide-react";
import { FadeInUp } from "@/components/animations/motion";

interface Guest {
  id: string;
  name: string;
  email: string;
  ticketCode: string;
  status: string;
}

export default function GuestsClient({ initialGuests }: { initialGuests: Guest[] }) {
  const [guests, setGuests] = useState<Guest[]>(initialGuests);

  const handleStatusChange = async (id: string, newStatus: "Approved" | "Rejected" | "Pending") => {
    // Optimistic update
    setGuests((prev) => prev.map((g) => (g.id === id ? { ...g, status: newStatus } : g)));
    await updateGuestStatus(id, newStatus);
  };

  return (
    <FadeInUp className="w-full">
      <div 
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.02)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="p-4 text-sm font-medium text-slate-400">Attendee Name</th>
                <th className="p-4 text-sm font-medium text-slate-400">Email</th>
                <th className="p-4 text-sm font-medium text-slate-400">Ticket Code</th>
                <th className="p-4 text-sm font-medium text-slate-400">Status</th>
                <th className="p-4 text-sm font-medium text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest) => (
                <tr key={guest.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 text-slate-200">{guest.name}</td>
                  <td className="p-4 text-slate-400">{guest.email}</td>
                  <td className="p-4 text-slate-400 font-mono text-sm">{guest.ticketCode}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      guest.status === 'Approved' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                      guest.status === 'Pending' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {guest.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleStatusChange(guest.id, 'Approved')}
                      disabled={guest.status === 'Approved'}
                      className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Approve"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleStatusChange(guest.id, 'Rejected')}
                      disabled={guest.status === 'Rejected'}
                      className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Reject"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {guests.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No guests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </FadeInUp>
  );
}
