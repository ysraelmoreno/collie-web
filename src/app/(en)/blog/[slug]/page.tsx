import {
  BlogPost,
  blogPostMetadata,
  blogStaticParams,
} from "@/components/blog/BlogPost";

export const dynamicParams = false;

export const generateStaticParams = () => blogStaticParams("en");

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">) {
  return blogPostMetadata("en", (await params).slug);
}

export default async function Page({ params }: PageProps<"/blog/[slug]">) {
  return <BlogPost locale="en" slug={(await params).slug} />;
}
