import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');

  if (!videoId) return NextResponse.json({ error: 'No ID' }, { status: 400 });

  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': '73ef686613msh2ff1e55048b8225p11f55ajsn1079cf692a33',
      'x-rapidapi-host': 'youtube138.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(`https://youtube138.p.rapidapi.com/video/details/?id=${videoId}&hl=en&gl=US`, options);
    const data = await response.json();
    
    // We send the whole data object to the frontend
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch YouTube data" }, { status: 500 });
  }
}