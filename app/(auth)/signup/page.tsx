import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
export const metadata: Metadata = { title: "Create your account" };
export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  return (
    <AuthForm key={role ?? "developer"} mode="signup" initialRole={role} />
  );
}
