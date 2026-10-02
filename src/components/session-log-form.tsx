"use client";

import { fieldClass } from "@/components/quick-add";
import {
  sessionEngagements,
  sessionReactions,
  type FamilyRequest,
  type SessionEngagement,
  type SessionReaction,
} from "@/data/sample";

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

const durations = [5, 10, 15, 20, 30];

function ChoiceGrid<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T | "";
  onChange: (value: T) => void;
}) {
  return (
    <div className="mt-2 grid gap-2 sm:grid-cols-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={
            value === option
              ? "min-h-14 rounded-xl bg-navy px-3 text-lg font-semibold text-white"
              : "min-h-14 rounded-xl border border-stone-300 bg-white px-3 text-lg"
          }
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function SessionLogFields({
  values,
  onChange,
  waitingRequests,
}: {
  values: SessionLogValues;
  onChange: (patch: Partial<SessionLogValues>) => void;
  waitingRequests: FamilyRequest[];
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-lg font-medium">How long? (optional)</p>
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
      <div>
        <p className="text-lg font-medium">How did they react?</p>
        <ChoiceGrid
          options={sessionReactions}
          value={values.reaction}
          onChange={(reaction) => onChange({ reaction })}
        />
      </div>
      <div>
        <p className="text-lg font-medium">Engagement</p>
        <ChoiceGrid
          options={sessionEngagements}
          value={values.sessionEngagement}
          onChange={(sessionEngagement) => onChange({ sessionEngagement })}
        />
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
        <span className="text-lg font-medium">Staff notes (optional)</span>
        <textarea
          rows={2}
          value={values.sessionNotes}
          onChange={(event) => onChange({ sessionNotes: event.target.value })}
          className={`${fieldClass} mt-1 py-3`}
        />
      </label>
      <label className="block">
        <span className="text-lg font-medium">Memory discovered (optional)</span>
        <textarea
          rows={2}
          value={values.memoryDiscovered}
          onChange={(event) => onChange({ memoryDiscovered: event.target.value })}
          className={`${fieldClass} mt-1 py-3`}
        />
      </label>
      <label className="block">
        <span className="text-lg font-medium">Suggested follow-up destination (optional)</span>
        <input
          value={values.followUpDestination}
          onChange={(event) => onChange({ followUpDestination: event.target.value })}
          className={`${fieldClass} mt-1`}
        />
      </label>
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
