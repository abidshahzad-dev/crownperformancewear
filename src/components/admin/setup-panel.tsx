/** Shown in place of the dashboard until Supabase environment variables are set. */
export function SupabaseSetupPanel() {
  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-black/10 bg-white p-6 sm:p-8">
      <p className="text-paper-muted text-[11px] font-extrabold tracking-[0.16em] uppercase">Setup required</p>
      <h1 className="text-paper-ink mt-2 text-[24px] font-bold tracking-tight">
        Connect Supabase to use the dashboard
      </h1>
      <p className="text-paper-muted mt-2 text-[14px]">
        The public site is running on built-in demo content. To sign in and manage products, pages and inquiries:
      </p>
      <ol className="text-paper-ink mt-5 list-decimal space-y-3 pl-5 text-[14px]">
        <li>
          Add <code className="rounded bg-slate-100 px-1">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
          <code className="rounded bg-slate-100 px-1">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> and{" "}
          <code className="rounded bg-slate-100 px-1">SUPABASE_SECRET_KEY</code> to your environment file.
        </li>
        <li>
          Run the SQL in <code className="rounded bg-slate-100 px-1">supabase/migrations</code>, then{" "}
          <code className="rounded bg-slate-100 px-1">supabase/seed.sql</code>, in the Supabase SQL editor.
        </li>
        <li>
          Create your first admin:{" "}
          <code className="rounded bg-slate-100 px-1">
            npx tsx scripts/create-admin.ts you@example.com &lt;password&gt;
          </code>
        </li>
        <li>Restart the dev server and sign in at /admin/login.</li>
      </ol>
    </div>
  );
}
