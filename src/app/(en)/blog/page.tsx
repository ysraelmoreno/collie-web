import { BlogIndex, blogIndexMetadata } from "@/components/blog/BlogIndex";

export const metadata = blogIndexMetadata("en");

export default function Page() {
  return <BlogIndex locale="en" />;
}
