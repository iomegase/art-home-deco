import { Resend } from "resend";
import { logger } from "@/lib/logger";
import { getEnv } from "@/server/env";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

export async function sendTransactionalEmail(input: SendEmailInput) {
  const env = getEnv();

  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    logger.info("Transactional email skipped: provider not configured", {
      to: input.to,
      subject: input.subject,
    });
    return { sent: false as const };
  }

  const resend = new Resend(env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: input.to,
    replyTo: env.EMAIL_REPLY_TO,
    subject: input.subject,
    html: input.html,
  });

  if (error) {
    throw new Error(`Email provider error: ${error.message}`);
  }

  return { sent: true as const };
}
