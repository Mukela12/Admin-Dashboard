import { getMessaging } from 'firebase-admin/messaging';
import { collections } from './collections';

async function sendExpoPush(token: string, title: string, body: string, data: Record<string, string>) {
  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      to: token,
      title,
      body,
      data,
      sound: 'default',
    }),
  });

  const result = await res.json();
  if (result.data?.status === 'error') {
    console.error('Expo push error:', result.data.message);
  }
}

async function sendFCMPush(token: string, title: string, body: string, data: Record<string, string>) {
  await getMessaging().send({
    token,
    notification: { title, body },
    data,
  });
}

export async function sendDriverNotification(
  driverId: string,
  title: string,
  body: string
) {
  try {
    const driverDoc = await collections.drivers.doc(driverId).get();
    const driverData = driverDoc.data();
    const pushToken = driverData?.fcmToken;

    // Log notification to Firestore regardless of push delivery
    await collections.notifications.add({
      userId: driverId,
      title,
      body,
      type: 'driver_application',
      read: false,
      createdAt: Date.now(),
    });

    if (pushToken) {
      const data = { type: 'driver_application', driverId };

      if (pushToken.startsWith('ExponentPushToken[')) {
        await sendExpoPush(pushToken, title, body, data);
      } else {
        await sendFCMPush(pushToken, title, body, data);
      }
    }
  } catch (error) {
    // Never throw — approval/rejection should succeed even if notification fails
    console.error('Failed to send notification:', error);
  }
}
