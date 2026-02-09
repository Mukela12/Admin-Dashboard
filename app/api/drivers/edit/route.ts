import { NextResponse } from 'next/server';
import { collections } from '@/app/lib/firebase/collections';

export async function POST(request: Request) {
  try {
    const { driverId, updates } = await request.json();

    if (!driverId) {
      return NextResponse.json({ error: 'Driver ID required' }, { status: 400 });
    }

    const allowedFields: Record<string, string> = {
      fullName: 'fullName',
      phoneNumber: 'phoneNumber',
      'vehicleInfo.make': 'vehicleInfo.make',
      'vehicleInfo.model': 'vehicleInfo.model',
      'vehicleInfo.color': 'vehicleInfo.color',
      'vehicleInfo.plateNumber': 'vehicleInfo.plateNumber',
      'vehicleInfo.seats': 'vehicleInfo.seats',
      'driverInfo.bookingClasses': 'driverInfo.bookingClasses',
      'driverInfo.deliveryClasses': 'driverInfo.deliveryClasses',
      'driverInfo.canDrive': 'driverInfo.canDrive',
      'driverInfo.canDeliver': 'driverInfo.canDeliver',
    };

    const sanitized: Record<string, any> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields[key]) {
        sanitized[allowedFields[key]] = value;
      }
    }

    await collections.drivers.doc(driverId).update(sanitized);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Edit driver error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update driver' }, { status: 500 });
  }
}
