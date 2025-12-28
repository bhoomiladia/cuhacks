import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { google } from 'googleapis';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const { id } = params;
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

    await gmail.users.messages.trash({
      userId: 'me',
      id: id
    });

    return NextResponse.json({ message: 'Email moved to trash' });

  } catch (error) {
    console.error('Trash email error:', error);
    return NextResponse.json({ message: 'Failed to trash email' }, { status: 500 });
  }
}
