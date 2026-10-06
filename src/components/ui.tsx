export function StartSessionButton({ residentId }: { residentId?: string }) {
  const href = residentId ? `/start-session?resident=${residentId}` : "/start-session";

  return (
    <a
      href={href}
      className="inline-flex min-h-20 w-full items-center justify-center rounded-2xl bg-navy px-8 text-3xl font-semibold text-white hover:bg-navy-dark focus:outline-none focus:ring-4 focus:ring-gold"
    >
      Start an Experience
    </a>
  );
}
