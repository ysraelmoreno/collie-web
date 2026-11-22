import { BlogIndex, blogIndexMetadata } from "@/components/blog/BlogIndex";

export const metadata = blogIndexMetadata("pt");

export default function Page() {
  return <BlogIndex locale="pt" />;
}
