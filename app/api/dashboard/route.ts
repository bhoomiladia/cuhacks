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

    let userData = {
      name: "Guest",
      title: "Professional",
      bio: "",
      avatar: "https://github.com/shadcn.png"
    };
    let activeTaskTitles: string[] = [];
    let aiUptime = "0h"; // Default

    if (token) {
      const decoded: any = verifyToken(token);
      
      if (decoded && decoded.userId) {
        // Fetch name, title, bio AND createdAt for uptime calculation
        const [user, tasks] = await Promise.all([
          User.findById(decoded.userId).select('name title bio createdAt'),
          Task.find({ userId: decoded.userId }).limit(5)
        ]);

        if (user) {
          // Calculate Uptime: Hours since account creation
          const joinedDate = new Date(user.createdAt);
          const now = new Date();
          const diffInHours = Math.floor((now.getTime() - joinedDate.getTime()) / (1000 * 60 * 60));
          aiUptime = `${diffInHours}h`;

          userData = {
            name: user.name,
            title: user.title || "Professional",
            bio: user.bio || "",
            avatar: user.avatar || "https://github.com/shadcn.png"
          };
          activeTaskTitles = tasks.map(task => task.title);
        }
      }
    }
    
    return NextResponse.json({
      user: userData,
      stats: { 
        emailsSent: 0, 
        tasksCompleted: "0%", 
        aiUptime: aiUptime // REAL UPTIME
      },
      activeTasks: activeTaskTitles,
      executionLogs: [
        'Database: Connected',
        `Auth: Verified as ${userData.name}`,
        `Environment: ${userData.title}`, // REAL TITLE
        'System: Awaiting AI Commands'
      ]
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}