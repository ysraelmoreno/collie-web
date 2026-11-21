import { FeaturesIndex, indexMetadata } from "@/components/posts/FeaturesIndex";

export const metadata = indexMetadata("en");

export default function Page() {
  return <FeaturesIndex locale="en" />;
}
