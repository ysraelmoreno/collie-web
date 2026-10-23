import { RootDocument } from "@/components/RootDocument";
import { localeMetadata } from "@/i18n";

export const metadata = localeMetadata("pt");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootDocument locale="pt">{children}</RootDocument>;
}
