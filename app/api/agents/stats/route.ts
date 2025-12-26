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

    // Get all tasks for the user
    const tasks = await Task.find({ userId: user.userId });

    // Calculate statistics for each agent
    const interpreterTasks = tasks.filter(
      (t) => t.executionStatus === 'completed' || t.executionStatus === 'running'
    );
    const plannerTasks = tasks.filter((t) => t.executionPlan);
    const executorTasks = tasks.filter(
      (t) => t.intermediateSteps && t.intermediateSteps.length > 0
    );

    // Calculate success rates
    const completedTasks = tasks.filter((t) => t.executionStatus === 'completed');
    const failedTasks = tasks.filter((t) => t.executionStatus === 'failed');
    const runningTasks = tasks.filter((t) => t.executionStatus === 'running');

    // Calculate average execution time
    const tasksWithTiming = tasks.filter(
      (t) => t.executionStartedAt && t.executionCompletedAt
    );
    let avgExecutionTime = 0;
    if (tasksWithTiming.length > 0) {
      const totalTime = tasksWithTiming.reduce((sum, t) => {
        const start = new Date(t.executionStartedAt!).getTime();
        const end = new Date(t.executionCompletedAt!).getTime();
        return sum + (end - start);
      }, 0);
      avgExecutionTime = totalTime / tasksWithTiming.length;
    }

    const interpreterSuccessRate =
      interpreterTasks.length > 0
        ? ((completedTasks.length / interpreterTasks.length) * 100).toFixed(1)
        : '0.0';

    const plannerSuccessRate =
      plannerTasks.length > 0
        ? ((completedTasks.filter((t) => t.executionPlan).length / plannerTasks.length) * 100).toFixed(1)
        : '0.0';

    const executorSuccessRate =
      executorTasks.length > 0
        ? ((completedTasks.filter((t) => t.intermediateSteps && t.intermediateSteps.length > 0).length / executorTasks.length) * 100).toFixed(1)
        : '0.0';

    // Calculate current load (percentage of running tasks)
    const totalActiveTasks = runningTasks.length;
    const maxCapacity = 100; // Assume max capacity
    const interpreterLoad = Math.min((runningTasks.length / maxCapacity) * 100, 100);
    const plannerLoad = Math.min((runningTasks.length / maxCapacity) * 100, 100);
    const executorLoad = Math.min((runningTasks.length / maxCapacity) * 100, 100);

    return NextResponse.json(
      {
        agents: [
          {
            name: 'Interpreter',
            tasksProcessed: interpreterTasks.length,
            successRate: parseFloat(interpreterSuccessRate),
            avgResponseTime: avgExecutionTime > 0 ? `${(avgExecutionTime / 1000).toFixed(1)}s` : '0.0s',
            currentLoad: Math.round(interpreterLoad),
            status: runningTasks.length > 0 ? 'active' : 'idle',
          },
          {
            name: 'Planner',
            tasksProcessed: plannerTasks.length,
            successRate: parseFloat(plannerSuccessRate),
            avgResponseTime: avgExecutionTime > 0 ? `${(avgExecutionTime / 1000).toFixed(1)}s` : '0.0s',
            currentLoad: Math.round(plannerLoad),
            status: runningTasks.length > 0 ? 'active' : 'idle',
          },
          {
            name: 'Executor',
            tasksProcessed: executorTasks.length,
            successRate: parseFloat(executorSuccessRate),
            avgResponseTime: avgExecutionTime > 0 ? `${(avgExecutionTime / 1000).toFixed(1)}s` : '0.0s',
            currentLoad: Math.round(executorLoad),
            status: runningTasks.length > 0 ? 'active' : 'idle',
          },
        ],
        systemStats: {
          totalTasks: tasks.length,
          completedTasks: completedTasks.length,
          failedTasks: failedTasks.length,
          runningTasks: runningTasks.length,
          totalTokens: '1.2M', // Placeholder - would need to track this
          systemHealth: tasks.length > 0 ? ((completedTasks.length / tasks.length) * 100).toFixed(1) : '100.0',
        },
        recentExecutions: tasks
          .filter((t) => t.executionCompletedAt || t.executionStartedAt)
          .sort((a, b) => {
            const aTime = a.executionCompletedAt || a.executionStartedAt || new Date(0);
            const bTime = b.executionCompletedAt || b.executionStartedAt || new Date(0);
            return new Date(bTime).getTime() - new Date(aTime).getTime();
          })
          .slice(0, 10)
          .map((t) => ({
            taskId: t._id.toString(),
            title: t.title,
            status: t.executionStatus,
            completedAt: t.executionCompletedAt,
            startedAt: t.executionStartedAt,
          })),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching agent stats:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}


