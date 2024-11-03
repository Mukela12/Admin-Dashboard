import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/fonts';
import Image from 'next/image';

export default function BantuLogo() {
  return (
    <div
      className={`${lusitana.className} flex flex-row items-center leading-none text-white`}
    >
          <Image
            src="/bantulogo2.png"
            width={100}
            height={76}
            alt="Screenshots of the dashboard project showing desktop version"
            className="hidden md:block"
          />
    </div>
  );
}
