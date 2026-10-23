import { RootDocument } from "@/components/RootDocument";
import { localeMetadata } from "@/i18n";

export const metadata = localeMetadata("en");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootDocument locale="en">{children}</RootDocument>;
}
