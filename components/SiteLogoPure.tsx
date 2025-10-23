"use client";
import Image from "next/image";

export default function SiteLogoPure() {
  return (
    <div className="relative h-14 w-auto select-none">
      <Image
        src="/logo.png"
        alt="Liga de Boxeo"
        width={240}
        height={56}
        priority
        className="h-14 w-auto"
      />
    </div>
  );
}
