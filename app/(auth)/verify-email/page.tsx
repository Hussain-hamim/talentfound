import { redirect } from "next/navigation";
import { safeNext } from "@/lib/supabase/config";

// Keep old bookmarks working without a separate verification step.
export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  redirect(`/login?next=${encodeURIComponent(safeNext(next))}`);
}
