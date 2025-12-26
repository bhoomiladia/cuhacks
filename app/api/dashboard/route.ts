import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Task from '@/models/Task';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  try {
    await dbConnect();

    // 1. Get the token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    let userName = "Guest";
    let titles = []
    if (token) {
      // 2. Use your existing verifyToken logic
      const decoded: any = verifyToken(token);
      
      if (decoded && decoded.userId) {
        // 3. Fetch real user from DB
        const user = await User.findById(decoded.userId);
        const tasks = await Task.find({ userId: decoded.userId });
        // console.log("User Tasks:", tasks);
        if (user) {
          userName = user.name;
          titles = tasks.map(task => task.title);
        }
      }
    }
    
    // This is the data structure your frontend page.tsx expects
    const realData = {
      user: { 
        name: userName, 
        avatar: "https://github.com/shadcn.png" 
      },
      stats: { 
        emailsSent: 0, 
        tasksCompleted: "0%", 
        aiUptime: "24h" 
      },
      activeTasks: titles,
      executionLogs: [
        'Database: Connected',
        `Auth: Verified as ${userName}`,
        'System: Awaiting AI Commands'
      ]
    };

    return NextResponse.json(realData);
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}