import { NextResponse } from 'next/server';
import { approveDriverApplication } from '@/app/lib/firebase/operations';
import { sendDriverNotification } from '@/app/lib/firebase/notifications';

export async function POST(request: Request) {
  try {
    const { applicationId, driverId, rideClasses, deliveryClasses } = await request.json();

    await approveDriverApplication(applicationId, driverId, rideClasses, deliveryClasses);

    await sendDriverNotification(
      driverId,
      'Application Approved',
      'Your driver application has been approved! You can now start accepting rides.'
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error approving driver:', error);
    return NextResponse.json({ error: 'Failed to approve driver' }, { status: 500 });
  }
}
