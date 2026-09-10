"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";

export default function ExportCsvButton({ leads }: { leads: any[] }) {
  const handleExport = () => {
    if (leads.length === 0) {
      toast.error("No leads to export.");
      return;
    }

    const headers = ["Name", "Email", "Company", "Job Title", "Scanned At", "Notes"];
    const csvContent = [
      headers.join(","),
      ...leads.map((l) => 
        `"${l.name}","${l.email}","${l.company}","${l.jobTitle}","${l.scannedAt}","${l.notes.replace(/"/g, '""')}"`
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sponsor_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Downloaded successfully");
  };

  return (
    <button 
      onClick={handleExport}
      className="bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-primary/20 transition-colors flex items-center gap-2"
    >
      <Download className="w-4 h-4" />
      Export CSV
    </button>
  );
}
