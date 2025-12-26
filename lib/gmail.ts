// Gmail sending service
import nodemailer from 'nodemailer';

export interface EmailDraft {
  subject: string;
  body: string;
  recipient?: string;
}

export async function sendGmailEmail(
  to: string,
  subject: string,
  body: string,
  options?: {
    from?: string;
    replyTo?: string;
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Check if credentials are available
    const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER;
    const emailPass = process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD;

    if (!emailUser || !emailPass) {
      return {
        success: false,
        error: 'Gmail credentials not configured. Please set EMAIL_USER and EMAIL_PASS environment variables.',
      };
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: options?.from || emailUser,
      to,
      subject,
      html: body.replace(/\n/g, '<br>'),
      replyTo: options?.replyTo,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error('Gmail sending error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
}

export function isEmailRelatedTask(title: string, description: string): boolean {
  const emailKeywords = [
    'email',
    'mail',
    'send',
    'follow-up',
    'followup',
    'outreach',
    'proposal',
    'message',
    'contact',
    'reach out',
    'draft email',
    'compose',
  ];

  const text = `${title} ${description}`.toLowerCase();
  return emailKeywords.some((keyword) => text.includes(keyword));
}


