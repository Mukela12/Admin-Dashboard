import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { collections } from '@/app/lib/firebase/collections';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // For admin login, we'll use a simple email/password check
    // In production, you should use Firebase Auth properly or implement your own secure system

    // For now, let's check if this is an admin user
    // You can store admin credentials in Firestore or environment variables

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@banturide.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'; // Change this!

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Generate a simple token (in production, use JWT or Firebase Custom Tokens)
      const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');

      return NextResponse.json({
        success: true,
        token,
        message: 'Login successful',
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
