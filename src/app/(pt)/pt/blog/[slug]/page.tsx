import {
  BlogPost,
  blogPostMetadata,
  blogStaticParams,
} from "@/components/blog/BlogPost";

export const dynamicParams = false;

export const generateStaticParams = () => blogStaticParams("pt");

export async function generateMetadata({
  params,
}: PageProps<"/pt/blog/[slug]">) {
  return blogPostMetadata("pt", (await params).slug);
}

export default async function Page({ params }: PageProps<"/pt/blog/[slug]">) {
  return <BlogPost locale="pt" slug={(await params).slug} />;
}
