import { NextResponse } from 'next/server';
import { collections } from '@/app/lib/firebase/collections';

export async function POST(request: Request) {
  try {
    const { bookingId, reason } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }

    const bookingRef = collections.bookings.doc(bookingId);
    const doc = await bookingRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const data = doc.data();
    if (data?.status === 'completed' || data?.status === 'cancelled') {
      return NextResponse.json({ error: `Cannot cancel a ${data.status} booking` }, { status: 400 });
    }

    await bookingRef.update({
      status: 'cancelled',
      cancelledBy: 'admin',
      cancellationReason: reason || 'Cancelled by admin',
      cancelledAt: Date.now(),
      updatedAt: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Cancel booking error:', error);
    return NextResponse.json({ error: error.message || 'Failed to cancel booking' }, { status: 500 });
  }
}
