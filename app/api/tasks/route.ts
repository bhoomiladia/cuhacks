import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import { cookies } from 'next/headers';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Helper to get authenticated user
async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  const decoded = verifyToken(token);
  return decoded as { userId: string; role: string } | null;
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tasks = await Task.find({ userId: user.userId }).sort({ createdAt: -1 });
    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const priority = formData.get('priority') as string;
    const dueDate = formData.get('dueDate') as string;
    const file = formData.get('file') as File | null;
    const source = formData.get('source') as string || 'web';

    let fileUrl = '';
    let fileName = '';

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch (e) {
        // Ignore error if directory exists
      }

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storedFileName = uniqueSuffix + '-' + safeName;
      const filePath = path.join(uploadsDir, storedFileName);

      await writeFile(filePath, buffer);
      fileUrl = `/uploads/${storedFileName}`;
      fileName = file.name;
    }

    const text = `${title} ${description}`.toLowerCase();
    
    // Intent Detection Logic
    let type = 'NORMAL';
    let emailIntent = null;

    const sendPhrases = ['send email', 'email to', 'mail to'];
    const draftPhrases = ['draft email', 'write email'];
    const readPhrases = ['read email', 'check inbox', 'review emails'];

    // Priority: SEND > DRAFT > READ
    if (sendPhrases.some(p => text.includes(p))) {
      type = 'EMAIL_ACTION';
      emailIntent = 'SEND';
    } else if (draftPhrases.some(p => text.includes(p))) {
      type = 'EMAIL_ACTION';
      emailIntent = 'DRAFT';
    } else if (readPhrases.some(p => text.includes(p))) {
      type = 'EMAIL_ACTION';
      emailIntent = 'READ';
    } else if (text.includes('email') || text.includes('mail')) {
      // Ambiguous intent → default to DRAFT
      type = 'EMAIL_ACTION';
      emailIntent = 'DRAFT';
    }

    const newTask = await Task.create({
      userId: user.userId,
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      fileUrl,
      fileName,
      status: 'pending',
      type,
      emailIntent,
      source,
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
