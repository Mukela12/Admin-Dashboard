import { NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase/admin';
import { sendDriverNotification } from '@/app/lib/firebase/notifications';

export async function POST(request: Request) {
  try {
    const { applicationId, driverId } = await request.json();

    if (!applicationId || !driverId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const batch = db.batch();

    // Update application status
    batch.update(db.collection('child-pickup-applications').doc(applicationId), {
      status: 'approved',
      updatedAt: Date.now(),
    });

    // Update driver profile with child pickup verification (matching mobile schema)
    batch.update(db.collection('drivers').doc(driverId), {
      'driverInfo.childPickUpStatus': 'verified',
      'driverInfo.childPickUpDenialReason': null,
      updatedAt: Date.now(),
    });

    await batch.commit();

    await sendDriverNotification(
      driverId,
      'Child Pickup Approved',
      'Your child pickup application has been approved!'
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error approving child pickup application:', error);
    return NextResponse.json(
      { error: 'Failed to approve application' },
      { status: 500 }
    );
  }
}
