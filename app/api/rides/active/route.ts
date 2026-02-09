import { NextResponse } from 'next/server';
import { collections } from '@/app/lib/firebase/collections';

export async function GET() {
  try {
    // Fetch bookings with active statuses
    const activeStatuses = ['confirmed', 'arrived', 'in_progress'];

    const results = await Promise.all(
      activeStatuses.map(status =>
        collections.bookings.where('status', '==', status).get()
      )
    );

    const bookings = results.flatMap(snapshot =>
      snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          status: data.status || 'pending',
          bookingType: data.bookingType || 'ride',
          bookingClass: data.bookingClass || '',
          origin: data.origin || null,
          destination: data.destination || null,
          stops: data.stops || [],
          passengerInfo: data.passengerInfo || null,
          confirmedDriver: data.confirmedDriver || null,
          driverId: data.confirmedDriver?.uid || data.driverId || null,
          price: data.price || 0,
          distance: data.distance || '',
          duration: data.duration || '',
          paymentMethod: data.paymentMethod || '',
          createdAt: data.createdAt || 0,
          updatedAt: data.updatedAt || 0,
        };
      })
    );

    // Collect unique driver IDs to fetch their live locations
    const driverIds = [...new Set(
      bookings.map(b => b.driverId).filter(Boolean)
    )] as string[];

    // Fetch driver locations in parallel
    const driverLocations: Record<string, any> = {};

    if (driverIds.length > 0) {
      // Firestore `in` queries max 30 items, so batch
      const batches = [];
      for (let i = 0; i < driverIds.length; i += 30) {
        batches.push(driverIds.slice(i, i + 30));
      }

      const locationResults = await Promise.all(
        batches.map(batch =>
          collections.drivers.where('uid', 'in', batch).get()
        )
      );

      locationResults.flatMap(snap => snap.docs).forEach(doc => {
        const data = doc.data();
        if (data.lastLocation) {
          driverLocations[data.uid || doc.id] = {
            latitude: data.lastLocation.latitude,
            longitude: data.lastLocation.longitude,
            heading: data.lastLocation.heading || 0,
            updatedAt: data.lastLocation.updatedAt || 0,
          };
        }
      });
    }

    // Merge driver locations into bookings
    const enrichedBookings = bookings.map(booking => ({
      ...booking,
      driverLocation: booking.driverId ? (driverLocations[booking.driverId] || null) : null,
    }));

    return NextResponse.json({
      rides: enrichedBookings,
      count: enrichedBookings.length,
    });
  } catch (error) {
    console.error('Error fetching active rides:', error);
    return NextResponse.json({ error: 'Failed to fetch active rides' }, { status: 500 });
  }
}
