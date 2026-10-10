import type { ReactNode } from "react";
import { ProfileModal } from "@/components/platform/profile-modal";

export default function Layout({ children }: { children: ReactNode }) {
  return <ProfileModal>{children}</ProfileModal>;
}
