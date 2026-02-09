import { NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase/admin';

const SETTINGS_DOC = 'platform-config';

export async function GET() {
  try {
    const doc = await db.collection('settings').doc(SETTINGS_DOC).get();
    return NextResponse.json({ config: doc.exists ? doc.data() : null });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ config: null });
  }
}

export async function POST(request: Request) {
  try {
    const { config } = await request.json();

    if (!config) {
      return NextResponse.json({ error: 'Config required' }, { status: 400 });
    }

    await db.collection('settings').doc(SETTINGS_DOC).set({
      ...config,
      updatedAt: Date.now(),
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: error.message || 'Failed to save settings' }, { status: 500 });
  }
}
