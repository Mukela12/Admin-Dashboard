import { NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const { applicationId, reason } = await request.json();

    if (!applicationId || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update application status
    await db.collection('child-pickup-applications').doc(applicationId).update({
      status: 'denied',
      reason,
      updatedAt: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error denying child pickup application:', error);
    return NextResponse.json(
      { error: 'Failed to deny application' },
      { status: 500 }
    );
  }
}
