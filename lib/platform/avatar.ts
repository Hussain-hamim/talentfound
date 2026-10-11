const defaultAvatars = ["alex", "jamie", "nadia", "sam", "maya", "leo"];

export function avatarSource({
  name,
  src,
  path,
}: {
  name: string;
  src?: string | null;
  path?: string | null;
}) {
  if (src) return src;
  if (path) {
    const origin = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!origin) throw new Error("Avatar storage configuration is missing.");
    return `${origin.replace(/\/$/, "")}/storage/v1/object/public/avatars/${path}`;
  }
  // Stable across server rendering and all profile surfaces.
  let hash = 0;
  for (const character of name.trim().toLowerCase()) {
    hash = (Math.imul(hash, 31) + character.charCodeAt(0)) >>> 0;
  }
  return `/images/avatars/${defaultAvatars[hash % defaultAvatars.length]}.svg`;
}
