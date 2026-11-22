import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Editor } from "@/components/admin/Editor";
import { getBlogPost } from "@/lib/blog";
import { toSegments } from "@/lib/blocks";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (locale !== "en" && locale !== "pt") notFound();
  const post =
    slug === "new" ? undefined : getBlogPost(locale, slug, { drafts: true });
  if (slug !== "new" && !post) notFound();

  return (
    <>
      <AdminHeader />
      <Editor
        locale={locale}
        originalSlug={post?.slug}
        initial={{
          title: post?.title ?? "",
          slug: post?.slug ?? "",
          date: post?.date ?? new Date().toISOString().slice(0, 10),
          summary: post?.summary ?? "",
          cover: post?.cover ?? "",
          draft: post?.draft ?? true,
          body: post?.body ?? "",
        }}
        initialSegments={toSegments(post?.body ?? "", { strict: false })}
      />
    </>
  );
}
