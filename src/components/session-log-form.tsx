"use client";

import { fieldClass } from "@/components/quick-add";
import type { FamilyRequest, SessionEngagement, SessionReaction } from "@/data/sample";

export type SessionLogValues = {
  experience: string;
  durationMinutes: number;
  reaction: SessionReaction | "";
  sessionEngagement: SessionEngagement | "";
  sessionNotes: string;
  memoryDiscovered: string;
  followUpDestination: string;
  requestId: string;
};

const enjoyButtons: { value: SessionReaction; label: string }[] = [
  { value: "Loved It", label: "❤️ Loved It" },
  { value: "Liked It", label: "👍 Liked It" },
  { value: "Neutral", label: "😐 Neutral" },
  { value: "Didn't Like It", label: "👎 Not For Them" },
];

const durations = [5, 10, 15, 20, 30, 45];

export function EnjoyButtons({
  name,
  value,
  onChange,
}: {
  name: string;
  value: SessionReaction | "";
  onChange: (value: SessionReaction) => void;
}) {
  return (
    <div>
      <p className="text-2xl font-semibold text-navy">How did {name} enjoy this?</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {enjoyButtons.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={
              value === option.value
                ? "min-h-16 rounded-2xl bg-navy px-4 text-xl font-semibold text-white shadow-lg"
                : "min-h-16 rounded-2xl border border-white/70 bg-white/90 px-4 text-xl text-navy shadow-sm"
            }
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SessionLogFields({
  values,
  onChange,
  waitingRequests,
  residentName,
}: {
  values: SessionLogValues;
  onChange: (patch: Partial<SessionLogValues>) => void;
  waitingRequests: FamilyRequest[];
  residentName?: string;
}) {
  return (
    <div className="space-y-5">
      <EnjoyButtons
        name={residentName || "they"}
        value={values.reaction}
        onChange={(reaction) => onChange({ reaction })}
      />
      <label className="block">
        <span className="text-lg font-medium">Notes (optional)</span>
        <textarea
          rows={2}
          value={values.sessionNotes}
          onChange={(event) => onChange({ sessionNotes: event.target.value })}
          className={`${fieldClass} mt-1 py-3`}
        />
      </label>
      <details className="rounded-2xl border border-navy/10 bg-white/70 p-4">
        <summary className="cursor-pointer text-lg font-semibold text-navy">More details</summary>
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-lg font-medium">How long?</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {durations.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  onClick={() => onChange({ durationMinutes: minutes })}
                  className={
                    values.durationMinutes === minutes
                      ? "min-h-12 rounded-xl bg-navy px-4 text-lg font-semibold text-white"
                      : "min-h-12 rounded-xl border border-stone-300 bg-white px-4 text-lg"
                  }
                >
                  {minutes} min
                </button>
              ))}
            </div>
          </div>
          {waitingRequests.length > 0 ? (
            <label className="block">
              <span className="text-lg font-medium">Family request (optional)</span>
              <select
                className={`${fieldClass} mt-1`}
                value={values.requestId}
                onChange={(event) => {
                  const request = waitingRequests.find((item) => item.id === event.target.value);
                  onChange({
                    requestId: event.target.value,
                    experience: request?.experience || values.experience,
                  });
                }}
              >
                <option value="">Not from a family request</option>
                {waitingRequests.map((request) => (
                  <option key={request.id} value={request.id}>
                    {request.experience} — {request.requestedBy}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="block">
            <span className="text-lg font-medium">Memory discovered (optional)</span>
            <textarea
              rows={2}
              value={values.memoryDiscovered}
              onChange={(event) => onChange({ memoryDiscovered: event.target.value })}
              className={`${fieldClass} mt-1 py-3`}
            />
          </label>
        </div>
      </details>
    </div>
  );
}

export function emptySessionLog(experience = ""): SessionLogValues {
  return {
    experience,
    durationMinutes: 0,
    reaction: "",
    sessionEngagement: "",
    sessionNotes: "",
    memoryDiscovered: "",
    followUpDestination: "",
    requestId: "",
  };
}
