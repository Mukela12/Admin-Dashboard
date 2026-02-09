import { collections } from './collections';

export async function approveDriverApplication(
  applicationId: string,
  driverId: string,
  bookingClass: string[],
  deliveryClass: string[]
) {
  // Update application status
  await collections.driverApplications.doc(applicationId).update({
    driverVerificationStatus: 'approved',
    updatedAt: Date.now(),
  });

  // Update driver profile
  await collections.drivers.doc(driverId).update({
    'driverInfo.verificationStatus': 'approved',
    'driverInfo.bookingClasses': bookingClass,
    'driverInfo.deliveryClasses': deliveryClass,
    updatedAt: Date.now(),
  });
}

export async function denyDriverApplication(
  applicationId: string,
  driverId: string,
  reason: string
) {
  await collections.driverApplications.doc(applicationId).update({
    driverVerificationStatus: 'denied',
    reason,
    updatedAt: Date.now(),
  });

  await collections.drivers.doc(driverId).update({
    'driverInfo.verificationStatus': 'denied',
    updatedAt: Date.now(),
  });
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
