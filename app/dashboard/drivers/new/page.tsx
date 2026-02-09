'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/lib/hooks/useToast';
import { useConfirm } from '@/app/lib/hooks/useConfirm';
import {
  CameraIcon,
  TruckIcon,
  XMarkIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function NewDriverPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    phoneNumber: '',
    nrc: '',
    licenseNumber: '',
    licenseExpiry: '',
    carMake: '',
    carModel: '',
    carColor: '',
    vehicleReg: '',
    seats: '4',
    canDrive: true,
    canDeliver: false,
  });

  const [driverPhoto, setDriverPhoto] = useState<File | null>(null);
  const [driverPhotoPreview, setDriverPhotoPreview] = useState<string | null>(null);
  const [vehicleExterior, setVehicleExterior] = useState<File | null>(null);
  const [vehicleExteriorPreview, setVehicleExteriorPreview] = useState<string | null>(null);
  const [vehicleInterior, setVehicleInterior] = useState<File | null>(null);
  const [vehicleInteriorPreview, setVehicleInteriorPreview] = useState<string | null>(null);

  const driverPhotoRef = useRef<HTMLInputElement>(null);
  const vehicleExteriorRef = useRef<HTMLInputElement>(null);
  const vehicleInteriorRef = useRef<HTMLInputElement>(null);

  function handleFileChange(
    file: File | undefined,
    setFile: (f: File | null) => void,
    setPreview: (p: string | null) => void,
  ) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('File must be under 5MB', 'error');
      return;
    }
    setFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function clearFile(
    setFile: (f: File | null) => void,
    setPreview: (p: string | null) => void,
    ref: React.RefObject<HTMLInputElement | null>,
  ) {
    setFile(null);
    setPreview(null);
    if (ref.current) ref.current.value = '';
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName || !form.phoneNumber || !form.nrc || !form.licenseNumber) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (!form.phoneNumber.startsWith('+260')) {
      showToast('Phone number must start with +260', 'error');
      return;
    }

    if (!form.canDrive && !form.canDeliver) {
      showToast('Driver must be able to provide at least one service', 'error');
      return;
    }

    const confirmed = await confirm({
      title: 'Register New Driver',
      message: `Register ${form.fullName} as a new driver? They will be auto-approved and can start accepting rides immediately.`,
      confirmText: 'Register',
      variant: 'success',
    });
    if (!confirmed) return;

    setLoading(true);
    try {
      // Build FormData for file uploads
      const formData = new FormData();
      formData.append('data', JSON.stringify(form));
      if (driverPhoto) formData.append('driverPhoto', driverPhoto);
      if (vehicleExterior) formData.append('vehicleExterior', vehicleExterior);
      if (vehicleInterior) formData.append('vehicleInterior', vehicleInterior);

      const response = await fetch('/api/drivers/create', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        showToast('Driver registered successfully', 'success');
        router.push('/dashboard/all-drivers');
      } else {
        showToast(result.error || 'Failed to register driver', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
        {/* Driver Photo */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">Driver Photo</h2>
          <div className="flex items-center gap-6">
            <div
              onClick={() => driverPhotoRef.current?.click()}
              className="relative w-28 h-28 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors overflow-hidden bg-slate-50 dark:bg-slate-700"
            >
              {driverPhotoPreview ? (
                <Image src={driverPhotoPreview} alt="Driver" fill className="object-cover" />
              ) : (
                <div className="text-center">
                  <UserIcon className="h-8 w-8 text-slate-400 mx-auto" />
                  <p className="text-[10px] text-slate-400 mt-1">Upload</p>
                </div>
              )}
            </div>
            {driverPhotoPreview && (
              <button
                type="button"
                onClick={() => clearFile(setDriverPhoto, setDriverPhotoPreview, driverPhotoRef)}
                className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
              >
                <XMarkIcon className="h-4 w-4" />
                Remove
              </button>
            )}
            <input
              ref={driverPhotoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0], setDriverPhoto, setDriverPhotoPreview)}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload a clear photo of the driver. Max 5MB.
            </p>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name *</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone Number *</label>
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="+260..."
                required
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Must start with +260</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">NRC Number *</label>
              <input
                type="text"
                value={form.nrc}
                onChange={(e) => setForm({ ...form, nrc: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">License Number *</label>
              <input
                type="text"
                value={form.licenseNumber}
                onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">License Expiry *</label>
              <input
                type="date"
                value={form.licenseExpiry}
                onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">Vehicle Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Car Make *</label>
              <input
                type="text"
                value={form.carMake}
                onChange={(e) => setForm({ ...form, carMake: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g., Toyota"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Car Model *</label>
              <input
                type="text"
                value={form.carModel}
                onChange={(e) => setForm({ ...form, carModel: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g., Corolla"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Car Color *</label>
              <input
                type="text"
                value={form.carColor}
                onChange={(e) => setForm({ ...form, carColor: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Vehicle Registration *</label>
              <input
                type="text"
                value={form.vehicleReg}
                onChange={(e) => setForm({ ...form, vehicleReg: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Number of Seats *</label>
              <select
                value={form.seats}
                onChange={(e) => setForm({ ...form, seats: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="2">2 Seats</option>
                <option value="4">4 Seats</option>
                <option value="5">5 Seats</option>
                <option value="7">7 Seats</option>
              </select>
            </div>
          </div>

          {/* Vehicle Photos */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Vehicle Photos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Exterior */}
              <div
                onClick={() => vehicleExteriorRef.current?.click()}
                className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-slate-50 dark:bg-slate-700/50 overflow-hidden"
              >
                {vehicleExteriorPreview ? (
                  <div className="relative h-40">
                    <Image src={vehicleExteriorPreview} alt="Exterior" fill className="object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearFile(setVehicleExterior, setVehicleExteriorPreview, vehicleExteriorRef);
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="h-40 flex flex-col items-center justify-center">
                    <TruckIcon className="h-10 w-10 text-slate-400 mb-2" />
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Vehicle Exterior</p>
                    <p className="text-xs text-slate-400 mt-1">Click to upload</p>
                  </div>
                )}
                <input
                  ref={vehicleExteriorRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files?.[0], setVehicleExterior, setVehicleExteriorPreview)}
                />
              </div>

              {/* Interior */}
              <div
                onClick={() => vehicleInteriorRef.current?.click()}
                className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-slate-50 dark:bg-slate-700/50 overflow-hidden"
              >
                {vehicleInteriorPreview ? (
                  <div className="relative h-40">
                    <Image src={vehicleInteriorPreview} alt="Interior" fill className="object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearFile(setVehicleInterior, setVehicleInteriorPreview, vehicleInteriorRef);
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="h-40 flex flex-col items-center justify-center">
                    <CameraIcon className="h-10 w-10 text-slate-400 mb-2" />
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Vehicle Interior</p>
                    <p className="text-xs text-slate-400 mt-1">Click to upload</p>
                  </div>
                )}
                <input
                  ref={vehicleInteriorRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files?.[0], setVehicleInterior, setVehicleInteriorPreview)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Service Capabilities */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">Service Capabilities</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-600 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <input
                type="checkbox"
                checked={form.canDrive}
                onChange={(e) => setForm({ ...form, canDrive: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Ride Services</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Can accept passenger ride requests</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-600 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <input
                type="checkbox"
                checked={form.canDeliver}
                onChange={(e) => setForm({ ...form, canDeliver: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Delivery Services</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Can accept package delivery requests</p>
              </div>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="flex-1 px-6 py-3 text-sm font-medium border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Registering...' : 'Register Driver'}
          </button>
        </div>
      </form>
    </div>
  );
}
