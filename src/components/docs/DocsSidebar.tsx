import { docPaths, type Locale } from "@/i18n";
import { docsNav } from "@/i18n/docs-nav";
import { docMeta } from "@/lib/docs";

/** Groups from docs-nav.ts; page labels are each page's frontmatter title. */
export function DocsSidebar({
  locale,
  current,
  label,
}: {
  locale: Locale;
  current: string;
  label: string;
}) {
  return (
    <nav aria-label={label} className="flex flex-col gap-6">
      {docsNav.map((g) => (
        <div key={g.id} className="flex flex-col gap-2">
          <p className="pl-2.5 font-mono text-xs leading-4 tracking-[0.12em] text-muted uppercase">
            {g.title[locale]}
          </p>
          <ul className="flex flex-col gap-0.5">
            {g.pages.map((slug) => (
              <li key={slug}>
                <a
                  href={docPaths(slug)[locale]}
                  aria-current={slug === current ? "page" : undefined}
                  className="block rounded-sm px-2.5 py-1.5 text-[15px] leading-[22px] text-text-secondary hover:text-fg aria-[current=page]:bg-memory aria-[current=page]:font-bold aria-[current=page]:text-fg"
                >
                  {docMeta(locale, slug).title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
