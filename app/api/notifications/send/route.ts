import { NextResponse } from 'next/server';
import { getMessaging } from 'firebase-admin/messaging';
import { collections } from '@/app/lib/firebase/collections';

export async function POST(request: Request) {
  try {
    const { title, body, audience } = await request.json();

    // Get FCM tokens based on audience
    let tokensSnapshot;
    let allDocs: any[] = [];

    if (audience === 'drivers') {
      tokensSnapshot = await collections.drivers
        .where('fcmToken', '!=', null)
        .get();
      allDocs = tokensSnapshot.docs;
    } else if (audience === 'users') {
      tokensSnapshot = await collections.users
        .where('fcmToken', '!=', null)
        .get();
      allDocs = tokensSnapshot.docs;
    } else {
      // Get all tokens (drivers + users)
      const [driversSnap, usersSnap] = await Promise.all([
        collections.drivers.where('fcmToken', '!=', null).get(),
        collections.users.where('fcmToken', '!=', null).get(),
      ]);
      allDocs = [...driversSnap.docs, ...usersSnap.docs];
    }

    const tokens = allDocs
      .map(doc => doc.data().fcmToken)
      .filter(token => token && typeof token === 'string');

    if (tokens.length === 0) {
      return NextResponse.json({ error: 'No FCM tokens found' }, { status: 400 });
    }

    // Send multicast message (FCM limit is 500 tokens per batch)
    const message = {
      notification: { title, body },
      tokens: tokens.slice(0, 500),
    };

    const messaging = getMessaging();
    const response = await messaging.sendEachForMulticast(message);

    // Store notification in database
    await collections.notifications.add({
      title,
      body,
      audience,
      targeted: tokens.length,
      delivered: response.successCount,
      failed: response.failureCount,
      sentAt: Date.now(),
    });

    return NextResponse.json({
      success: true,
      targeted: tokens.length,
      delivered: response.successCount,
      failed: response.failureCount,
    });
  } catch (error: any) {
    console.error('Notification error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send notification' }, { status: 500 });
  }
}
