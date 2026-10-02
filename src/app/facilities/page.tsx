"use client";

import { useEffect } from "react";
import { AppBar } from "@/components/brand";
import { useFacility } from "@/lib/facility-store";

export default function FacilitiesPage() {
  const { facilities, isAdmin, selectFacility, hydrated, profile, selectedFacilityId } = useFacility();

  useEffect(() => {
    if (hydrated && profile && !isAdmin) {
      window.location.href = "/";
    }
  }, [hydrated, profile, isAdmin]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
      <AppBar backHref="/" />
      <h1 className="text-4xl font-semibold tracking-tight text-navy">Facilities</h1>
      <p className="mt-2 text-xl text-stone-700">
        Open a community to see only that community. Add a new one when you have a new customer.
      </p>

      <a
        href="/facilities/new"
        className="mt-8 mb-8 inline-flex min-h-16 w-full items-center justify-center rounded-2xl bg-navy px-8 text-2xl font-semibold text-white"
      >
        Add facility
      </a>

      <ul className="space-y-3">
        {facilities.map((facility) => (
          <li key={facility.id}>
            <button
              type="button"
              onClick={() => {
                selectFacility(facility.id);
                window.location.href = "/";
              }}
              className="flex min-h-16 w-full items-center justify-between gap-4 rounded-xl border border-stone-300 bg-white px-4 text-left"
            >
              <span className="text-xl font-medium text-stone-900">{facility.name}</span>
              <span className="text-lg text-navy">
                {facility.id === selectedFacilityId ? "Open now" : "Open"}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
