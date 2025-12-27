import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { imageUrl } = await req.json();
    
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const decoded: any = verifyToken(token!);

    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      { avatar: imageUrl },
      { new: true }
    );

    return NextResponse.json({ avatar: updatedUser.avatar });
  } catch (error) {
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}