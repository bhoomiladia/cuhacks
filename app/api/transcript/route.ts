import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const RAPID_API_KEY = process.env.RAPID_API_KEY;
        const TRANSCRIBE_KEY = process.env.TRANSCRIBE_API_KEY;

        // 1. Fetch Video Metadata (Title & Thumbnails)
        const metaRes = await fetch(`https://youtube138.p.rapidapi.com/video/details/?id=${videoId}&hl=en&gl=US`, {
          headers: {
            'x-rapidapi-key': RAPID_API_KEY!,
            'x-rapidapi-host': 'youtube138.p.rapidapi.com'
          }
        });
        const metaData = await metaRes.json();

        // 2. Fetch Transcript
        const transcriptRes = await fetch("https://www.youtube-transcript.io/api/transcripts", {
          method: "POST",
          headers: {
            "Authorization": `Basic ${TRANSCRIBE_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ ids: [videoId] })
        });

        const transcriptData = await transcriptRes.json();
        const fullText = transcriptData[0]?.text || "";

        // Clean transcript (remove timestamps and limit length for AI context window)
        const cleanText = fullText
          .replace(/\[\d+:\d+:\d+\]/g, '')
          .substring(0, 15000);

        if (!cleanText) {
          throw new Error("No transcript available for this video.");
        }

        // 3. AI Analysis using Gemini 1.5 Flash
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `
          Analyze the following YouTube video transcript.
          Title: ${metaData.title}
          
          Provide a high-level summary, 5 key insights, and a concluding thought.
          Format the output clearly with line breaks.
          
          Transcript: ${cleanText}
        `;

        const result = await model.generateContent(prompt);
        const aiResponse = result.response.text();

        // 4. Construct Final Payload
        const payload = {
          done: true,
          data: {
            videoId,
            title: metaData.title,
            displayThumb: metaData.thumbnails?.pop()?.url || metaData.thumbnails?.[0]?.url,
            content: aiResponse,
            rawTranscript: cleanText // Sent back for the follow-up Q&A feature
          }
        };

        // Enqueue the data in SSE format
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        controller.close();

      } catch (error: any) {
        console.error("Route Error:", error);
        const errorPayload = {
          done: true,
          data: {
            title: "Analysis Failed",
            content: `Error: ${error.message || "The neural link could not be established."}`,
            displayThumb: "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?q=80&w=1000&auto=format&fit=crop"
          }
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorPayload)}\n\n`));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// Handler for the Follow-up Questions (POST)
export async function POST(request: Request) {
  try {
    const { transcript, question } = await request.json();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
      Context: ${transcript}
      Question: ${question}
      
      Answer the question based strictly on the provided transcript.
    `;

    const result = await model.generateContent(prompt);
    return NextResponse.json({ answer: result.response.text() });
  } catch (error) {
    return NextResponse.json({ error: "Follow-up failed" }, { status: 500 });
  }
}