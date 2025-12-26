import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai"; // Fix: Correct import
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import Note from '@/models/Note';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// Fix: Initialize the client in THIS file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function GET() {
  try {
    await dbConnect();
    
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token) as { userId: string };

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // 1. Fetch Today's Data
    const [tasks, notes] = await Promise.all([
      Task.find({ userId: decoded.userId, createdAt: { $gte: startOfDay } }),
      Note.find({ userId: decoded.userId, createdAt: { $gte: startOfDay } })
    ]);

    // 2. Initialize Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const analysisPrompt = `
      You are Kairo, the user's intuitive and warm AI thought partner.
      Your goal is to look at their day and offer a reflection that feels like a supportive peer who really "gets" them.
    
      CONTEXT FOR TODAY:
      Tasks: ${tasks.map(t => `${t.title} [${t.status}]`).join(", ")}
      Thoughts: ${notes.map(n => n.content).join(" | ")}
      
      TASK:
      1. Write a "Narrative" (2 sentences). Be encouraging, insightful, and warm. 
         Instead of "Efficiency is 80%", say something like "You've put in a lot of heart into your technical work today, even if the afternoon felt a bit heavy."
      2. Give a "Score" (0-100) that rewards effort and mindful reflection, not just task completion.
      
      RETURN ONLY JSON: 
      { 
        "narrative": "A warm, human-like reflection here...", 
        "score": 85 
      }
    `;

    const result = await model.generateContent(analysisPrompt);
    const responseText = result.response.text().replace(/```json|```/g, "");
    const aiReport = JSON.parse(responseText);

    return NextResponse.json({
      ...aiReport,
      activityStream: [
        ...tasks.map(t => ({ ...t.toObject(), type: 'task' })),
        ...notes.map(n => ({ ...n.toObject(), type: 'note' }))
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    });

  } catch (error) {
    console.error("Analysis API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}