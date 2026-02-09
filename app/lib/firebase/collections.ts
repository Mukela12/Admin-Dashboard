import { db } from './admin';

export const collections = {
  driverApplications: db.collection('driver-applications'),
  childPickupApplications: db.collection('child-pickup-applications'),
  complaints: db.collection('complaints'),
  drivers: db.collection('drivers'),
  users: db.collection('users'),
  notifications: db.collection('notifications'),
  bookings: db.collection('bookings'),
  payments: db.collection('payments'),
  floatTransactions: db.collection('float-transactions'),
  reviews: db.collection('reviews'),
};
