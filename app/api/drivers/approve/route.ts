import { NextResponse } from 'next/server';
import { approveDriverApplication } from '@/app/lib/firebase/operations';

export async function POST(request: Request) {
  try {
    const { applicationId, driverId, bookingClass, deliveryClass } = await request.json();

    await approveDriverApplication(applicationId, driverId, bookingClass, deliveryClass);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error approving driver:', error);
    return NextResponse.json({ error: 'Failed to approve driver' }, { status: 500 });
  }
}
