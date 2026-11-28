import {
  DocPage,
  docMetadata,
  docsStaticParams,
} from "@/components/docs/DocPage";

export const dynamicParams = false;

export const generateStaticParams = docsStaticParams;

export async function generateMetadata({ params }: PageProps<"/docs/[[...slug]]">) {
  return docMetadata("en", (await params).slug);
}

export default async function Page({ params }: PageProps<"/docs/[[...slug]]">) {
  return <DocPage locale="en" slug={(await params).slug} />;
}
