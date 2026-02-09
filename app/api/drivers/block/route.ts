import { NextResponse } from 'next/server';
import { blockDriver } from '@/app/lib/firebase/operations';

export async function POST(request: Request) {
  try {
    const { driverId, reason } = await request.json();

    await blockDriver(driverId, reason);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error blocking driver:', error);
    return NextResponse.json({ error: 'Failed to block driver' }, { status: 500 });
  }
}
