import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import { cookies } from 'next/headers';
import { sendGmailEmail } from '@/lib/gmail';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini Configuration
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Helper to get authenticated user
async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded as { userId: string; role: string } | null;
}

// Update/Generate email draft using Gemini
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
    const { prompt, recipient } = body; // User prompt input

    if (!prompt) {
      return NextResponse.json({ message: 'Prompt is required' }, { status: 400 });
    }

    // 1. Initialize Gemini Model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 2. Instruct Gemini to return JSON
    const systemPrompt = `
      You are a professional email assistant. 
      Based on this user prompt: "${prompt}", create a professional email.
      Return ONLY a JSON object with "subject" and "body" keys. 
      Do not include any other text or markdown formatting.
    `;

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();
    
    // Clean potential markdown and parse JSON
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    const aiDraft = JSON.parse(cleanJson);

    // 3. Save to DB (only if not sent)
    if (!task.emailSent) {
      task.emailDraft = {
        subject: aiDraft.subject,
        body: aiDraft.body,
        recipient: recipient || task.emailDraft?.recipient || '',
      };
      await task.save();
    }

    return NextResponse.json(
      { message: 'AI Draft generated', draft: task.emailDraft },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error generating draft:', error);
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

    if (!task || !task.emailDraft) {
      return NextResponse.json({ message: 'Draft not found' }, { status: 404 });
    }

    if (task.emailSent) {
      return NextResponse.json({ message: 'Email already sent' }, { status: 400 });
    }

    const { recipient } = await req.json().catch(() => ({}));
    const to = recipient || task.emailDraft.recipient;

    if (!to) {
      return NextResponse.json({ message: 'Recipient email is required' }, { status: 400 });
    }

    // Send via Gmail
    const result = await sendGmailEmail(
      to,
      task.emailDraft.subject,
      task.emailDraft.body
    );

    if (!result.success) {
      return NextResponse.json({ message: 'Gmail error', error: result.error }, { status: 500 });
    }

    task.emailSent = true;
    task.sentAt = new Date();
    await task.save();

    return NextResponse.json({ message: 'Email sent', sentAt: task.sentAt }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error', error: error.message }, { status: 500 });
  }
}