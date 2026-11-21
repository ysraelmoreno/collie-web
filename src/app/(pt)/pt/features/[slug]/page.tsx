import { Post, postMetadata } from "@/components/posts/Post";
import { postSlugs } from "@/i18n/posts";

export const dynamicParams = false;

export const generateStaticParams = () => postSlugs.map((slug) => ({ slug }));

export async function generateMetadata({
  params,
}: PageProps<"/pt/features/[slug]">) {
  return postMetadata("pt", (await params).slug);
}

export default async function Page({
  params,
}: PageProps<"/pt/features/[slug]">) {
  return <Post locale="pt" slug={(await params).slug} />;
}
