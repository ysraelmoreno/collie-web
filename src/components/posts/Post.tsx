import { notFound } from "next/navigation";
import { FeatureVideo } from "@/components/landing/FeatureVideo";
import { Footer } from "@/components/landing/Closing";
import { Nav } from "@/components/landing/Nav";
import { Container } from "@/components/landing/ui";
import { featuresPath, pageMetadata, postPaths, type Locale } from "@/i18n";
import {
  getPost,
  postsUi,
  type PostBlock,
  type PostSection,
} from "@/i18n/posts";
import { hasClip } from "@/lib/clips";
import { Mono, PromptBox, Rich } from "./parts";
import { Toc } from "./Toc";

export function postMetadata(locale: Locale, slug: string) {
  const post = getPost(locale, slug);
  if (!post) return {};
  return pageMetadata(locale, postPaths(slug), {
    title: `${post.title.replace(/\.$/, "")} — Collie`,
    description: post.lead,
  });
}

const num = (i: number) => String(i + 1).padStart(2, "0");

function Section({
  id,
  n,
  title,
  wide,
  children,
}: {
  id: string;
  n?: string;
  title: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`flex scroll-mt-6 flex-col gap-5 ${wide ? "" : "max-w-[784px]"}`}
    >
      <div className="flex flex-col gap-2">
        {n && <Mono>{n}</Mono>}
        <h2
          id={`${id}-title`}
          className="text-[28px] leading-9 font-extrabold tracking-[-0.02em] lg:text-[32px] lg:leading-10"
        >
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Block({
  block,
  faq,
  noteLabel,
}: {
  block: PostBlock;
  faq: boolean;
  noteLabel: string;
}) {
  switch (block.kind) {
    case "p":
      return (
        <p className="text-base leading-[26px] text-text-secondary">
          <Rich text={block.text} />
        </p>
      );
    case "list":
      return (
        <ul className="flex flex-col gap-3 text-base leading-[26px] text-text-secondary">
          {block.items.map((t) => (
            <li key={t} className="flex gap-3">
              <span aria-hidden="true" className="text-accent-text">
                —
              </span>
              <span className="min-w-0">
                <Rich text={t} />
              </span>
            </li>
          ))}
        </ul>
      );
    case "steps":
      // FAQ answers reuse the steps shape: question = title, answer = body.
      return faq ? (
        <dl>
          {block.items.map((q) => (
            <div
              key={q.title}
              className="border-b border-border py-5 first:pt-0 last:border-b-0"
            >
              <dt className="text-lg leading-7 font-bold">
                <Rich text={q.title} />
              </dt>
              <dd className="mt-1.5 text-base leading-[26px] text-text-secondary">
                <Rich text={q.body} />
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <ol className="flex flex-col gap-3">
          {block.items.map((s, i) => (
            <li
              key={s.title}
              className="flex gap-4 rounded-md border border-border bg-surface p-5 lg:gap-5 lg:p-6"
            >
              <span className="font-mono text-sm leading-7 text-accent-text">
                {num(i)}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <h3 className="text-lg leading-7 font-bold tracking-[-0.01em] lg:text-xl">
                  <Rich text={s.title} />
                </h3>
                <p className="text-base leading-[26px] text-text-secondary">
                  <Rich text={s.body} />
                </p>
                {(s.ask || s.command) && (
                  <div className="mt-1">
                    <PromptBox ask={s.ask} command={s.command} />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      );
    case "code":
      return (
        <pre className="overflow-x-auto rounded-sm bg-surface-2 px-4 py-3 font-mono text-[13px] leading-5">
          {block.lines.join("\n")}
        </pre>
      );
    case "note":
      return (
        <aside className="flex flex-col gap-2 rounded-md border border-border bg-surface p-5">
          <Mono>{noteLabel}</Mono>
          <p className="text-base leading-[26px]">
            <Rich text={block.text} />
          </p>
        </aside>
      );
  }
}

export function Post({ locale, slug }: { locale: Locale; slug: string }) {
  const post = getPost(locale, slug);
  if (!post) notFound();
  const ui = postsUi[locale];
  const related = post.related
    .map((s) => getPost(locale, s))
    .filter((p) => p !== undefined);
  const toc = [
    ...post.sections.map(({ id, title }) => ({ id, title })),
    { id: "commands", title: ui.commands },
  ];

  return (
    <>
      <Nav locale={locale} current="features" switchPaths={postPaths(slug)} />
      <main>
        <Container className="flex flex-col gap-4 pt-10 pb-8 lg:gap-5 lg:pt-[72px] lg:pb-12">
          <p className="flex flex-wrap gap-2 font-mono text-xs leading-4 tracking-[0.12em] text-text-secondary uppercase">
            <a
              href={featuresPath[locale]}
              className="text-accent-text hover:underline"
            >
              {ui.eyebrow}
            </a>
            <span aria-hidden="true">/</span>
            <span>{post.eyebrow}</span>
          </p>
          <h1 className="text-[40px] leading-[44px] font-extrabold tracking-[-0.03em] lg:text-[56px] lg:leading-[60px]">
            {post.title}
          </h1>
          <p className="max-w-[820px] text-lg leading-7 text-text-secondary lg:text-xl lg:leading-[30px]">
            {post.lead}
          </p>
        </Container>

        <Container className="pb-16 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16 lg:pb-24">
          <Toc label={ui.onThisPage} items={toc} />
          <article className="flex min-w-0 flex-col gap-12 lg:gap-16">
            {hasClip(post.mediaId) && (
              // ponytail: the post column is wide enough, so the clip fits the width at any size (no 640px sideways scroll)
              <figure className="flex flex-col gap-3 [&_video]:min-w-0">
                <FeatureVideo id={post.mediaId!} label={post.mediaAlt ?? ""} />
                {post.mediaAlt && (
                  <figcaption className="text-[13px] leading-5 text-text-secondary">
                    {post.mediaAlt}
                  </figcaption>
                )}
              </figure>
            )}

            {post.sections.map((s: PostSection, i) => (
              <Section key={s.id} id={s.id} n={num(i)} title={s.title}>
                {s.blocks.map((b, j) => (
                  <Block
                    key={j}
                    block={b}
                    faq={s.id === "faq"}
                    noteLabel={ui.note}
                  />
                ))}
              </Section>
            ))}

            <Section
              id="commands"
              n={num(post.sections.length)}
              title={ui.commands}
              wide
            >
              <div className="overflow-x-auto rounded-md border border-border bg-surface">
                <table className="w-full text-left">
                  <thead className="max-sm:hidden">
                    <tr className="font-mono text-xs leading-4 tracking-[0.12em] text-text-secondary uppercase">
                      <th scope="col" className="px-5 py-3.5 font-normal">
                        {ui.command}
                      </th>
                      <th scope="col" className="px-5 py-3.5 font-normal">
                        {ui.does}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {post.commands.map((c) => (
                      <tr
                        key={c.command}
                        className="border-t border-border max-sm:block max-sm:px-4 max-sm:py-3 max-sm:first:border-t-0"
                      >
                        <td className="px-5 py-3.5 font-mono text-sm leading-[22px] whitespace-nowrap max-sm:block max-sm:overflow-x-auto max-sm:p-0">
                          {c.command}
                        </td>
                        <td className="px-5 py-3.5 text-[15px] leading-[22px] text-text-secondary max-sm:mt-1 max-sm:block max-sm:p-0">
                          <Rich text={c.does} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            {related.length > 0 && (
              <Section id="related" title={ui.related} wide>
                <ul className="grid gap-4 md:grid-cols-3">
                  {related.map((r) => (
                    <li key={r.slug} className="flex">
                      <a
                        href={postPaths(r.slug)[locale]}
                        className="flex flex-1 flex-col gap-2 rounded-md border border-border bg-surface p-5 hover:border-accent-text"
                      >
                        <Mono>{r.eyebrow}</Mono>
                        <h3 className="text-lg leading-7 font-bold">
                          {r.title}
                        </h3>
                        <p className="text-[15px] leading-[22px] text-text-secondary">
                          {r.lead}
                        </p>
                        <span className="mt-auto pt-1 text-[15px] leading-[22px] text-accent-text">
                          {ui.read}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </article>
        </Container>
      </main>
      <Footer locale={locale} />
    </>
  );
}
