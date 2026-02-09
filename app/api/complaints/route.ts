import { NextResponse } from 'next/server';
import { collections } from '@/app/lib/firebase/collections';

export async function GET() {
  try {
    const snapshot = await collections.complaints.orderBy('createdAt', 'desc').get();
    const complaints = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ complaints });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 });
  }
}
