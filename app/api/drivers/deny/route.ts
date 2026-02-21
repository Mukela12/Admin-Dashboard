import { NextResponse } from 'next/server';
import { denyDriverApplication } from '@/app/lib/firebase/operations';
import { sendDriverNotification } from '@/app/lib/firebase/notifications';

export async function POST(request: Request) {
  try {
    const { applicationId, driverId, reason } = await request.json();

    await denyDriverApplication(applicationId, driverId, reason);

    await sendDriverNotification(
      driverId,
      'Application Update',
      `Your driver application was not approved. Reason: ${reason}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error denying driver:', error);
    return NextResponse.json({ error: 'Failed to deny driver' }, { status: 500 });
  }
}
