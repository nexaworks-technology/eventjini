"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { useState } from "react";

export function DownloadTicketButton({ elementId, filename }: { elementId: string, filename: string }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    setIsDownloading(true);
    try {
      // Small delay to ensure any fonts/images are fully rendered
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const dataUrl = await toPng(el, { 
        quality: 1.0, 
        pixelRatio: 3, // High-res for printing
        backgroundColor: '#0F131F' // Match canvas background just in case
      });
      
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();
      
      toast.success("Ticket downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download ticket.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button 
      onClick={handleDownload} 
      disabled={isDownloading}
      className="w-full bg-white text-black hover:bg-gray-200 transition-colors py-4 font-bold rounded-xl"
    >
      <Download className="w-4 h-4 mr-2" />
      {isDownloading ? "Saving..." : "Download Digital Pass"}
    </Button>
  );
}
