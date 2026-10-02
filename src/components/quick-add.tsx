"use client";

import { useState } from "react";
import type { ListKey } from "@/lib/facility-store";
import { useFacility } from "@/lib/facility-store";

export const fieldClass =
  "w-full min-h-14 rounded-xl border border-stone-300 bg-white px-4 text-xl text-stone-900";

export function QuickAdd({
  residentId,
  listKey,
  placeholder,
  suggestions = [],
}: {
  residentId: string;
  listKey: ListKey;
  placeholder: string;
  suggestions?: string[];
}) {
  const { addListItem } = useFacility();
  const [value, setValue] = useState("");

  function add(item: string) {
    addListItem(residentId, listKey, item);
    setValue("");
  }

  return (
    <div className="mt-3">
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          add(value);
        }}
      >
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          className={fieldClass}
        />
        <button
          type="submit"
          className="min-h-14 shrink-0 rounded-xl bg-navy px-5 text-xl font-semibold text-white"
        >
          Add
        </button>
      </form>
      {suggestions.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => add(suggestion)}
              className="rounded-full border border-stone-300 bg-stone-50 px-4 py-2 text-lg text-stone-800"
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ChipList({
  residentId,
  listKey,
  items,
}: {
  residentId: string;
  listKey: ListKey;
  items: string[];
}) {
  const { removeListItem } = useFacility();

  if (items.length === 0) {
    return <p className="text-lg text-stone-500">Nothing here yet. Add one above.</p>;
  }

  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item}>
          <button
            type="button"
            onClick={() => removeListItem(residentId, listKey, item)}
            className="rounded-full bg-navy/10 px-4 py-2 text-lg text-navy"
          >
            {item} ×
          </button>
        </li>
      ))}
    </ul>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xl font-semibold text-stone-900">{children}</h3>;
}
