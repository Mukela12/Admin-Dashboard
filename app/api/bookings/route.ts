import { NextResponse } from 'next/server';
import { collections } from '@/app/lib/firebase/collections';

export async function GET() {
  try {
    const snapshot = await collections.bookings.orderBy('createdAt', 'desc').limit(200).get();
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}
