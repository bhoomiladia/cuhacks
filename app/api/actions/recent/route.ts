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

export async function GET(req: Request) {
  try {
    await dbConnect();
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get recent tasks with email sent or recent executions
    const tasks = await Task.find({ userId: user.userId })
      .sort({ updatedAt: -1 })
      .limit(10);

    const actions: any[] = [];
    
    tasks.forEach((task) => {
      // Add email sent actions
      if (task.emailSent && task.sentAt) {
        actions.push({
          type: 'email_sent',
          title: 'Email Sent',
          description: task.emailDraft?.subject || 'Email sent',
          timestamp: task.sentAt,
          taskId: task._id.toString(),
        });
      }
      
      // Add recent chat messages
      if (task.chatMessages && task.chatMessages.length > 0) {
        const recentMessages = task.chatMessages.slice(-3);
        recentMessages.forEach((msg: any) => {
          if (msg.role === 'assistant' && msg.timestamp) {
            actions.push({
              type: 'chat_message',
              title: 'Assistant Response',
              description: msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : ''),
              timestamp: msg.timestamp,
              taskId: task._id.toString(),
            });
          }
        });
      }
      
      // Add execution logs
      if (task.executionLogs && task.executionLogs.length > 0) {
        const recentLogs = task.executionLogs.slice(-5);
        recentLogs.forEach((log: any) => {
          if (log.status === 'completed' && log.timestamp) {
            actions.push({
              type: 'execution_log',
              title: `${log.agent}: ${log.step}`,
              description: log.output?.substring(0, 100) || '',
              timestamp: log.timestamp,
              taskId: task._id.toString(),
            });
          }
        });
      }
      
      // Add execution status
      if (task.executionStatus === 'completed' && task.executionCompletedAt) {
        actions.push({
          type: 'execution_completed',
          title: 'Task Executed',
          description: task.title,
          timestamp: task.executionCompletedAt,
          taskId: task._id.toString(),
        });
      }
    });
    
    const sortedActions = actions
      .filter((action) => action !== null)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    return NextResponse.json({ actions }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching recent actions:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}

