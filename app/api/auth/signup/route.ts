import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { name, email, password, title, bio } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Please provide all fields' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = uuidv4();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
  name,
  email,
  password: hashedPassword,
  title: title || "Professional", // Default if empty
  bio: bio || "",                 // Default if empty
  verificationToken,
  verificationTokenExpiry,
});

    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json(
      { message: 'User registered successfully. Please check your email to verify your account.' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
