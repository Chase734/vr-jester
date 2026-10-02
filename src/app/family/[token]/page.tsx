"use client";

import { use, useEffect, useState } from "react";
import { BrandMark } from "@/components/brand";
import { fieldClass } from "@/components/quick-add";

export default function FamilyRequestPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [firstName, setFirstName] = useState("");
  const [missing, setMissing] = useState(false);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [experience, setExperience] = useState("");
  const [year, setYear] = useState("");
  const [whyItMatters, setWhyItMatters] = useState("");
  const [memory, setMemory] = useState("");
  const [staffNote, setStaffNote] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const response = await fetch(`/api/family/${token}`);
      const payload = (await response.json()) as { firstName?: string };
      if (cancelled) {
        return;
      }
      if (!response.ok || !payload.firstName) {
        setMissing(true);
        return;
      }
      setFirstName(payload.firstName);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (missing) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <BrandMark size="sm" />
        <h1 className="mt-6 text-3xl font-semibold text-navy">This link is not valid</h1>
        <p className="mt-3 text-xl text-stone-700">
          Ask the community staff for a new family request link.
        </p>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <BrandMark size="sm" />
        <h1 className="mt-6 text-3xl font-semibold text-navy">Thank you</h1>
        <p className="mt-3 text-xl text-stone-700">
          Thank you for helping personalize {firstName}&apos;s VR experiences. Staff will review
          this request.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-8">
      <BrandMark size="sm" />
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-navy">
        Suggest a place for {firstName || "your loved one"}
      </h1>
      <p className="mt-2 text-xl text-stone-700">
        Share a destination that would mean something in Wander. You do not need an account.
      </p>

      <form
        className="mt-8 space-y-5"
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          setBusy(true);
          const response = await fetch(`/api/family/${token}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              familyName,
              relationship,
              experience,
              year,
              whyItMatters,
              memory,
              staffNote,
            }),
          });
          setBusy(false);
          if (!response.ok) {
            const payload = (await response.json()) as { error?: string };
            setError(payload.error || "Could not send that request. Try again.");
            return;
          }
          setSent(true);
        }}
      >
        <label className="block">
          <span className="text-lg font-medium">Your name</span>
          <input
            required
            value={familyName}
            onChange={(event) => setFamilyName(event.target.value)}
            className={`${fieldClass} mt-1`}
          />
        </label>
        <label className="block">
          <span className="text-lg font-medium">Relationship to {firstName || "the resident"}</span>
          <input
            required
            value={relationship}
            onChange={(event) => setRelationship(event.target.value)}
            placeholder="Daughter, grandson, friend…"
            className={`${fieldClass} mt-1`}
          />
        </label>
        <label className="block">
          <span className="text-lg font-medium">Place or destination</span>
          <input
            required
            value={experience}
            onChange={(event) => setExperience(event.target.value)}
            placeholder="Paris, a childhood street, a church…"
            className={`${fieldClass} mt-1`}
          />
        </label>
        <label className="block">
          <span className="text-lg font-medium">Approximate year (optional)</span>
          <input
            value={year}
            onChange={(event) => setYear(event.target.value)}
            placeholder="1988"
            className={`${fieldClass} mt-1`}
          />
        </label>
        <label className="block">
          <span className="text-lg font-medium">Why this place matters</span>
          <textarea
            required
            rows={3}
            value={whyItMatters}
            onChange={(event) => setWhyItMatters(event.target.value)}
            className={`${fieldClass} mt-1 py-3`}
          />
        </label>
        <label className="block">
          <span className="text-lg font-medium">Memory or story associated with it</span>
          <textarea
            required
            rows={4}
            value={memory}
            onChange={(event) => setMemory(event.target.value)}
            className={`${fieldClass} mt-1 py-3`}
          />
        </label>
        <label className="block">
          <span className="text-lg font-medium">Anything staff should know (optional)</span>
          <textarea
            rows={3}
            value={staffNote}
            onChange={(event) => setStaffNote(event.target.value)}
            className={`${fieldClass} mt-1 py-3`}
          />
        </label>
        {error ? <p className="text-lg text-red-800">{error}</p> : null}
        <button
          type="submit"
          disabled={busy || !token}
          className="inline-flex min-h-20 w-full items-center justify-center rounded-2xl bg-navy px-8 text-2xl font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Sending…" : "Send Experience Request"}
        </button>
      </form>
    </div>
  );
}
