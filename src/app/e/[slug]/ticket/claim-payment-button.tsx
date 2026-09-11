"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createRazorpayOrder, completeTicketPayment } from "@/app/actions/payment";
import { useRouter } from "next/navigation";
import Script from "next/script";

export function ClaimPaymentButton({ eventId, ticketCode, priceCents }: { eventId: string, ticketCode: string, priceCents: number }) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handlePay = async () => {
    setIsPending(true);
    setError(null);

    const orderRes = await createRazorpayOrder(eventId);
    if (orderRes.error || !orderRes.data) {
      setError(orderRes.error || "Failed to initiate payment");
      setIsPending(false);
      return;
    }

    const options = {
      key: orderRes.data.key,
      amount: orderRes.data.amount,
      currency: "INR",
      name: "EventJini",
      description: "Complete Event Registration",
      order_id: orderRes.data.orderId,
      handler: async function (response: any) {
        // verify payment and update ticket
        const res = await completeTicketPayment(
          ticketCode,
          response.razorpay_order_id,
          response.razorpay_payment_id,
          response.razorpay_signature
        );
        
        if (res.error) {
          setError(res.error);
          setIsPending(false);
        } else {
          router.refresh(); // Refresh the page to show QR code
        }
      },
      theme: {
        color: "#6366f1",
      },
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
    setIsPending(false);
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="text-center w-full max-w-xs space-y-4">
        <h3 className="text-xl font-bold text-slate-900">Application Approved!</h3>
        <p className="text-sm text-slate-500">
          You're in. Pay the ticket fee to claim your spot and generate your digital pass.
        </p>
        <Button onClick={handlePay} disabled={isPending} variant="primary" className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white shadow-xl">
          {isPending ? "Processing..." : `Pay ₹${(priceCents / 100).toFixed(2)} to Claim`}
        </Button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </>
  );
}
