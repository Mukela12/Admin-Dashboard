import { getMessaging } from 'firebase-admin/messaging';
import { collections } from './collections';

export async function sendDriverNotification(
  driverId: string,
  title: string,
  body: string
) {
  try {
    // Read driver doc to get FCM token
    const driverDoc = await collections.drivers.doc(driverId).get();
    const driverData = driverDoc.data();
    const fcmToken = driverData?.fcmToken;

    // Log notification to Firestore regardless of FCM delivery
    await collections.notifications.add({
      userId: driverId,
      title,
      body,
      type: 'driver_application',
      read: false,
      createdAt: Date.now(),
    });

    // Send FCM push if token exists
    if (fcmToken) {
      await getMessaging().send({
        token: fcmToken,
        notification: { title, body },
        data: { type: 'driver_application', driverId },
      });
    }
  } catch (error) {
    // Never throw — approval/rejection should succeed even if notification fails
    console.error('Failed to send notification:', error);
  }
}
