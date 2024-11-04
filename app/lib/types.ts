export interface Application {
    updatedAt: any;
    id: string;
    insuranceCertificateImage: string;
    avatar: string;
    seats: string;
    vehicleImage1: string;
    vehicleImage2: string;
    canDriver: boolean;
    canDeliver: boolean;
    carColor: string;
    driverId: string;
    licenseExpiry: string;
    licenseNumber: string;
    vehicleReg: string;
    carMake: string;
    nrc: string;
    carModel: string;
    createdAt: {
      _seconds: number;
      _nanoseconds: number;
    };
    reason: string;
    driverVerificationStatus: string;
  }
  
  export interface DriverApplication {
    id: string;
    driverId: string;
    avatar: string;
    insuranceCertificateImage?: string | null;
    driversLicenseImage?: string | null;
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
    createdAt: {
      _seconds: number;
      _nanoseconds: number;
    } | null;
    driverVerificationStatus: string;
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
  