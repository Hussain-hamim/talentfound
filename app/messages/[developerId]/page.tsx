import { redirect } from "next/navigation";
export default async function Page({
  params,
}: {
  params: Promise<{ developerId: string }>;
}) {
  redirect(`/dashboard/messages/${(await params).developerId}`);
}
