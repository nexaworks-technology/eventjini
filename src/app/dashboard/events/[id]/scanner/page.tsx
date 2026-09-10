"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ScanLine, CheckCircle, Loader2, XCircle } from "lucide-react";
import { Scanner } from '@yudiel/react-qr-scanner';
import { Button } from "@/components/ui/button";
import { checkInGuest } from "@/app/actions/os";
import { motion, AnimatePresence } from "framer-motion";

export default function ScannerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = require("react").use(params);
  const eventId = resolvedParams.id;
  
  const [isScanning, setIsScanning] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [checkedInCount, setCheckedInCount] = useState(0);

  const handleScan = async (result: any[]) => {
    if (!isScanning || isProcessing) return;
    
    if (result && result.length > 0) {
      const value = result[0].rawValue;
      if (value) {
        setIsScanning(false);
        setIsProcessing(true);
        setLastScanned(value);
        
        const response = await checkInGuest(eventId, value);
        
        setScanResult(response);
        setIsProcessing(false);
        
        if (response.success) {
          setCheckedInCount(prev => prev + 1);
          toast.success(response.message);
        } else {
          toast.error(response.message);
        }
        
        setTimeout(() => {
          setIsScanning(true);
          setScanResult(null);
          setLastScanned(null);
        }, 3000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-8 px-4">
      
      {/* Status Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <div className={`p-3 rounded-2xl transition-colors duration-300 ${
          isScanning ? 'bg-brand-primary/10 text-brand-primary' : 
          isProcessing ? 'bg-amber-500/10 text-amber-500' :
          scanResult?.success ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
        }`}>
          {isScanning ? <ScanLine className="w-6 h-6 animate-pulse" /> : 
           isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> :
           scanResult?.success ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">
            {isScanning ? "SCAN TICKET" : 
             isProcessing ? "VERIFYING..." :
             scanResult?.success ? "ACCESS GRANTED" : "ACCESS DENIED"}
          </h2>
          <p className="text-sm text-muted">
            {isScanning ? "Point camera at QR code" : 
             isProcessing ? "Checking database..." :
             scanResult?.message}
          </p>
        </div>
      </motion.div>

      {/* Scanner Viewport */}
      <div className="relative w-full max-w-sm aspect-square rounded-3xl overflow-hidden border-2 border-white/[0.06] bg-black">
        <AnimatePresence mode="wait">
          {isScanning ? (
            <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
              <Scanner
                onScan={handleScan}
                classNames={{
                  container: "w-full h-full",
                  video: "object-cover w-full h-full"
                }}
              />
              
              {/* Corner brackets */}
              <div className="absolute inset-0 pointer-events-none p-5">
                <div className="w-full h-full relative">
                  <div className="absolute -top-0.5 -left-0.5 w-8 h-8 border-t-[3px] border-l-[3px] border-brand-primary rounded-tl-xl" />
                  <div className="absolute -top-0.5 -right-0.5 w-8 h-8 border-t-[3px] border-r-[3px] border-brand-primary rounded-tr-xl" />
                  <div className="absolute -bottom-0.5 -left-0.5 w-8 h-8 border-b-[3px] border-l-[3px] border-brand-primary rounded-bl-xl" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-8 h-8 border-b-[3px] border-r-[3px] border-brand-primary rounded-br-xl" />
                </div>
              </div>
              
              {/* Animated scan line */}
              <div className="absolute left-5 right-5 top-5 h-[2px] bg-brand-primary shadow-[0_0_12px_3px_rgba(99,102,241,0.6)] animate-[scan_2s_ease-in-out_infinite]" />
            </motion.div>
          ) : isProcessing ? (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-amber-500/5 flex flex-col items-center justify-center"
            >
              <Loader2 className="w-20 h-20 text-amber-500 animate-spin mb-4" />
              <p className="text-xl font-bold text-white">Verifying...</p>
            </motion.div>
          ) : scanResult?.success ? (
            <motion.div key="success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-emerald-500/10 flex flex-col items-center justify-center"
            >
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
                <CheckCircle className="w-24 h-24 text-emerald-500 mb-4" />
              </motion.div>
              <p className="text-2xl font-bold text-white">ACCESS GRANTED</p>
              <p className="text-sm text-emerald-400 font-mono mt-2">{lastScanned}</p>
            </motion.div>
          ) : (
            <motion.div key="denied" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-red-500/10 flex flex-col items-center justify-center"
            >
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
                <XCircle className="w-24 h-24 text-red-500 mb-4" />
              </motion.div>
              <p className="text-2xl font-bold text-white">ACCESS DENIED</p>
              <p className="text-sm text-red-400 mt-2">{scanResult?.message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes scan {
            0% { top: 1.25rem; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: calc(100% - 1.25rem); opacity: 0; }
          }
        `
      }} />

      {/* Counter + Controls */}
      <div className="mt-8 flex flex-col items-center gap-4">
        <p className="text-4xl font-bold text-white tabular-nums">{checkedInCount}</p>
        <p className="text-xs text-muted uppercase tracking-widest">Checked In</p>
        
        {!isScanning && !isProcessing && (
          <Button
            variant="primary"
            onClick={() => {
              setIsScanning(true);
              setScanResult(null);
              setLastScanned(null);
            }}
            className="mt-2"
          >
            Scan Next
          </Button>
        )}
      </div>
    </div>
  );
}
