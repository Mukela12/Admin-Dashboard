import { NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase/admin';
import { sendDriverNotification } from '@/app/lib/firebase/notifications';

export async function POST(request: Request) {
  try {
    const { applicationId, driverId, reason } = await request.json();

    if (!applicationId || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const batch = db.batch();

    // Update application status
    batch.update(db.collection('child-pickup-applications').doc(applicationId), {
      status: 'rejected',
      rejectionReason: reason,
      updatedAt: Date.now(),
    });

    // Update driver profile with rejection (matching mobile schema)
    if (driverId) {
      batch.update(db.collection('drivers').doc(driverId), {
        'driverInfo.childPickUpStatus': 'rejected',
        'driverInfo.childPickUpDenialReason': reason,
        updatedAt: Date.now(),
      });
    }

    await batch.commit();

    if (driverId) {
      await sendDriverNotification(
        driverId,
        'Child Pickup Update',
        `Your child pickup application was not approved. Reason: ${reason}`
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error denying child pickup application:', error);
    return NextResponse.json(
      { error: 'Failed to deny application' },
      { status: 500 }
    );
  }
}
