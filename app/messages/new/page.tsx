import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { id } from "@/lib/platform/validation";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ recipient?: string }>;
}) {
  const parsed = id.safeParse((await searchParams).recipient);
  if (!parsed.success) notFound();
  const db = await createClient();
  const { data } = await db
    .from("developer_profiles")
    .select("handle")
    .eq("id", parsed.data)
    .maybeSingle();
  if (!data) notFound();
  redirect(`/developers/${data.handle}/message`);
}
