import {
  DocPage,
  docMetadata,
  docsStaticParams,
} from "@/components/docs/DocPage";

export const dynamicParams = false;

export const generateStaticParams = docsStaticParams;

export async function generateMetadata({ params }: PageProps<"/pt/docs/[[...slug]]">) {
  return docMetadata("pt", (await params).slug);
}

export default async function Page({ params }: PageProps<"/pt/docs/[[...slug]]">) {
  return <DocPage locale="pt" slug={(await params).slug} />;
}
