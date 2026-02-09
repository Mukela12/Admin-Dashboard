import { NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const { applicationId, driverId } = await request.json();

    if (!applicationId || !driverId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update application status
    await db.collection('child-pickup-applications').doc(applicationId).update({
      status: 'approved',
      updatedAt: Date.now(),
    });

    // Update driver profile to add child pickup capability
    await db.collection('drivers').doc(driverId).update({
      'driverInfo.canPickupChildren': true,
      updatedAt: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error approving child pickup application:', error);
    return NextResponse.json(
      { error: 'Failed to approve application' },
      { status: 500 }
    );
  }
}
