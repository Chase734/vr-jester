"use client";

import { useEffect, useState } from "react";
import { fieldClass } from "@/components/quick-add";
import { AppBar } from "@/components/brand";
import { SELECTED_FACILITY_KEY } from "@/lib/constants";
import { useFacility } from "@/lib/facility-store";

export default function NewFacilityPage() {
  const { isAdmin, hydrated, profile } = useFacility();
  const [facilityName, setFacilityName] = useState("");
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (hydrated && profile && !isAdmin) {
      window.location.href = "/";
    }
  }, [hydrated, profile, isAdmin]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-8">
      <AppBar backHref="/facilities" backLabel="Back to facilities" />
      <h1 className="text-4xl font-semibold tracking-tight text-navy">Add facility</h1>
      <p className="mt-2 text-xl text-stone-700">
        This creates a new community and the first staff login for that community. They will only see their own residents.
      </p>

      <form
        className="mt-8 space-y-5"
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          setBusy(true);
          const response = await fetch("/api/facilities", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              facilityName,
              staffName,
              staffEmail,
              staffPassword,
            }),
          });
          const payload = (await response.json()) as { id?: string; error?: string };
          setBusy(false);
          if (!response.ok || !payload.id) {
            setError(payload.error || "Could not add that facility. Try again.");
            return;
          }
          try {
            localStorage.setItem(SELECTED_FACILITY_KEY, payload.id);
          } catch {
            // Ignore private-mode storage errors.
          }
          window.location.href = "/";
        }}
      >
        <label className="block">
          <span className="text-lg font-medium">Facility name</span>
          <input
            value={facilityName}
            onChange={(event) => setFacilityName(event.target.value)}
            required
            autoFocus
            placeholder="Oak Hill Senior Living"
            className={`${fieldClass} mt-1`}
          />
        </label>
        <label className="block">
          <span className="text-lg font-medium">Staff name</span>
          <input
            value={staffName}
            onChange={(event) => setStaffName(event.target.value)}
            required
            placeholder="Pat Rivera"
            className={`${fieldClass} mt-1`}
          />
        </label>
        <label className="block">
          <span className="text-lg font-medium">Staff email</span>
          <input
            type="email"
            value={staffEmail}
            onChange={(event) => setStaffEmail(event.target.value)}
            required
            autoComplete="off"
            placeholder="staff@oakhill.com"
            className={`${fieldClass} mt-1`}
          />
        </label>
        <label className="block">
          <span className="text-lg font-medium">Staff password</span>
          <input
            type="text"
            value={staffPassword}
            onChange={(event) => setStaffPassword(event.target.value)}
            required
            minLength={8}
            autoComplete="off"
            placeholder="At least 8 characters"
            className={`${fieldClass} mt-1`}
          />
        </label>
        {error ? <p className="text-lg text-red-800">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="inline-flex min-h-20 w-full items-center justify-center rounded-2xl bg-navy px-8 text-3xl font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Creating…" : "Create facility"}
        </button>
      </form>
    </div>
  );
}
