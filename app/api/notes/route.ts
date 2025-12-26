import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import dbConnect from '@/lib/db';
import Note from '@/models/Note';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { content } = await req.json();

    // Auth check (using your logic)
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token) as { userId: string };

    // 1. Configure Gemini for Structured Output
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              category: { 
                type: SchemaType.STRING,
                description: "Category of the note" 
              },
              sentiment: { 
                type: SchemaType.STRING, 
                description: "Sentiment: high, neutral, or low"
                // Removed 'enum' directly from here to satisfy the strict TS check
              },
              aiSummary: { 
                type: SchemaType.STRING,
                description: "Short 5-word summary"
              }
            },
            required: ["category", "sentiment", "aiSummary"]
          }
        }
      });
    // 2. Analyze the Note
    const prompt = `  Analyze this thought from the user: "${content}". 
  Give me a 5-word summary that sounds like a supportive friend summarizing a conversation.
`;
    const result = await model.generateContent(prompt);
    const aiAttributes = JSON.parse(result.response.text());

    // 3. Save enriched note to DB
    const newNote = await Note.create({
      userId: decoded.userId,
      content,
      ...aiAttributes
    });

    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    console.error("Gemini Note Error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}