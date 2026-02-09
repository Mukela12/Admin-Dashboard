import { NextResponse } from 'next/server';
import { collections } from '@/app/lib/firebase/collections';

export async function GET() {
  try {
    const snapshot = await collections.drivers.orderBy('createdAt', 'desc').get();
    const drivers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ drivers });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return NextResponse.json({ error: 'Failed to fetch drivers' }, { status: 500 });
  }
}
