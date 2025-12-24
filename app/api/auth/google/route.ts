import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { accessToken } = await req.json();

    if (!accessToken) {
      return NextResponse.json(
        { message: 'No access token provided' },
        { status: 400 }
      );
    }

    // Verify Access Token and get User Info
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userInfoRes.ok) {
      return NextResponse.json(
        { message: 'Invalid Google token' },
        { status: 401 }
      );
    }

    const payload = await userInfoRes.json();
    const { email, name, sub: googleId } = payload;

    if (!email) {
      return NextResponse.json(
        { message: 'Email not provided in Google token' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // User exists
      // If user was created with email/password, we might want to link googleId
      // But prompt says "If the user ALREADY EXISTS → log them in directly"
      // We will update googleId if not present, just to be safe and cleaner for future
      if (!user.googleId) {
        user.googleId = googleId;
        // If authProvider is 'email', we might keep it or change to 'google'?
        // The prompt says "Google-auth users should be marked as authProvider = 'google'"
        // But for existing users, changing it might be risky if they try to login with password later?
        // Let's assume new users get 'google', existing users keep their provider but get googleId linked.
        // However, prompt says "No password should be required for Google-auth users".
        // If existing user has password, they can still use it.
        // If they login with Google, we just log them in.
        
        // Let's just save googleId if missing.
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        authProvider: 'google',
        googleId,
        isVerified: true, // Email verification NOT required
      });
    }

    // Generate Session
    const token = signToken({ userId: user._id, role: user.role });

    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return NextResponse.json(
      { 
        message: 'Login successful', 
        user: { 
          name: user.name, 
          email: user.email, 
          role: user.role,
          authProvider: user.authProvider
        },
        hasPassword: !!user.password
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Google Auth Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
