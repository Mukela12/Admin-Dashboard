import { NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase/admin';

export async function GET() {
  try {
    // Read from Enos's config/pricing collection
    const doc = await db.collection('config').doc('pricing').get();
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

    // Write to config/pricing to stay in sync with mobile
    await db.collection('config').doc('pricing').set(config);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: error.message || 'Failed to save settings' }, { status: 500 });
  }
}
