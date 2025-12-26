import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ isConnected: false }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ isConnected: false }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(decoded.userId).select('gmailAccessToken gmailEmail');

    if (!user || !user.gmailAccessToken) {
      return NextResponse.json({ isConnected: false });
    }

    return NextResponse.json({ 
        isConnected: true,
        email: user.gmailEmail 
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({ isConnected: false }, { status: 500 });
  }
}
