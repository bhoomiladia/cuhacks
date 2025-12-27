import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  
  // Clear the token cookie
  cookieStore.set('token', '', {
    httpOnly: true,
    expires: new Date(0), // Set expiry to the past
    path: '/',
  });

  return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
}