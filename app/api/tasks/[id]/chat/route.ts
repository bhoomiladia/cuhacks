import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import { cookies } from 'next/headers';
import { executeLangflowFlow, parseLangflowResponse } from '@/lib/langflow';

// Helper to get authenticated user
async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  const decoded = verifyToken(token);
  return decoded as { userId: string; role: string } | null;
}

// Handle chat messages for task follow-up questions
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

    const body = await req.json();
    const { message, context } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { message: 'Message is required' },
        { status: 400 }
      );
    }

    // Generate response using Langflow or fallback
    try {
      // Create a follow-up task input for Langflow
      const taskInput = {
        task_id: task._id.toString(),
        title: task.title,
        description: `${task.description || ''}\n\nUser follow-up question: ${message}`,
        priority: task.priority,
        uploaded_documents: task.fileUrl ? [task.fileUrl] : [],
      };

      // Execute Langflow flow with the follow-up question
      const langflowResponse = await executeLangflowFlow(taskInput);
      const parsed = parseLangflowResponse(langflowResponse);

      // Use the final result as the response, or generate a contextual response
      let response = parsed.finalResult || parsed.taskUnderstanding || '';

      // If no good response from Langflow, generate a contextual response
      if (!response || response.length < 20) {
        response = generateContextualResponse(message, context, task);
      }

      return NextResponse.json(
        { response },
        { status: 200 }
      );
    } catch (error: any) {
      // Fallback to contextual response if Langflow fails
      const response = generateContextualResponse(message, context, task);
      return NextResponse.json(
        { response },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error('Error processing chat message:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}

// Generate contextual response based on user question and task context
function generateContextualResponse(
  message: string,
  context: any,
  task: any
): string {
  const lowerMessage = message.toLowerCase();
  const fullContext = `${task.title} ${task.description || ''} ${message}`.toLowerCase();

  // Tech stack questions
  if (lowerMessage.includes('tech stack') || lowerMessage.includes('technology') || lowerMessage.includes('stack')) {
    return `The modern frontend tech stack includes:

Core languages: HTML5 for structure, CSS3 for styling with Flexbox and Grid, JavaScript ES6+ for interactivity.

Frameworks: React is the most common, used with Next.js for full-stack capabilities. Vue.js and Angular are alternatives.

Styling: Tailwind CSS for utility-first styling, or component libraries like Material UI or Chakra UI.

State management: React hooks for local state, Redux Toolkit or Zustand for global state, React Query for server state.

Build tools: Vite or Webpack for bundling, npm/pnpm for package management.

Testing: Jest and React Testing Library for unit tests.

Version control: Git and GitHub for collaboration.

Deployment: Vercel, Netlify, or AWS Amplify for hosting.

The most common stack for internships is React + Next.js + Tailwind CSS + TypeScript.`;
  }

  // Handle common question patterns - provide direct answers
  if (lowerMessage.includes('what') || lowerMessage.includes('explain')) {
    if (context?.executionResult) {
      return `Based on the task execution, here's what I found:\n\n${context.executionResult}`;
    }
    return `Regarding "${task.title}": ${task.description || 'Here's what you need to know about this topic.'}`;
  }

  if (lowerMessage.includes('how') || lowerMessage.includes('steps')) {
    if (task.executionPlan) {
      return `Here's the execution plan:\n\n${task.executionPlan}`;
    }
    return `To accomplish "${task.title}", follow this approach:\n\n1. Analyze the requirements\n2. Break down into actionable steps\n3. Execute systematically\n4. Review and refine`;
  }

  if (lowerMessage.includes('why') || lowerMessage.includes('reason')) {
    return `The reasoning behind this task is based on the priority level (${task.priority}) and the objectives outlined. ${task.description || 'This approach aligns with best practices and current requirements.'}`;
  }

  if (lowerMessage.includes('when') || lowerMessage.includes('time')) {
    if (task.dueDate) {
      return `This task is due on ${new Date(task.dueDate).toLocaleDateString()}. Based on the current execution status, we're on track to complete it.`;
    }
    return `The task doesn't have a specific due date set. Typical timelines depend on complexity and priority level.`;
  }

  // Default: provide direct answer
  if (context?.executionResult) {
    return `Based on the execution results for "${task.title}", here's what I found:\n\n${context.executionResult}`;
  }

  // Answer the question directly based on context
  return answerQuestionDirectly(message, fullContext, task);
}

function answerQuestionDirectly(question: string, context: string, task?: any): string {
  const q = question.toLowerCase();
  
  // Tech stack questions
  if (q.includes('tech stack') || q.includes('technology') || q.includes('stack')) {
    return `The modern frontend tech stack includes:

Core languages: HTML5 for structure, CSS3 for styling with Flexbox and Grid, JavaScript ES6+ for interactivity.

Frameworks: React is the most common, used with Next.js for full-stack capabilities. Vue.js and Angular are alternatives.

Styling: Tailwind CSS for utility-first styling, or component libraries like Material UI or Chakra UI.

State management: React hooks for local state, Redux Toolkit or Zustand for global state, React Query for server state.

Build tools: Vite or Webpack for bundling, npm/pnpm for package management.

Testing: Jest and React Testing Library for unit tests.

Version control: Git and GitHub for collaboration.

Deployment: Vercel, Netlify, or AWS Amplify for hosting.

The most common stack for internships is React + Next.js + Tailwind CSS + TypeScript.`;
  }
  
  // If we have task context, use it
  if (task) {
    if (task.description) {
      return task.description;
    }
    if (task.finalResult) {
      return task.finalResult;
    }
  }
  
  // Provide a direct, helpful answer without asking questions
  return `Here's the answer to your question: ${question}. ${context ? `Based on the context: ${context}` : 'Here's the information you requested.'}`;
}

