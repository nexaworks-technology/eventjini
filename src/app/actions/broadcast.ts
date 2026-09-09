"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { Resend } from "resend";

export async function sendBroadcast(
  eventId: string,
  recipientStatus: string,
  subject: string,
  body: string
) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return { error: "Resend API Key is missing. Please add RESEND_API_KEY to your environment variables." };
    }

    const resend = new Resend(resendApiKey);
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Unauthorized" };

    // 2. Fetch event to ensure ownership
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("title, organizer_id")
      .eq("id", eventId)
      .single();

    if (eventError || !event || event.organizer_id !== user.id) {
      return { error: "Event not found or unauthorized" };
    }

    // 3. Fetch recipients based on status
    let query = supabase
      .from("registrations")
      .select("user:profiles(email, full_name)")
      .eq("event_id", eventId);

    if (recipientStatus === "all") {
      query = query.eq("status", "approved");
    } else if (recipientStatus === "pending") {
      query = query.eq("status", "pending");
    } else if (recipientStatus === "vip") {
      // Mock VIP logic: maybe tickets where payment was high, or custom field
      // For now, let's just use all approved
      query = query.eq("status", "approved");
    }

    const { data: registrations, error: regError } = await query;

    if (regError || !registrations || registrations.length === 0) {
      return { error: "No recipients found matching that criteria." };
    }

    // 4. Extract emails
    const emails = registrations
      .map((reg: any) => reg.user?.email)
      .filter((email): email is string => !!email);

    if (emails.length === 0) {
      return { error: "No valid email addresses found." };
    }

    // 5. Send Email via Resend
    // Resend free tier limits batch sending to 50 at a time, or we can send individually.
    // For MVP, we will use a Bcc array to save API calls (max 50 emails per request).
    const bccList = emails.slice(0, 50); // limit to 50 for safety in MVP

    const { data, error } = await resend.emails.send({
      from: `EventJini Updates <onboarding@resend.dev>`,
      to: 'sahilghewari6@gmail.com', // Hardcoded for Resend free tier testing
      bcc: bccList,
      subject: `[${event.title}] ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Event Update</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb; color: #111827;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e5e7eb;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #06b6d4 0%, #a855f7 100%); padding: 32px 40px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">EventJini</h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 24px 0; font-size: 20px; font-weight: 600; color: #111827;">
                        Update regarding ${event.title}
                      </h2>
                      
                      <div style="font-size: 16px; line-height: 1.6; color: #4b5563; white-space: pre-wrap;">${body}</div>
                      
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 40px;">
                        <tr>
                          <td align="center">
                            <a href="https://eventjini.com/my-tickets" style="display: inline-block; background-color: #111827; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 500; padding: 12px 24px; border-radius: 8px; transition: background-color 0.2s;">
                              View Your Ticket
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f3f4f6; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; font-size: 12px; color: #6b7280;">
                        You are receiving this email because you are registered for <strong>${event.title}</strong> via EventJini.
                      </p>
                      <p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af;">
                        &copy; ${new Date().getFullYear()} EventJini. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return { error: error.message };
    }

    return { success: true, count: bccList.length };
  } catch (err: any) {
    console.error("Error in sendBroadcast:", err);
    return { error: err?.message || "An unexpected error occurred" };
  }
}
