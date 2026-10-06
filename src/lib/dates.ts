const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function formatSessionWhen(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, today)) {
    return `Today at ${time}`;
  }

  if (sameDay(date, tomorrow)) {
    return `Tomorrow at ${time}`;
  }

  return `${dayNames[date.getDay()]} at ${time}`;
}

export function formatSubmittedAt(iso: string, fallback: string) {
  if (!iso) {
    return fallback;
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatBirthday(iso: string) {
  if (!iso) {
    return "Not recorded yet";
  }

  const birth = new Date(`${iso}T12:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  const dateText = birth.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return `${dateText} (${age} years old)`;
}
