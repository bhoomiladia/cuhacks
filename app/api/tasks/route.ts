import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

// Simple auth check since we're not using NextAuth yet
const authOptions = {
  // This is a placeholder - in a real app, you'd want proper authentication
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
};

interface Task {
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  source?: string;
  rawInput?: string;
  executionStatus?: string;
  agentOutput?: any;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const data = await request.json();
    const { 
      title, 
      description, 
      status = 'pending', 
      source = 'dashboard_voice',
      rawInput = '',
      executionStatus = 'not_started',
      agentOutput = null
    } = data;

    if (!title || !description) {
      return new NextResponse(
        JSON.stringify({ error: 'Title and description are required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const now = new Date();

    const task: Task = {
      title,
      description,
      status,
      source,
      rawInput,
      executionStatus,
      agentOutput,
      userId: session.user.email,
      createdAt: now,
      updatedAt: now,
    };

    const tasksCollection = db.collection('tasks');
    const result = await tasksCollection.insertOne(task);
    const createdTask = await tasksCollection.findOne({ _id: result.insertedId });
    
    if (!createdTask) {
      throw new Error('Failed to create task');
    }

    // Trigger Langflow execution asynchronously
    if (process.env.LANGFLOW_WEBHOOK_URL) {
      fetch(process.env.LANGFLOW_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: result.insertedId.toString(),
          userId: session.user.email,
          input: rawInput || description,
        }),
      }).catch(console.error);
    }

    return NextResponse.json({
      ...createdTask,
      _id: createdTask._id.toString(),
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to create task',
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const client = await clientPromise;
    const db = client.db();
    
    const tasksCollection = db.collection('tasks');
    const tasks = await tasksCollection
      .find({ userId: session.user.email })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(
      tasks.map((task: any) => ({
        ...task,
        _id: task._id.toString(),
        id: task._id.toString(),
      }))
    );
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to fetch tasks',
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
