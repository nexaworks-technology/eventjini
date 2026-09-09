"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { FadeInUp } from "@/components/animations/motion";
import { toast } from "sonner";
import { ScanLine, CheckCircle } from "lucide-react";
import { Scanner } from '@yudiel/react-qr-scanner';
import { Button } from "@/components/ui/button";

import { checkInGuest } from "@/app/actions/os";

import { Loader2, XCircle } from "lucide-react";

export default function ScannerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = require("react").use(params);
  const eventId = resolvedParams.id;
  
  const [isScanning, setIsScanning] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  const handleScan = async (result: any[]) => {
    if (!isScanning || isProcessing) return;
    
    if (result && result.length > 0) {
      const value = result[0].rawValue;
      if (value) {
        setIsScanning(false);
        setIsProcessing(true);
        setLastScanned(value);
        
        // Call backend to actually check in the guest
        const response = await checkInGuest(eventId, value);
        
        setScanResult(response);
        setIsProcessing(false);
        
        if (response.success) {
          toast.success(response.message);
        } else {
          toast.error(response.message);
        }
        
        // Resume scanning after 3 seconds automatically
        setTimeout(() => {
          setIsScanning(true);
          setScanResult(null);
          setLastScanned(null);
        }, 3000);
      }
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <FadeInUp>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">QR Scanner</h1>
        <p className="text-white/60">Scan attendee tickets for fast check-in.</p>
      </FadeInUp>

      <FadeInUp delay={0.1}>
        <GlassCard className="p-8 flex flex-col items-center justify-center space-y-8 min-h-[500px] relative overflow-hidden">
          {/* Header indicator */}
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${
              isScanning ? 'bg-cyan-500/20 text-cyan-500' : 
              isProcessing ? 'bg-amber-500/20 text-amber-500' :
              scanResult?.success ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'
            }`}>
              {isScanning ? <ScanLine className="w-6 h-6 animate-pulse" /> : 
               isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> :
               scanResult?.success ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {isScanning ? "Ready to Scan" : 
                 isProcessing ? "Verifying..." :
                 scanResult?.success ? "Success" : "Invalid Ticket"}
              </h2>
              <p className="text-sm text-white/50">
                {isScanning ? "Point camera at the QR code" : 
                 isProcessing ? "Checking database..." :
                 scanResult?.message}
              </p>
            </div>
          </div>

          {/* Scanner Area */}
          <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/50">
            {isScanning ? (
              <Scanner
                onScan={handleScan}
                classNames={{
                  container: "w-full h-full",
                  video: "object-cover w-full h-full"
                }}
              />
            ) : isProcessing ? (
              <div className="absolute inset-0 bg-amber-500/10 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                <Loader2 className="w-16 h-16 text-amber-500 mb-4 animate-spin" />
                <p className="text-white font-medium mb-1">Verifying Ticket...</p>
                <p className="text-amber-400 text-sm break-all font-mono opacity-50">{lastScanned}</p>
              </div>
            ) : scanResult?.success ? (
              <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
                <p className="text-white font-medium mb-1">{scanResult.message}</p>
                <p className="text-emerald-400 text-sm break-all font-mono opacity-50">{lastScanned}</p>
              </div>
            ) : (
              <div className="absolute inset-0 bg-red-500/10 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                <XCircle className="w-16 h-16 text-red-500 mb-4" />
                <p className="text-white font-medium mb-1">Access Denied</p>
                <p className="text-red-400 text-sm break-all font-mono opacity-50">{lastScanned}</p>
              </div>
            )}

            {/* Scanning overlay brackets */}
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none p-6">
                <div className="w-full h-full border-2 border-white/20 rounded-xl relative">
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-cyan-500 rounded-tl-xl" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-cyan-500 rounded-tr-xl" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-cyan-500 rounded-bl-xl" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-cyan-500 rounded-br-xl" />
                  
                  {/* Scanning line animation */}
                  <div className="absolute left-0 top-0 w-full h-[2px] bg-cyan-500 shadow-[0_0_8px_2px_rgba(6,182,212,0.5)] animate-[scan_2s_ease-in-out_infinite]" />
                </div>
              </div>
            )}
          </div>
          
          <style dangerouslySetInnerHTML={{
            __html: `
              @keyframes scan {
                0% { top: 0; opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { top: 100%; opacity: 0; }
              }
            `
          }} />

          {/* Controls */}
          {!isScanning && (
            <Button
              variant="primary"
              onClick={() => {
                setIsScanning(true);
                setScanResult(null);
                setLastScanned(null);
              }}
              className="mt-4"
            >
              Scan Next Ticket
            </Button>
          )}
        </GlassCard>
      </FadeInUp>
    </div>
  );
}
