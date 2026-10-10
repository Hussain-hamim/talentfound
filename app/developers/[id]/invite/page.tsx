import { ContactPage } from "@/components/platform/contact-page";
export const metadata = {
  title: "Invite a developer",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <ContactPage handle={(await params).id} invite />;
}
