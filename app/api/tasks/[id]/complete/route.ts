import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import { cookies } from 'next/headers';

// Helper to get authenticated user
async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  const decoded = verifyToken(token);
  return decoded as { userId: string; role: string } | null;
}

export async function PATCH(
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

    console.log(`Attempting to complete task ${params.id} for user ${user.userId}`);

    const task = await Task.findOne({ _id: params.id, userId: user.userId });

    if (!task) {
      console.log(`Task ${params.id} not found for user ${user.userId}`);
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    // Update task status to completed
    task.status = 'completed';
    task.updatedAt = new Date();
    await task.save();

    return NextResponse.json(
      { message: 'Task completed', task },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error completing task:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}


