import { NextResponse } from 'next/server';
import { collections } from '@/app/lib/firebase/collections';

export async function GET() {
  try {
    // Fetch payments
    const paymentsSnapshot = await collections.payments.orderBy('createdAt', 'desc').limit(100).get();
    const payments = paymentsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        type: 'payment' as const,
        createdAt: data.createdAt || 0,
        ...data,
      };
    });

    // Fetch float transactions
    const floatSnapshot = await collections.floatTransactions.orderBy('createdAt', 'desc').limit(100).get();
    const floatTransactions = floatSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        type: 'float' as const,
        createdAt: data.createdAt || 0,
        ...data,
      };
    });

    // Combine and sort by date
    const allTransactions = [...payments, ...floatTransactions].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    return NextResponse.json({ transactions: allTransactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}
