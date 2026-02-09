import { ReactNode } from "react";

export interface Application {
  id: string;
  driverId: string;
  driverFullName: string;
  driverPhoneNumber: string | null;
  driverRating: number | null;
  driverStatus: 'online' | 'offline' | null;
  avatar: string;
  insuranceCertificate: string;
  driversLicenseImage: string;
  seats: string;
  vehicleImage1: string;
  vehicleImage2: string;
  canDriver: boolean;
  canDeliver: boolean;
  carColor: string;
  licenseExpiry: string;
  licenseNumber: string;
  vehicleReg: string;
  carMake: string;
  nrc: string;
  carModel: string;
  createdAt: number | {
    _seconds: number;
    _nanoseconds: number;
  };
  reason?: string;
  driverVerificationStatus: 'pending' | 'approved' | 'denied' | 'failed';
  updatedAt?: any;
}

export interface DriverApplication {
  id: string;
  driverId: string;
  driverFullName: string;
  driverPhoneNumber: string | null;
  driverRating: number | null;
  driverStatus: 'online' | 'offline' | null;
  avatar: string;
  insuranceCertificate: string;
  driversLicenseImage: string;
  seats: string;
  vehicleImage1: string;
  vehicleImage2: string;
  canDriver: boolean;
  canDeliver: boolean;
  carColor: string;
  licenseExpiry: string;
  licenseNumber: string;
  vehicleReg: string;
  carMake: string;
  carModel: string;
  nrc: string;
  createdAt: number | {
    _seconds: number;
    _nanoseconds: number;
  } | null;
  reason?: string;
  driverVerificationStatus: 'pending' | 'approved' | 'denied' | 'failed';
  updatedAt?: any;
  // Legacy fields for backward compatibility (deprecated)
  fullName?: string;
  insuranceCertificateImage?: string | null;
}

export interface Complaint {
  id: string;
  complaintRelation: string;
  complaint: string;
  complainer: string;
  userId: string;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

export type Revenue = {
  month: string;
  revenue: number;
};

export interface EmergencyContact {
  name: string;
  phoneNumber: string;
  relationship: string;
}

export interface Reference {
  name: string;
  phoneNumber: string;
  relationship: string;
}

export interface ChildPickupApplication {
  id: string;
  childPickUpStatus: string;
  status?: string;
  driverId: string;
  fullName: string;
  emergencyContactDetails: {
    name: string;
    phoneNumber: string;
    relationship: string;
  } | null;
  policeClearanceDocument: string;
  references: Array<{
    name: string;
    phoneNumber: string;
    relationship: string;
  }>;
  safetyPolicyAccepted?: boolean;
  rejectionReason?: string;
  updatedAt: number;
}