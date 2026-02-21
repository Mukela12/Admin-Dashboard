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

  // Extract identity and vehicle info (matching mobile AdminService exactly)
  const identity = appData.identity || {};
  const vehicle = appData.vehicle || {};

  const promotedData = {
    avatar: identity.avatarUrl || appData.avatar || '',
    fullName: identity.fullName || appData.driverFullName || appData.fullName || '',
    profileComplete: true,
    driverInfo: {
      verificationStatus: 'verified',
      status: 'offline',
      nrcNumber: identity.nrcNumber || appData.nrc || '',
      licenseNumber: identity.licenseNumber || appData.licenseNumber || '',
      licenseExpiry: identity.licenseExpiry || appData.licenseExpiry || '',
      policeClearanceUrl: appData.policeClearanceUrl || '',
      floatBalance: 0,
      canDrive: appData.canDrive ?? appData.canDriver ?? false,
      canDeliver: appData.canDeliver ?? false,
      canAllDay: appData.canAllDay ?? false,
    },
    vehicleInfo: {
      ...vehicle,
      rideClasses,
      deliveryClasses,
    },
    updatedAt: Date.now(),
  };

  const batch = db.batch();

  batch.set(collections.drivers.doc(driverId), promotedData, { merge: true });
  batch.update(collections.driverApplications.doc(applicationId), { status: 'approved' });

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
