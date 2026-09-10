export const metadata = { title: "Veri Silme Durumu — Tentamark" };

/*
  The URL Meta's data-deletion callback (instagram/data-deletion/route.ts)
  hands back to the user. Deletion is synchronous in our system — the row is
  already gone by the time this page could be visited — so this is a static
  confirmation, not a live status lookup.
*/
export default async function DataDeletionStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-mint/10 text-mint mx-auto">✓</span>
        <h1 className="mt-4 font-display text-lg font-bold text-ink">Verileriniz silindi</h1>
        <p className="mt-2 font-body text-sm leading-relaxed text-muted">
          Instagram hesabınıza ait bağlantı bilgileri Tentamark&apos;tan tamamen kaldırıldı.
        </p>
        {code && (
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-faint">
            Onay kodu: {code}
          </p>
        )}
      </div>
    </div>
  );
}
