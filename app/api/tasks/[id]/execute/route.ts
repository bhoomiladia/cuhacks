import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import { cookies } from 'next/headers';
import { executeLangflowFlow, parseLangflowResponse } from '@/lib/langflow';
import { isEmailRelatedTask } from '@/lib/gmail';

// Helper to get authenticated user
async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  const decoded = verifyToken(token);
  return decoded as { userId: string; role: string } | null;
}

// Trigger agent execution for a task
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

    // Check if execution already exists and is not failed
    if (task.executionStatus === 'running') {
      return NextResponse.json(
        { message: 'Execution already in progress' },
        { status: 400 }
      );
    }

    if (task.executionStatus === 'completed') {
      return NextResponse.json(
        { message: 'Execution already completed', execution: task },
        { status: 200 }
      );
    }

    // Update status to running
    task.executionStatus = 'running';
    task.executionStartedAt = new Date();
    await task.save();

    try {
      // Prepare task input for Langflow
      const taskInput = {
        task_id: task._id.toString(),
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        uploaded_documents: task.fileUrl ? [task.fileUrl] : [],
      };

      // Execute Langflow flow
      const langflowResponse = await executeLangflowFlow(taskInput);

      // Parse response
      const parsed = parseLangflowResponse(langflowResponse);

      // Update task with execution results
      task.taskUnderstanding = parsed.taskUnderstanding || 'Task analyzed and processed by agent pipeline';
      task.executionPlan = parsed.executionPlan || 'Multi-step execution plan generated';
      task.intermediateSteps = parsed.intermediateSteps || [
        'Task received and parsed',
        'Agent pipeline initialized',
        'Execution completed',
      ];
      task.finalResult = parsed.finalResult || 'Task execution completed successfully';
      task.executionStatus = 'completed';
      task.executionCompletedAt = new Date();

      // Check if this is an email-related task and generate draft
      if (isEmailRelatedTask(task.title, task.description || '')) {
        // Generate email draft from agent output
        const emailSubject = extractEmailSubject(task.title, parsed.finalResult || '', parsed.executionPlan || '');
        const emailBody = generateEmailBody(task, parsed);
        const recipient = extractRecipient(task.description || '', parsed.finalResult || '');
        
        // Only create draft if it doesn't exist (preserve user edits)
        if (!task.emailDraft) {
          task.emailDraft = {
            subject: emailSubject,
            body: emailBody,
            recipient: recipient,
          };
        }
      }

      await task.save();

      return NextResponse.json(
        {
          message: 'Execution completed',
          execution: {
            status: task.executionStatus,
            taskUnderstanding: task.taskUnderstanding,
            executionPlan: task.executionPlan,
            intermediateSteps: task.intermediateSteps,
            finalResult: task.finalResult,
            emailDraft: task.emailDraft,
          },
        },
        { status: 200 }
      );
    } catch (error: any) {
      // Mark execution as failed
      task.executionStatus = 'failed';
      task.executionCompletedAt = new Date();
      task.finalResult = `Execution failed: ${error.message}`;
      await task.save();

      return NextResponse.json(
        { message: 'Execution failed', error: error.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error executing task:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}

// Helper functions for email generation
function extractEmailSubject(title: string, finalResult: string, executionPlan: string): string {
  // Try to extract subject from title or result
  if (title.toLowerCase().includes('email') || title.toLowerCase().includes('send')) {
    // Remove common prefixes
    let subject = title
      .replace(/^(draft|send|compose|write|email)\s+/i, '')
      .replace(/\s+(email|mail)$/i, '')
      .trim();
    
    // Capitalize first letter
    if (subject.length > 0) {
      subject = subject.charAt(0).toUpperCase() + subject.slice(1);
    }
    
    return subject.length > 50 ? subject.substring(0, 50) + '...' : subject;
  }
  
  // Try to extract from final result
  if (finalResult) {
    const lines = finalResult.split('\n');
    for (const line of lines) {
      if (line.toLowerCase().includes('subject:') || line.toLowerCase().includes('title:')) {
        const match = line.match(/subject:\s*(.+)/i) || line.match(/title:\s*(.+)/i);
        if (match && match[1]) {
          return match[1].trim().substring(0, 100);
        }
      }
    }
  }
  
  // Generate from task title
  return title.length > 50 ? title.substring(0, 50) + '...' : title;
}

function generateEmailBody(task: any, parsed: any): string {
  let body = '';

  // Prefer final result, then execution plan, then description
  if (parsed.finalResult) {
    body = parsed.finalResult;
    // Clean up if it contains structured data
    body = body.replace(/final result:/i, '').replace(/result:/i, '').trim();
  } else if (parsed.executionPlan) {
    body = `Based on the execution plan:\n\n${parsed.executionPlan}\n\nRegarding: ${task.title}`;
  } else if (task.description) {
    body = task.description;
  } else {
    body = `Hello,\n\nI wanted to reach out regarding: ${task.title}\n\nBest regards`;
  }

  // Format the body nicely - ensure it's not too technical
  if (body.includes('Task Understanding:') || body.includes('Execution Plan:')) {
    // Extract the actual content, not the structure
    const lines = body.split('\n');
    const contentLines = lines.filter(line => 
      !line.toLowerCase().includes('task understanding:') &&
      !line.toLowerCase().includes('execution plan:') &&
      !line.toLowerCase().includes('intermediate steps:') &&
      line.trim().length > 0
    );
    body = contentLines.join('\n') || body;
  }

  return body.trim();
}

function extractRecipient(description: string, finalResult: string): string {
  // Try to extract email from description first
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  
  // Check description
  const descMatch = description.match(emailRegex);
  if (descMatch) {
    return descMatch[0];
  }
  
  // Check final result
  if (finalResult) {
    const resultMatch = finalResult.match(emailRegex);
    if (resultMatch) {
      return resultMatch[0];
    }
    
    // Try to find recipient in structured format
    const recipientMatch = finalResult.match(/recipient:\s*([^\n]+)/i) || 
                          finalResult.match(/to:\s*([^\n]+)/i) ||
                          finalResult.match(/send to:\s*([^\n]+)/i);
    if (recipientMatch && recipientMatch[1]) {
      const recipient = recipientMatch[1].trim();
      // Check if it's an email
      if (emailRegex.test(recipient)) {
        return recipient;
      }
    }
  }
  
  return '';
}

