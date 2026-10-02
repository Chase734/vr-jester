"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { LogoutButton } from "@/components/logout-button";

export function BrandMark({ size }: { size: "sm" | "lg" }) {
  const pixels = size === "lg" ? 220 : 56;

  return (
    <Image
      src="/vr-jester-logo.jpg"
      alt="VR Jester"
      width={pixels}
      height={pixels}
      priority={size === "lg"}
    />
  );
}

export function AppBar({
  backHref,
  backLabel = "Back to dashboard",
  extra,
}: {
  backHref?: string;
  backLabel?: string;
  extra?: ReactNode;
}) {
  return (
    <header className="mb-6 border-b-2 border-gold pb-4">
      <div className="flex items-center justify-between gap-4">
        <a href="/" className="flex min-h-14 items-center gap-3">
          <BrandMark size="sm" />
          <span className="text-xl font-semibold text-navy">VR Jester</span>
        </a>
        <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
          {extra}
          <LogoutButton />
        </div>
      </div>
      {backHref ? (
        <a href={backHref} className="mt-3 inline-block text-lg text-navy underline">
          {backLabel}
        </a>
      ) : null}
    </header>
  );
}
