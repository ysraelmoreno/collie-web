import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { listPosts, type BlogLocale } from "@/lib/blog";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string }>;
}) {
  const locale: BlogLocale = (await searchParams).locale === "pt" ? "pt" : "en";
  const all = {
    en: listPosts("en", { drafts: true }),
    pt: listPosts("pt", { drafts: true }),
  };
  const posts = all[locale];
  const drafts = posts.filter((p) => p.draft).length;
  const tabs: [BlogLocale, string][] = [
    ["en", "English"],
    ["pt", "Português"],
  ];

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-[1312px] px-6 py-16 lg:px-0">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-[32px] leading-10 font-extrabold tracking-[-0.03em]">
              Posts
            </h1>
            <p className="mt-2 text-muted">
              Markdown files in content/blog. Save writes to disk; publish with
              git.
            </p>
          </div>
          <Link
            href={`/admin/${locale}/new`}
            className="rounded-md bg-accent px-5 py-3.5 font-semibold text-on-accent"
          >
            New post
          </Link>
        </div>

        <nav
          className="mt-10 flex gap-6 border-b border-border"
          aria-label="Language"
        >
          {tabs.map(([l, label]) => (
            <Link
              key={l}
              href={`/admin?locale=${l}`}
              aria-current={l === locale ? "page" : undefined}
              className={`-mb-px border-b-2 pb-3 ${l === locale ? "border-fg text-fg" : "border-transparent text-muted hover:text-fg"}`}
            >
              {label}{" "}
              <span className="ml-1 text-[13px] text-muted">
                {all[l].length}
              </span>
            </Link>
          ))}
        </nav>

        <div className="mt-6 overflow-x-auto rounded-md border border-border bg-surface">
          <table className="w-full min-w-[720px] text-left text-[15px]">
            <thead className="bg-surface-2 font-mono text-[12px] tracking-wider text-muted">
              <tr>
                <th className="px-5 py-3 font-normal">TITLE</th>
                <th className="px-5 py-3 font-normal">SLUG</th>
                <th className="px-5 py-3 font-normal">DATE</th>
                <th className="px-5 py-3 font-normal">STATUS</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.slug} className="border-t border-border">
                  <td className="px-5 py-4">{p.title}</td>
                  <td className="px-5 py-4 font-mono text-[13px] text-muted">
                    {p.slug}.md
                  </td>
                  <td className="px-5 py-4 font-mono text-[13px] text-muted">
                    {p.date}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-sm border px-2 py-0.5 font-mono text-[11px] tracking-wider ${p.draft ? "border-warn text-warn" : "border-success text-success"}`}
                    >
                      {p.draft ? "DRAFT" : "PUBLISHED"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/${locale}/${p.slug}`}
                      className="text-accent"
                    >
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted">
                    No posts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-5 flex justify-between font-mono text-[13px] text-muted">
          <span>
            content/blog/{locale} · {posts.length}{" "}
            {posts.length === 1 ? "file" : "files"} · {drafts}{" "}
            {drafts === 1 ? "draft" : "drafts"}
          </span>
          <span>Drafts are skipped by next build.</span>
        </div>
      </main>
    </>
  );
}
