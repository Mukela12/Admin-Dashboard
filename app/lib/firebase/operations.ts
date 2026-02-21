import { collections } from './collections';
import { db } from './admin';

export async function approveDriverApplication(
  applicationId: string,
  driverId: string,
  rideClasses: string[],
  deliveryClasses: string[]
) {
  // Read application to get identity/vehicle data for copying to driver doc
  const appDoc = await collections.driverApplications.doc(applicationId).get();
  const appData = appDoc.data() || {};

  // Extract identity and vehicle info (handle both nested and flat formats)
  const identity = appData.identity || {};
  const vehicle = appData.vehicle || {};

  const fullName = identity.fullName || appData.driverFullName || appData.fullName || '';
  const avatar = identity.avatarUrl || appData.avatar || '';
  const nrcNumber = identity.nrc || appData.nrc || '';
  const licenseNumber = identity.licenseNumber || appData.licenseNumber || '';
  const licenseExpiry = identity.licenseExpiry || appData.licenseExpiry || '';
  const policeClearanceUrl = identity.policeClearanceUrl || appData.policeClearanceUrl || '';
  const canDrive = appData.canDrive ?? appData.canDriver ?? false;
  const canDeliver = appData.canDeliver ?? false;
  const canAllDay = appData.canAllDay ?? false;

  const vehicleInfo = {
    make: vehicle.make || appData.carMake || '',
    model: vehicle.model || appData.carModel || '',
    color: vehicle.color || appData.carColor || '',
    plateNumber: vehicle.plateNumber || appData.vehicleReg || '',
    seats: vehicle.seats || appData.seats || '',
    insuranceCertificateUrl: vehicle.insuranceCertificateUrl || appData.insuranceCertificate || '',
    exteriorImageUrl: vehicle.exteriorImageUrl || appData.vehicleImage1 || '',
    interiorImageUrl: vehicle.interiorImageUrl || appData.vehicleImage2 || '',
    rideClasses,
    deliveryClasses,
  };

  const batch = db.batch();

  // Update application status
  batch.update(collections.driverApplications.doc(applicationId), {
    status: 'approved',
    updatedAt: Date.now(),
  });

  // Update driver profile with promoted data (matching mobile AdminService)
  batch.set(collections.drivers.doc(driverId), {
    avatar,
    fullName,
    profileComplete: true,
    driverInfo: {
      verificationStatus: 'verified',
      status: 'offline',
      nrcNumber,
      licenseNumber,
      licenseExpiry,
      policeClearanceUrl,
      floatBalance: 0,
      canDrive,
      canDeliver,
      canAllDay,
    },
    vehicleInfo,
    updatedAt: Date.now(),
  }, { merge: true });

  await batch.commit();
}

export async function denyDriverApplication(
  applicationId: string,
  driverId: string,
  reason: string
) {
  const batch = db.batch();

  batch.update(collections.driverApplications.doc(applicationId), {
    status: 'rejected',
    rejectionReason: reason,
    updatedAt: Date.now(),
  });

  batch.update(collections.drivers.doc(driverId), {
    'driverInfo.verificationStatus': 'rejected',
    'driverInfo.rejectionReason': reason,
    updatedAt: Date.now(),
  });

  await batch.commit();
}

// Driver Management Operations
export async function blockDriver(driverId: string, reason: string) {
  await collections.drivers.doc(driverId).update({
    isBlocked: true,
    blockReason: reason,
    blockedAt: Date.now(),
    updatedAt: Date.now(),
  });
}

export async function unblockDriver(driverId: string) {
  await collections.drivers.doc(driverId).update({
    isBlocked: false,
    blockReason: null,
    blockedAt: null,
    updatedAt: Date.now(),
  });
}

export async function updateDriverFloat(
  driverId: string,
  newBalance: number,
  previousBalance: number,
  reason: string,
  adminId: string
) {
  const difference = newBalance - previousBalance;

  // Update driver's float balance
  await collections.drivers.doc(driverId).update({
    'driverInfo.floatBalance': newBalance,
    updatedAt: Date.now(),
  });

  // Create float transaction record
  await collections.floatTransactions.add({
    transactionId: `TXN-ADMIN-${Date.now()}`,
    driverId,
    type: difference > 0 ? 'reward' : 'adjustment',
    amount: 0, // No money involved, admin adjustment
    floatPoints: Math.abs(difference),
    previousBalance,
    newBalance,
    description: difference > 0 ? 'Admin float reward' : 'Admin float adjustment',
    reason: { adminId, notes: reason },
    status: 'completed',
    createdAt: Date.now(),
    completedAt: Date.now(),
    updatedAt: Date.now(),
  });
}
