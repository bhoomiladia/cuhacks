import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');

  if (!videoId) return NextResponse.json({ error: 'Video ID missing' }, { status: 400 });

  const RAPID_API_KEY = process.env.RAPID_API_KEY; 
  const TRANSCRIBE_KEY = process.env.TRANSCRIBE_API_KEY;
  const GEMINI_KEY = process.env.GEMINI_API_KEY;

  try {
    // 1. Fetch Metadata (RapidAPI)
    const metaRes = await fetch(`https://youtube138.p.rapidapi.com/video/details/?id=${videoId}&hl=en&gl=US`, {
      headers: { 'x-rapidapi-key': RAPID_API_KEY!, 'x-rapidapi-host': 'youtube138.p.rapidapi.com' },
      next: { revalidate: 3600 } // Cache results for 1 hour
    });
    
    if (!metaRes.ok) throw new Error(`RapidAPI Error: ${metaRes.status}`);
    const metaData = await metaRes.json();

    // 2. Fetch Transcript
    const transcriptRes = await fetch("https://www.youtube-transcript.io/api/transcripts", {
      method: "POST",
      headers: { "Authorization": `Basic ${TRANSCRIBE_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [videoId] })
    });

    if (!transcriptRes.ok) throw new Error(`Transcript API Error: ${transcriptRes.status}`);
    const transcriptData = await transcriptRes.json();
    
    // Check if transcript actually exists in the response
    const fullText = transcriptData[0]?.text;
    if (!fullText) {
      return NextResponse.json({ 
        title: metaData.title, 
        thumbnails: metaData.thumbnails, 
        content: "⚠️ Sorry, transcript not available for this video. Gemini cannot summarize without text." 
      });
    }

    // 3. Gemini Generation
    const genAI = new GoogleGenerativeAI(GEMINI_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Video Title: ${metaData.title}\nTranscript: ${fullText}\n\nInstructions: Provide an educational quiz if tutorial, a recipe if cooking, or a standard summary with takeaways.`;

    const result = await model.generateContent(prompt);
    const aiOutput = result.response.text();

    return NextResponse.json({
      title: metaData.title,
      thumbnails: metaData.thumbnails,
      content: aiOutput
    });

  } catch (error: any) {
    console.error("❌ API Route Error:", error.message);
    return NextResponse.json({ error: error.message || "Failed to process" }, { status: 500 });
  }
}