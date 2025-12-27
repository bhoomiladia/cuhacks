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
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    // Added 'title' and 'createdAt' to the select query
    const user = await User.findById(decoded.userId).select('name email title createdAt');

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // --- REAL UPTIME CALCULATION ---
    const joinedDate = new Date(user.createdAt);
    const now = new Date();
    const diffInMs = now.getTime() - joinedDate.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    return NextResponse.json(
      {
        name: user.name,
        email: user.email,
        title: user.title || "Professional",
        uptime: `${diffInHours} Hours`
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}