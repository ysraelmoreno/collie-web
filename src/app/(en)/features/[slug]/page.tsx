import { Post, postMetadata } from "@/components/posts/Post";
import { postSlugs } from "@/i18n/posts";

export const dynamicParams = false;

export const generateStaticParams = () => postSlugs.map((slug) => ({ slug }));

export async function generateMetadata({
  params,
}: PageProps<"/features/[slug]">) {
  return postMetadata("en", (await params).slug);
}

export default async function Page({ params }: PageProps<"/features/[slug]">) {
  return <Post locale="en" slug={(await params).slug} />;
}
