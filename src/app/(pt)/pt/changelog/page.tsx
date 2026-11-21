import { Changelog } from "@/components/changelog/Changelog";
import { localeMetadata } from "@/i18n";

export const metadata = localeMetadata("pt", "changelog");

export default function Page() {
  return <Changelog locale="pt" />;
}
