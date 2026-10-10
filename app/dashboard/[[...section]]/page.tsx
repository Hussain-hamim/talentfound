import { notFound } from "next/navigation";
import { workspaceData, searchDevelopers } from "@/lib/platform/data";
import { requireMember } from "@/lib/platform/session";
import { Workspace } from "@/components/platform/workspace";
import { Directory } from "@/components/platform/directory";
import "../dashboard.css";
export const metadata = {
  title: "Your workspace",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ section?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const path = (await params).section || [];
  const section = path[0] || "overview";
  if (
    ![
      "overview",
      "profile",
      "projects",
      "talent",
      "shortlists",
      "opportunities",
      "invitations",
      "messages",
      "analytics",
      "settings",
    ].includes(section) ||
    path.length > 2 ||
    (path.length === 2 && section !== "messages")
  )
    notFound();
  await requireMember("/dashboard" + (path.length ? "/" + path.join("/") : ""));
  const data = await workspaceData();
  if ((section === "projects" || section === "analytics") && !data.developer)
    notFound();
  return (
    <Workspace
      key={data.member.id + section}
      initialData={data}
      section={section}
      conversationId={path[1]}
    >
      {section === "talent" ? (
        <Directory
          {...await searchDevelopers(await searchParams)}
          signedIn
          viewerId={data.member.id}
          compactHeading
        />
      ) : null}
    </Workspace>
  );
}
