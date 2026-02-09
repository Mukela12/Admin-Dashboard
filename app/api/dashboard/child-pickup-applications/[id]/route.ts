import { NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase/admin';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: applicationId } = await params;

    const applicationDoc = await db.collection('child-pickup-applications').doc(applicationId).get();

    if (!applicationDoc.exists) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const application = {
      id: applicationDoc.id,
      ...applicationDoc.data()
    };

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Error fetching child pickup application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}
