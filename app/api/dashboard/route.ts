import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Task from '@/models/Task';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  try {
    await dbConnect();

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    // Set defaults
    let userData = {
      name: "Guest",
      title: "Professional",
      bio: "",
      avatar: "https://github.com/shadcn.png"
    };
    let activeTaskTitles: string[] = [];

    if (token) {
      const decoded: any = verifyToken(token);
      
      if (decoded && decoded.userId) {
        // Fetch User and Tasks in parallel for better performance
        const [user, tasks] = await Promise.all([
          User.findById(decoded.userId).select('name title bio'),
          Task.find({ userId: decoded.userId }).limit(5) // Limit to 5 for the dashboard view
        ]);

        if (user) {
          userData = {
            name: user.name,
            title: user.title || "Professional",
            bio: user.bio || "",
            avatar: "https://github.com/shadcn.png"
          };
          activeTaskTitles = tasks.map(task => task.title);
        }
      }
    }
    
    const realData = {
      user: userData,
      stats: { 
        emailsSent: 0, 
        tasksCompleted: "0%", 
        aiUptime: "24h" 
      },
      activeTasks: activeTaskTitles,
      executionLogs: [
        'Database: Connected',
        `Auth: Verified as ${userData.name}`,
        `Environment: ${userData.title}`,
        'System: Awaiting AI Commands'
      ]
    };

    return NextResponse.json(realData);
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}