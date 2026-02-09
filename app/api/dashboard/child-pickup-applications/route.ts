import { NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase/admin';

function transformChildPickup(doc: FirebaseFirestore.DocumentSnapshot) {
  const data = doc.data() || {};

  return {
    id: doc.id,
    driverId: data.driverId || '',
    fullName: data.fullName || 'Unknown',
    childPickUpStatus: data.status || data.childPickUpStatus || 'pending',
    status: data.status || data.childPickUpStatus || 'pending',
    emergencyContactDetails: data.emergencyContact || data.emergencyContactDetails || null,
    policeClearanceDocument: data.policeClearanceUrl || data.policeClearanceDocument || '',
    references: data.references || [],
    safetyPolicyAccepted: data.safetyPolicyAccepted ?? false,
    rejectionReason: data.rejectionReason || '',
    updatedAt: data.updatedAt || null,
  };
}

export async function GET() {
  try {
    const snapshot = await db.collection('child-pickup-applications').get();
    const applications = snapshot.docs.map(transformChildPickup);

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Error fetching child pickup applications:', error);
    return NextResponse.json({ applications: [] });
  }
}
