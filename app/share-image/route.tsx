import { socialImage } from "@/components/seo/social-image";
export const dynamic = "force-static";
export function GET() {
  return socialImage();
}
