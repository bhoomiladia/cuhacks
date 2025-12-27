import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_KEY!);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');

  if (!videoId) return NextResponse.json({ error: 'Video ID missing' }, { status: 400 });

  const RAPID_API_KEY = process.env.RAPID_API_KEY; 
  const TRANSCRIBE_KEY = process.env.TRANSCRIBE_API_KEY;

  try {
    // 1. Fetch Metadata
    const metaRes = await fetch(`https://youtube138.p.rapidapi.com/video/details/?id=${videoId}&hl=en&gl=US`, {
      headers: { 'x-rapidapi-key': RAPID_API_KEY!, 'x-rapidapi-host': 'youtube138.p.rapidapi.com' }
    });
    const metaData = await metaRes.json();

    // 2. Fetch Transcript
    const transcriptRes = await fetch("https://www.youtube-transcript.io/api/transcripts", {
      method: "POST",
      headers: { "Authorization": `Basic ${TRANSCRIBE_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [videoId] })
    });

    const transcriptData = await transcriptRes.json();
    let fullText = transcriptData[0]?.text || "";

    if (!fullText) {
      return NextResponse.json({ 
        title: metaData.title || "Unknown Video", 
        displayThumb: metaData.thumbnails?.[0]?.url,
        content: "⚠️ Transcript not available for this video." 
      });
    }

    // --- THE "TIME THING" FIX ---
    // Remove timestamps like [00:00:10] or 0:10 using RegEx to save tokens and prevent errors
    const cleanText = fullText
        .replace(/\[\d+:\d+:\d+\]/g, '') 
        .replace(/\d+:\d+/g, '')
        .substring(0, 12000); // Truncate to avoid 500 errors on massive transcripts

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Video Title: ${metaData.title}\n\nTranscript Content: ${cleanText}\n\nTask: Summarize this video. If it is a tutorial, provide a quiz. If cooking, provide a recipe. Otherwise, provide 5 key takeaways.`;

    const result = await model.generateContent(prompt);
    
    return NextResponse.json({
      videoId,
      title: metaData.title,
      displayThumb: metaData.thumbnails?.pop()?.url || metaData.thumbnails?.[0]?.url,
      content: result.response.text(),
      rawTranscript: cleanText 
    });

  } catch (error: any) {
    console.error("Route Error:", error);
    return NextResponse.json({ error: "Neural processing failed. The transcript might be too long or unavailable." }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        const { transcript, question } = await request.json();
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `Transcript: ${transcript}\n\nQuestion: ${question}\n\nAnswer the question concisely using the transcript above.`;
        const result = await model.generateContent(prompt);
        return NextResponse.json({ answer: result.response.text() });
    } catch (error: any) {
        return NextResponse.json({ error: "Follow-up failed" }, { status: 500 });
    }
}