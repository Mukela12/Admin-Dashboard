import { NextResponse } from 'next/server';
import { collections } from '@/app/lib/firebase/collections';

export async function POST(request: Request) {
  try {
    const { complaintId, resolution } = await request.json();

    await collections.complaints.doc(complaintId).update({
      status: 'resolved',
      resolution,
      resolvedAt: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resolving complaint:', error);
    return NextResponse.json({ error: 'Failed to resolve complaint' }, { status: 500 });
  }
}
