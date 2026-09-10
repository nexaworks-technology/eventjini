"use server";

import Razorpay from "razorpay";
import crypto from "crypto";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { registerForEvent } from "./registrations";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function createRazorpayOrder(eventId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get event price
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("ticket_price_cents")
    .eq("id", eventId)
    .single();

  if (eventError || !event) return { error: "Event not found" };
  if (!event.ticket_price_cents) return { error: "Event is free" };

  try {
    const order = await razorpay.orders.create({
      amount: event.ticket_price_cents, // amount in paise
      currency: "INR",
      receipt: `receipt_${eventId}_${crypto.randomBytes(4).toString("hex")}`,
    });

    return { 
      data: { 
        orderId: order.id, 
        amount: order.amount,
        key: process.env.RAZORPAY_KEY_ID 
      } 
    };
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return { error: "Could not initialize payment" };
  }
}

export async function verifyPaymentAndRegister(
  eventId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  guestData?: any
) {
  // Verify Signature
  const body = razorpayOrderId + "|" + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpaySignature) {
    // Signature is valid, proceed to register
    return await registerForEvent(eventId, guestData);
  } else {
    return { error: "Invalid payment signature" };
  }
}

export async function createSponsorRazorpayOrder(tierId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: tier, error: tierError } = await supabase
    .from("sponsorship_tiers")
    .select("price_cents, event_id")
    .eq("id", tierId)
    .single();

  if (tierError || !tier) {
    console.error("Tier fetch error:", tierError, "Tier ID:", tierId);
    return { error: "Sponsorship tier not found" };
  }

  try {
    const order = await razorpay.orders.create({
      amount: tier.price_cents, // price_cents is already in paise (base unit)
      currency: "INR",
      receipt: `sponsor_${tierId}_${crypto.randomBytes(4).toString("hex")}`,
    });

    return { 
      data: { 
        orderId: order.id, 
        amount: order.amount,
        key: process.env.RAZORPAY_KEY_ID 
      } 
    };
  } catch (error: any) {
    console.error("Error creating Sponsor Razorpay order:", error);
    return { error: "Could not initialize payment" };
  }
}

export async function verifySponsorPaymentAndRegister(
  tierId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  companyName: string
) {
  const body = razorpayOrderId + "|" + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    return { error: "Invalid payment signature" };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to sponsor an event." };

  const { error } = await supabase
    .from("sponsor_registrations")
    .insert({
      tier_id: tierId,
      sponsor_user_id: user.id,
      company_name: companyName,
      status: "paid"
    });

  if (error) {
    console.error("Error inserting sponsor:", error);
    return { error: "Payment successful, but failed to create sponsor profile. Contact support." };
  }

  const { revalidatePath } = require("next/cache");
  revalidatePath("/dashboard/sponsor-portal");

  return { success: true };
}
