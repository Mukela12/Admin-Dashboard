import { NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase/admin';

function transformApplication(id: string, data: Record<string, any>) {
  return {
    id,
    driverId: data.uid || data.driverId || id,
    driverFullName: data.identity?.fullName || data.driverFullName || data.fullName || 'Unknown',
    driverPhoneNumber: data.identity?.phoneNumber || data.driverPhoneNumber || null,
    driverRating: data.ratings?.average || data.driverRating || null,
    driverStatus: data.driverStatus || null,
    avatar: data.identity?.avatarUrl || data.avatar || '',
    insuranceCertificate: data.vehicle?.insuranceCertificateUrl || data.insuranceCertificate || '',
    driversLicenseImage: data.identity?.licenseImageUrl || data.driversLicenseImage || '',
    seats: data.vehicle?.seats || data.seats || '',
    vehicleImage1: data.vehicle?.exteriorImageUrl || data.vehicleImage1 || '',
    vehicleImage2: data.vehicle?.interiorImageUrl || data.vehicleImage2 || '',
    canDriver: data.canDrive ?? data.canDriver ?? false,
    canDeliver: data.canDeliver ?? false,
    carColor: data.vehicle?.color || data.carColor || '',
    licenseExpiry: data.identity?.licenseExpiry || data.licenseExpiry || '',
    licenseNumber: data.identity?.licenseNumber || data.licenseNumber || '',
    vehicleReg: data.vehicle?.plateNumber || data.vehicleReg || '',
    carMake: data.vehicle?.make || data.carMake || '',
    carModel: data.vehicle?.model || data.carModel || '',
    nrc: data.identity?.nrc || data.nrc || '',
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
    reason: data.reason || data.rejectionReason || '',
    driverVerificationStatus: data.status || data.driverVerificationStatus || 'pending',
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: applicationId } = await params;
    const applicationDoc = await db.collection('driver-applications').doc(applicationId).get();

    if (!applicationDoc.exists) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const application = transformApplication(applicationDoc.id, applicationDoc.data() || {});
    return NextResponse.json({ application });
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json({ error: 'Failed to fetch application' }, { status: 500 });
  }
}
