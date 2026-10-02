export default function ResidentNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-semibold">Resident not found</h1>
      <p className="mt-3 text-xl text-stone-700">This person is not in the Maple Grove sample list.</p>
      <a href="/" className="mt-6 inline-block text-lg text-emerald-800 underline">
        Back to dashboard
      </a>
    </div>
  );
}
