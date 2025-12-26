import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { google } from 'googleapis';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const label = searchParams.get('label') || 'INBOX';

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(decoded.userId).select('gmailAccessToken gmailRefreshToken');

    if (!user || !user.gmailAccessToken) {
      return NextResponse.json({ message: 'Gmail account not connected' }, { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: user.gmailAccessToken,
      refresh_token: user.gmailRefreshToken
    });

    // Automatically handle token refresh
    oauth2Client.on('tokens', async (tokens) => {
        if (tokens.access_token) {
            await User.findByIdAndUpdate(decoded.userId, {
                gmailAccessToken: tokens.access_token,
                ...(tokens.refresh_token && { gmailRefreshToken: tokens.refresh_token })
            });
        }
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Fetch list of messages
    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 20,
      labelIds: [label]
    });

    const messages = listResponse.data.messages || [];

    // Fetch details for each message
    const emailPromises = messages.map(async (msg) => {
      const msgDetails = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
        format: 'full'
      });

      const payload = msgDetails.data.payload;
      const headers = payload?.headers;

      const subject = headers?.find(h => h.name === 'Subject')?.value || '(No Subject)';
      const from = headers?.find(h => h.name === 'From')?.value || 'Unknown';
      
      // Basic body extraction (snippet is safer/faster for list view)
      const snippet = msgDetails.data.snippet;

      // Extract body (prefer html, fallback to plain)
      // This is a simplified extraction. Real-world email parsing is complex.
      // For now, we'll rely on snippet for the list and maybe try to get body for detail view.
      // But the frontend expects 'body' field.
      
      let body = snippet; 
      // Helper to decode base64url
      const decode = (str: string) => Buffer.from(str, 'base64').toString('utf-8');
      
      if (payload?.body?.data) {
          body = decode(payload.body.data);
      } else if (payload?.parts) {
          // Try to find text/html or text/plain
          const part = payload.parts.find(p => p.mimeType === 'text/html') || payload.parts.find(p => p.mimeType === 'text/plain');
          if (part?.body?.data) {
              body = decode(part.body.data);
          }
      }

      return {
        id: msg.id,
        sender: from, // simplified
        subject: subject,
        preview: snippet,
        time: new Date(parseInt(msgDetails.data.internalDate || '0')).toLocaleString(),
        unread: msgDetails.data.labelIds?.includes('UNREAD'),
        body: body 
      };
    });

    const emails = await Promise.all(emailPromises);

    return NextResponse.json(emails);

  } catch (error) {
    console.error('Fetch emails error:', error);
    return NextResponse.json({ message: 'Failed to fetch emails' }, { status: 500 });
  }
}
