import { NextResponse } from 'next/server';
import { collections } from '@/app/lib/firebase/collections';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

async function uploadFile(file: File, path: string): Promise<string> {
  const storage = getStorage();
  const bucket = storage.bucket();
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileRef = bucket.file(path);

  await fileRef.save(buffer, {
    metadata: {
      contentType: file.type,
    },
  });

  await fileRef.makePublic();
  return `https://storage.googleapis.com/${bucket.name}/${path}`;
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let data: any;
    let driverPhotoFile: File | null = null;
    let vehicleExteriorFile: File | null = null;
    let vehicleInteriorFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      data = JSON.parse(formData.get('data') as string);
      driverPhotoFile = formData.get('driverPhoto') as File | null;
      vehicleExteriorFile = formData.get('vehicleExterior') as File | null;
      vehicleInteriorFile = formData.get('vehicleInterior') as File | null;
    } else {
      data = await request.json();
    }

    // Validate phone number format
    if (!data.phoneNumber.startsWith('+260')) {
      return NextResponse.json(
        { error: 'Phone number must start with +260' },
        { status: 400 }
      );
    }

    // Create Firebase Auth user
    const auth = getAuth();
    let userRecord;

    try {
      userRecord = await auth.createUser({
        phoneNumber: data.phoneNumber,
        displayName: data.fullName,
      });
    } catch (authError: any) {
      if (authError.code === 'auth/phone-number-already-exists') {
        return NextResponse.json(
          { error: 'A user with this phone number already exists' },
          { status: 400 }
        );
      }
      throw authError;
    }

    // Upload files to Firebase Storage if provided
    let avatarUrl = '';
    let exteriorImageUrl = '';
    let interiorImageUrl = '';

    const uploadPromises: Promise<void>[] = [];

    if (driverPhotoFile && driverPhotoFile.size > 0) {
      uploadPromises.push(
        uploadFile(driverPhotoFile, `drivers/${userRecord.uid}/avatar.${driverPhotoFile.name.split('.').pop()}`)
          .then(url => { avatarUrl = url; })
      );
    }
    if (vehicleExteriorFile && vehicleExteriorFile.size > 0) {
      uploadPromises.push(
        uploadFile(vehicleExteriorFile, `drivers/${userRecord.uid}/vehicle-exterior.${vehicleExteriorFile.name.split('.').pop()}`)
          .then(url => { exteriorImageUrl = url; })
      );
    }
    if (vehicleInteriorFile && vehicleInteriorFile.size > 0) {
      uploadPromises.push(
        uploadFile(vehicleInteriorFile, `drivers/${userRecord.uid}/vehicle-interior.${vehicleInteriorFile.name.split('.').pop()}`)
          .then(url => { interiorImageUrl = url; })
      );
    }

    await Promise.all(uploadPromises);

    // Create driver profile
    const driverData: Record<string, any> = {
      uid: userRecord.uid,
      phoneNumber: data.phoneNumber,
      fullName: data.fullName,
      role: 'driver',
      profileComplete: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      driverInfo: {
        canDrive: data.canDrive,
        canDeliver: data.canDeliver,
        licenseNumber: data.licenseNumber,
        licenseExpiry: data.licenseExpiry,
        verificationStatus: 'approved',
        bookingClasses: data.canDrive ? ['bantu-economy'] : [],
        deliveryClasses: data.canDeliver ? ['bantu-regular'] : [],
        floatBalance: 0,
      },
      vehicleInfo: {
        make: data.carMake,
        model: data.carModel,
        color: data.carColor,
        plateNumber: data.vehicleReg,
        seats: parseInt(data.seats),
        ...(exteriorImageUrl && { exteriorImageUrl }),
        ...(interiorImageUrl && { interiorImageUrl }),
      },
      ratings: {
        average: 5,
        count: 0,
        knownFor: ['New Driver'],
      },
    };

    if (avatarUrl) {
      driverData.identity = { avatarUrl, fullName: data.fullName, nrc: data.nrc };
    }

    await collections.drivers.doc(userRecord.uid).set(driverData);

    // Create driver application record
    await collections.driverApplications.doc(userRecord.uid).set({
      id: userRecord.uid,
      driverId: userRecord.uid,
      driverVerificationStatus: 'approved',
      canDriver: data.canDrive,
      canDeliver: data.canDeliver,
      driverFullName: data.fullName,
      driverPhoneNumber: data.phoneNumber,
      nrc: data.nrc,
      licenseNumber: data.licenseNumber,
      licenseExpiry: data.licenseExpiry,
      carMake: data.carMake,
      carModel: data.carModel,
      carColor: data.carColor,
      vehicleReg: data.vehicleReg,
      seats: parseInt(data.seats),
      ...(avatarUrl && { avatar: avatarUrl }),
      ...(exteriorImageUrl && { vehicleImage1: exteriorImageUrl }),
      ...(interiorImageUrl && { vehicleImage2: interiorImageUrl }),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return NextResponse.json({ success: true, driverId: userRecord.uid });
  } catch (error: any) {
    console.error('Create driver error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create driver' },
      { status: 500 }
    );
  }
}
