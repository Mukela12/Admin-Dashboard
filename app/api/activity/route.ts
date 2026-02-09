import { NextResponse } from 'next/server';
import { collections } from '@/app/lib/firebase/collections';

export async function GET() {
  try {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    // Fetch recent complaints, bookings, and transactions in parallel
    const [complaintsSnap, bookingsSnap, transactionsSnap] = await Promise.all([
      collections.complaints.orderBy('createdAt', 'desc').limit(20).get(),
      collections.bookings.orderBy('createdAt', 'desc').limit(20).get(),
      collections.floatTransactions.orderBy('createdAt', 'desc').limit(20).get(),
    ]);

    const complaints = complaintsSnap.docs.map(doc => {
      const data = doc.data();
      const ts = typeof data.createdAt === 'number'
        ? data.createdAt
        : data.createdAt?._seconds ? data.createdAt._seconds * 1000 : 0;
      return {
        id: doc.id,
        type: 'complaint' as const,
        title: `Complaint from ${data.complainer || 'Unknown'}`,
        description: (data.complaint || '').slice(0, 80),
        status: data.status || 'pending',
        timestamp: ts,
        href: '/dashboard/complaints',
      };
    });

    const rides = bookingsSnap.docs.map(doc => {
      const data = doc.data();
      const ts = typeof data.createdAt === 'number'
        ? data.createdAt
        : data.createdAt?._seconds ? data.createdAt._seconds * 1000 : 0;
      return {
        id: doc.id,
        type: 'ride' as const,
        title: `${data.bookingType || 'Ride'} - ${data.passengerInfo?.fullName || 'Unknown'}`,
        description: `${data.status || 'pending'} - K${(data.price || 0).toFixed(0)}`,
        status: data.status || 'pending',
        timestamp: ts,
        href: '/dashboard/trips',
      };
    });

    const transactions = transactionsSnap.docs.map(doc => {
      const data = doc.data();
      const ts = typeof data.createdAt === 'number'
        ? data.createdAt
        : data.createdAt?._seconds ? data.createdAt._seconds * 1000 : 0;
      return {
        id: doc.id,
        type: 'transaction' as const,
        title: `${data.type || 'Transaction'} - K${(data.amount || 0).toFixed(0)}`,
        description: data.driverName || data.description || 'Float transaction',
        status: data.status || 'completed',
        timestamp: ts,
        href: '/dashboard/transactions',
      };
    });

    // Counts for badge
    const unresolvedComplaints = complaints.filter(c => c.status !== 'resolved').length;
    const activeRides = rides.filter(r =>
      ['confirmed', 'arrived', 'in_progress'].includes(r.status)
    ).length;
    const recentTransactions = transactions.filter(t => t.timestamp > oneDayAgo).length;

    return NextResponse.json({
      items: [...complaints, ...rides, ...transactions]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 30),
      counts: {
        complaints: unresolvedComplaints,
        rides: activeRides,
        transactions: recentTransactions,
        total: unresolvedComplaints + activeRides,
      },
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
  }
}
