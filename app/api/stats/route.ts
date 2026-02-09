import { NextResponse } from 'next/server';
import { collections } from '@/app/lib/firebase/collections';

export async function GET() {
  try {
    // Fetch all data in parallel
    const [bookingsSnap, driversSnap, usersSnap, complaintsSnap] = await Promise.all([
      collections.bookings.get(),
      collections.drivers.get(),
      collections.users.get(),
      collections.complaints.get(),
    ]);

    const bookings = bookingsSnap.docs.map(doc => doc.data());
    const drivers = driversSnap.docs.map(doc => doc.data());
    const users = usersSnap.docs.map(doc => doc.data());
    const complaints = complaintsSnap.docs.map(doc => doc.data());

    // Calculate statistics
    const stats = {
      totalTrips: bookings.length,
      currentTrips: bookings.filter(b =>
        ['confirmed', 'arrived', 'in_progress'].includes(b.status)
      ).length,
      completedTrips: bookings.filter(b => b.status === 'completed').length,
      totalDrivers: drivers.length,
      activeDrivers: drivers.filter(d =>
        !d.isBlocked && d.driverInfo?.verificationStatus === 'approved'
      ).length,
      blockedDrivers: drivers.filter(d => d.isBlocked).length,
      totalUsers: users.length,
      totalRevenue: bookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.price || 0), 0),
      totalFloat: drivers.reduce((sum, d) => sum + (d.driverInfo?.floatBalance || 0), 0),
      openComplaints: complaints.filter(c => c.status !== 'resolved').length,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}
