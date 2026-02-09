import { NextResponse } from 'next/server';
import { collections } from '@/app/lib/firebase/collections';
import { getAuth } from 'firebase-admin/auth';

export async function POST(request: Request) {
  try {
    const { userId, disabled, reason } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Disable in Firebase Auth
    const auth = getAuth();
    await auth.updateUser(userId, { disabled: !!disabled });

    // Update user record in Firestore
    await collections.users.doc(userId).update({
      isDisabled: !!disabled,
      disableReason: disabled ? (reason || 'Disabled by admin') : null,
      disabledAt: disabled ? Date.now() : null,
      updatedAt: Date.now(),
    });

    return NextResponse.json({ success: true, disabled: !!disabled });
  } catch (error: any) {
    console.error('Disable user error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update user status' }, { status: 500 });
  }
}
