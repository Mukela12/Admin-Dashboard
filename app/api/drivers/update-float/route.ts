import { NextResponse } from 'next/server';
import { updateDriverFloat } from '@/app/lib/firebase/operations';

export async function POST(request: Request) {
  try {
    const { driverId, newBalance, previousBalance, reason } = await request.json();

    // For now, we'll use a placeholder admin ID. In production, get from auth session
    const adminId = 'admin-dashboard';

    await updateDriverFloat(driverId, newBalance, previousBalance, reason, adminId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating float:', error);
    return NextResponse.json({ error: 'Failed to update float balance' }, { status: 500 });
  }
}
