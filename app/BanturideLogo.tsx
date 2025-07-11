import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/fonts';
import Image from 'next/image';

export default function BantuLogo() {
  return (
    <div className="flex flex-row items-center justify-center">
      <Image
        src="/bantulogo2.png"
        width={120}
        height={90}
        alt="BantuRide Logo"
        className="object-contain"
      />
    </div>
  );
}