import { NextResponse } from 'next/server';
import { collections } from '@/app/lib/firebase/collections';

function transformApplication(doc: FirebaseFirestore.DocumentSnapshot) {
  const data = doc.data() || {};

  // Handle both flat legacy format and nested Firebase format
  return {
    id: doc.id,
    driverId: data.uid || data.driverId || doc.id,
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

export async function GET() {
  try {
    const snapshot = await collections.driverApplications.get();
    const applications = snapshot.docs.map(transformApplication);

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Error fetching driver applications:', error);
    return NextResponse.json({ applications: [] });
  }
}
