import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { google } from 'googleapis';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/emails?error=access_denied', request.url));
  }

  if (!code) {
     return NextResponse.redirect(new URL('/emails?error=no_code', request.url));
  }

  try {
     const cookieStore = await cookies();
     const token = cookieStore.get('token')?.value;

     if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
     }
     
     const decoded: any = verifyToken(token);
     if (!decoded || !decoded.userId) {
        return NextResponse.redirect(new URL('/login', request.url));
     }

    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '');
    const redirectUri = `${baseUrl}/api/gmail/callback`;

    const oauth2Client = new google.auth.OAuth2(
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    // Get user email to verify/store
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    await dbConnect();
    
    // Update fields. If refresh_token is present, update it.
    const updateData: any = {
        gmailAccessToken: tokens.access_token,
        gmailEmail: userInfo.data.email
    };

    if (tokens.refresh_token) {
        updateData.gmailRefreshToken = tokens.refresh_token;
    }

    await User.findByIdAndUpdate(decoded.userId, updateData);

    return NextResponse.redirect(new URL('/emails?success=true', request.url));

  } catch (error) {
    console.error('Gmail OAuth error:', error);
    return NextResponse.redirect(new URL('/emails?error=server_error', request.url));
  }
}
