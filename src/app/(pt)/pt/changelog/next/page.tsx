import { ChangelogNext } from "@/components/changelog/ChangelogNext";
import { localeMetadata } from "@/i18n";

export const metadata = localeMetadata("pt", "next");

export default function Page() {
  return <ChangelogNext locale="pt" />;
}
