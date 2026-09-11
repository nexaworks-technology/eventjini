"use server";

import { Resend } from "resend";

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
};

// Base HTML template wrapper for consistency
const getEmailTemplate = (title: string, preheader: string, content: string, ctaHtml: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb; color: #111827;">
  <div style="display: none; max-height: 0px; overflow: hidden;">${preheader}</div>
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
                ${title}
              </h2>
              <div style="font-size: 16px; line-height: 1.6; color: #4b5563;">
                ${content}
              </div>
              ${ctaHtml ? `
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 40px;">
                <tr>
                  <td align="center">
                    ${ctaHtml}
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f3f4f6; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
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
`;

export async function sendApplicationReceivedEmail(
  toEmail: string,
  userName: string,
  eventTitle: string,
  ticketCode: string,
  appUrl: string
) {
  const resend = getResendClient();
  if (!resend) return { error: "Resend not configured" };

  const content = `
    <p>Hi ${userName},</p>
    <p>Your application to attend <strong>${eventTitle}</strong> has been received and is currently under review by the organizer.</p>
    <p>We will notify you via email as soon as a decision is made.</p>
    <p style="margin-top: 24px; font-size: 14px; color: #6b7280;">Reference Code: <span style="font-family: monospace; font-weight: bold;">${ticketCode}</span></p>
  `;

  const cta = `
    <a href="${appUrl}/my-tickets" style="display: inline-block; background-color: #111827; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 500; padding: 12px 24px; border-radius: 8px;">
      View Status in Wallet
    </a>
  `;

  try {
    await resend.emails.send({
      from: "EventJini <onboarding@resend.dev>",
      to: toEmail,
      subject: `Application Received: ${eventTitle}`,
      html: getEmailTemplate(`Application Received`, `Your application to attend ${eventTitle} is under review.`, content, cta)
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send Application Received email:", error);
    return { error };
  }
}

export async function sendTicketApprovedEmail(
  toEmail: string,
  userName: string,
  eventTitle: string,
  eventSlug: string,
  ticketCode: string,
  isPaid: boolean,
  appUrl: string
) {
  const resend = getResendClient();
  if (!resend) return { error: "Resend not configured" };

  const ticketUrl = `${appUrl}/e/${eventSlug}/ticket?code=${ticketCode}`;

  const content = isPaid 
    ? `
      <p>Great news, ${userName}!</p>
      <p>Your application to attend <strong>${eventTitle}</strong> has been <strong>approved</strong>.</p>
      <p>To claim your spot and generate your digital pass, please complete your ticket payment.</p>
    `
    : `
      <p>Great news, ${userName}!</p>
      <p>Your application to attend <strong>${eventTitle}</strong> has been <strong>approved</strong>.</p>
      <p>Your digital pass has been generated. You can download it directly from your ticket page or save it to your calendar.</p>
    `;

  const cta = isPaid
    ? `
      <a href="${ticketUrl}" style="display: inline-block; background-color: #6366f1; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold; padding: 12px 24px; border-radius: 8px;">
        Complete Payment to Claim Pass
      </a>
    `
    : `
      <a href="${ticketUrl}" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold; padding: 12px 24px; border-radius: 8px;">
        View Digital Pass
      </a>
    `;

  try {
    await resend.emails.send({
      from: "EventJini <onboarding@resend.dev>",
      to: toEmail,
      subject: `Approved: ${eventTitle}`,
      html: getEmailTemplate(`Application Approved!`, `Your application for ${eventTitle} has been approved.`, content, cta)
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send Ticket Approved email:", error);
    return { error };
  }
}
