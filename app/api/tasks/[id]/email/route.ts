import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import { cookies } from 'next/headers';
import { sendGmailEmail } from '@/lib/gmail';

// Helper to get authenticated user
async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  const decoded = verifyToken(token);
  return decoded as { userId: string; role: string } | null;
}

// Update email draft
export async function PUT(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    await dbConnect();
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const task = await Task.findOne({ _id: params.id, userId: user.userId });

    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    const body = await req.json();
    const { subject, body: emailBody, recipient } = body;

    if (!subject || !emailBody) {
      return NextResponse.json(
        { message: 'Subject and body are required' },
        { status: 400 }
      );
    }

    // Update email draft (only if not already sent)
    if (!task.emailSent) {
      task.emailDraft = {
        subject,
        body: emailBody,
        recipient: recipient || task.emailDraft?.recipient || '',
      };
      await task.save();
    }

    return NextResponse.json(
      { message: 'Draft updated', draft: task.emailDraft },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating email draft:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}

// Send email
export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    await dbConnect();
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const task = await Task.findOne({ _id: params.id, userId: user.userId });

    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    if (!task.emailDraft) {
      return NextResponse.json(
        { message: 'No email draft found' },
        { status: 400 }
      );
    }

    if (task.emailSent) {
      return NextResponse.json(
        { message: 'Email already sent' },
        { status: 400 }
      );
    }

    const { recipient } = await req.json().catch(() => ({}));
    const to = recipient || task.emailDraft.recipient;

    if (!to) {
      return NextResponse.json(
        { message: 'Recipient email is required' },
        { status: 400 }
      );
    }

    // Send email via Gmail
    const result = await sendGmailEmail(
      to,
      task.emailDraft.subject,
      task.emailDraft.body
    );

    if (!result.success) {
      return NextResponse.json(
        { message: 'Failed to send email', error: result.error },
        { status: 500 }
      );
    }

    // Update task
    task.emailSent = true;
    task.sentAt = new Date();
    await task.save();

    return NextResponse.json(
      {
        message: 'Email sent successfully',
        messageId: result.messageId,
        sentAt: task.sentAt,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}


