import { notFound } from "next/navigation";
import { getDeveloper } from "@/lib/platform/data";
import { isDemoProfile } from "@/lib/platform/demo-profiles";
import { socialImage } from "@/components/seo/social-image";
export const alt = "Developer portfolio on TalentFound";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const person = await getDeveloper((await params).id);
  if (!person) notFound();
  return socialImage({
    name: person.member.name,
    headline: person.profile.headline,
    skills: person.profile.skills,
    demo: isDemoProfile(person.profile.handle),
  });
}
