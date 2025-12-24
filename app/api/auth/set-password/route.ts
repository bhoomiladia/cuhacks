import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
interface DecodedToken {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json(
        { message: 'Password is required' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    
    // Type guard to check if decoded is valid and has userId
    if (!decoded || typeof decoded === 'string' || !('userId' in decoded)) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }
    const tokenPayload = decoded as DecodedToken;
    const userId = tokenPayload.userId;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.findByIdAndUpdate(decoded.userId, {
      password: hashedPassword,
      // We don't change authProvider because they might still use Google,
      // but now they have a password too.
    });

    return NextResponse.json(
      { message: 'Password set successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
