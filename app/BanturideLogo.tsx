import Image from 'next/image';

export default function BantuLogo() {
  return (
    <div className="flex flex-row items-center justify-center">
      {/* Light mode logo (green text - visible on white bg) */}
      <Image
        src="/bantulogo.png"
        width={120}
        height={90}
        alt="BantuRide Logo"
        className="object-contain dark:hidden"
      />
      {/* Dark mode logo (white text - visible on dark bg) */}
      <Image
        src="/bantulogo2.png"
        width={120}
        height={90}
        alt="BantuRide Logo"
        className="object-contain hidden dark:block"
      />
    </div>
  );
}
