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
  const [grewUp, setGrewUp] = useState("");
  const [honeymoon, setHoneymoon] = useState("");
  const [vacation, setVacation] = useState("");
  const [team, setTeam] = useState("");
  const [bucketList, setBucketList] = useState("");
  const [meaningful, setMeaningful] = useState("");
  const [experience, setExperience] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch(`/api/family/${encodeURIComponent(token)}`);
        const payload = (await response.json()) as { firstName?: string };
        if (cancelled) {
          return;
        }
        if (!response.ok || !payload.firstName) {
          setMissing(true);
          return;
        }
        setFirstName(payload.firstName);
      } catch {
        if (!cancelled) {
          setMissing(true);
        }
      }
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
        <h1 className="mt-6 font-display text-3xl font-semibold text-navy">This link is not valid</h1>
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
        <h1 className="mt-6 font-display text-3xl font-semibold text-navy">Thank you</h1>
        <p className="mt-3 text-xl text-stone-700">
          You helped create {firstName}&apos;s next adventure. Staff will see this on their dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-8">
      <BrandMark size="sm" />
      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-gold">Family</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-navy">
        Help create {firstName || "their"} next adventure
      </h1>
      <p className="mt-2 text-xl text-stone-700">
        A few memories are enough. You do not need an account.
      </p>

      <form
        className="mt-8 space-y-5"
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          const idea = experience.trim() || meaningful.trim() || bucketList.trim() || vacation.trim() || honeymoon.trim() || grewUp.trim();
          if (!idea) {
            setError("Share a place or experience idea.");
            return;
          }
          const whyItMatters =
            meaningful.trim() ||
            (honeymoon.trim() ? `Honeymoon: ${honeymoon}` : "") ||
            (vacation.trim() ? `They always talked about ${vacation}` : "") ||
            "A meaningful place from family.";
          const memory = [
            grewUp && `Grew up: ${grewUp}`,
            honeymoon && `Honeymoon: ${honeymoon}`,
            vacation && `Vacation they talked about: ${vacation}`,
            team && `Loves this team: ${team}`,
            bucketList && `Always wanted to visit: ${bucketList}`,
            meaningful && `Experience again: ${meaningful}`,
          ]
            .filter(Boolean)
            .join(" ");
          setBusy(true);
          const response = await fetch(`/api/family/${token}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              familyName,
              relationship,
              experience: idea,
              year: "",
              whyItMatters,
              memory: memory || whyItMatters,
              staffNote: team,
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
          <input required value={familyName} onChange={(event) => setFamilyName(event.target.value)} className={`${fieldClass} mt-1`} />
        </label>
        <label className="block">
          <span className="text-lg font-medium">Relationship to {firstName || "them"}</span>
          <input
            required
            value={relationship}
            onChange={(event) => setRelationship(event.target.value)}
            placeholder="Daughter, grandson, friend…"
            className={`${fieldClass} mt-1`}
          />
        </label>
        <label className="block">
          <span className="text-lg font-medium">Where did they grow up?</span>
          <input value={grewUp} onChange={(event) => setGrewUp(event.target.value)} className={`${fieldClass} mt-1`} />
        </label>
        <label className="block">
          <span className="text-lg font-medium">Where did they honeymoon?</span>
          <input value={honeymoon} onChange={(event) => setHoneymoon(event.target.value)} className={`${fieldClass} mt-1`} />
        </label>
        <label className="block">
          <span className="text-lg font-medium">What vacation did they always talk about?</span>
          <input value={vacation} onChange={(event) => setVacation(event.target.value)} className={`${fieldClass} mt-1`} />
        </label>
        <label className="block">
          <span className="text-lg font-medium">What sports team do they love?</span>
          <input value={team} onChange={(event) => setTeam(event.target.value)} className={`${fieldClass} mt-1`} />
        </label>
        <label className="block">
          <span className="text-lg font-medium">Where have they always wanted to visit?</span>
          <input value={bucketList} onChange={(event) => setBucketList(event.target.value)} className={`${fieldClass} mt-1`} />
        </label>
        <label className="block">
          <span className="text-lg font-medium">Somewhere meaningful you would like them to experience again?</span>
          <input value={meaningful} onChange={(event) => setMeaningful(event.target.value)} className={`${fieldClass} mt-1`} />
        </label>
        <label className="block">
          <span className="text-lg font-medium">Submit an experience idea</span>
          <input
            value={experience}
            onChange={(event) => setExperience(event.target.value)}
            placeholder="Rome, Wrigley Field, a childhood street…"
            className={`${fieldClass} mt-1`}
          />
        </label>
        {error ? <p className="text-lg text-red-800">{error}</p> : null}
        <button
          type="submit"
          disabled={busy || !token}
          className="inline-flex min-h-20 w-full items-center justify-center rounded-2xl bg-navy px-8 text-2xl font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Sending…" : "Submit an experience idea"}
        </button>
      </form>
    </div>
  );
}
