"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { LogoutButton } from "@/components/logout-button";
import { useFacility } from "@/lib/facility-store";

export function BrandMark({ size }: { size: "sm" | "lg" }) {
  const pixels = size === "lg" ? 220 : 56;

  return (
    <Image
      src="/vr-jester-logo.jpg"
      alt="VR Jester"
      width={pixels}
      height={pixels}
      className="rounded-2xl shadow-md"
      priority={size === "lg"}
    />
  );
}

const links = [
  { href: "/", label: "Home" },
  { href: "/discover", label: "Discover" },
  { href: "/activity", label: "Plan" },
  { href: "/engagement", label: "Engagement" },
];

export function AppBar({
  backHref,
  backLabel = "Back",
  extra,
}: {
  backHref?: string;
  backLabel?: string;
  extra?: ReactNode;
}) {
  const { isAdmin } = useFacility();

  return (
    <header className="mb-6">
      <div className="flex items-center justify-between gap-4 rounded-3xl border border-white/70 bg-white/80 px-4 py-3 shadow-lg shadow-navy/5 backdrop-blur">
        <a href="/" className="flex min-h-14 items-center gap-3">
          <BrandMark size="sm" />
          <span className="font-display text-xl font-semibold text-navy">VR Jester</span>
        </a>
        <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
          {extra}
          {isAdmin ? (
            <a href="/facilities" className="text-lg text-navy underline">
              Facilities
            </a>
          ) : null}
          <LogoutButton />
        </div>
      </div>
      <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="inline-flex min-h-12 shrink-0 items-center rounded-full bg-navy px-5 text-lg font-semibold text-white shadow-md shadow-navy/20"
          >
            {link.label}
          </a>
        ))}
      </nav>
      {backHref ? (
        <a href={backHref} className="mt-3 inline-block text-lg text-navy underline">
          {backLabel}
        </a>
      ) : null}
    </header>
  );
}
