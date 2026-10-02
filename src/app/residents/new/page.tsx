"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { fieldClass } from "@/components/quick-add";
import { useFacility } from "@/lib/facility-store";

export default function NewResidentPage() {
  const router = useRouter();
  const { addResident } = useFacility();
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-8">
      <a href="/" className="text-lg text-emerald-800 underline">
        Back to dashboard
      </a>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-stone-900">Add resident</h1>
      <p className="mt-2 text-xl text-stone-700">
        Name is enough to start. You can add interests and travel on the next screen.
      </p>

      <form
        className="mt-8 space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) {
            return;
          }
          const resident = addResident(name, room);
          router.push(`/residents/${resident.id}`);
        }}
      >
        <label className="block">
          <span className="text-lg font-medium">Resident name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            autoFocus
            placeholder="First and last name"
            className={`${fieldClass} mt-1`}
          />
        </label>
        <label className="block">
          <span className="text-lg font-medium">Room (optional)</span>
          <input
            value={room}
            onChange={(event) => setRoom(event.target.value)}
            placeholder="Room 14"
            className={`${fieldClass} mt-1`}
          />
        </label>
        <button
          type="submit"
          className="inline-flex min-h-20 w-full items-center justify-center rounded-2xl bg-emerald-800 px-8 text-3xl font-semibold text-white"
        >
          Create resident
        </button>
      </form>
    </div>
  );
}
