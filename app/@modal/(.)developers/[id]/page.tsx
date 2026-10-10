import { DeveloperDetail } from "@/components/platform/developer-detail";

export { generateMetadata } from "@/app/developers/[id]/page";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <DeveloperDetail params={params} modal />;
}
