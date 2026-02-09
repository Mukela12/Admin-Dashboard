import { NextResponse } from 'next/server';
import { unblockDriver } from '@/app/lib/firebase/operations';

export async function POST(request: Request) {
  try {
    const { driverId } = await request.json();

    await unblockDriver(driverId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unblocking driver:', error);
    return NextResponse.json({ error: 'Failed to unblock driver' }, { status: 500 });
  }
}
