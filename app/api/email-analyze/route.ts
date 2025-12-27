import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { body, subject } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are Kairo's Neural Intelligence. 
      Summarize the following email in a warm, insightful, and supportive way.
      Focus on what the user needs to KNOW and what ACTION they might need to take.
      
      Email Subject: ${subject}
      Email Body: ${body}

      Keep the summary to 3-4 powerful sentences.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return NextResponse.json({ content: responseText });
  } catch (error) {
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}