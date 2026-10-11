import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { avatarSource } from "../../lib/platform/avatar.ts";

test("uploaded avatar paths take priority over cartoon fallbacks", () => {
  const previous = process.env.NEXT_PUBLIC_SUPABASE_URL;
  try {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://photos.example/";
    assert.equal(
      avatarSource({ name: "Member", path: "member-id/photo.webp" }),
      "https://photos.example/storage/v1/object/public/avatars/member-id/photo.webp",
    );
    assert.equal(
      avatarSource({
        name: "Member",
        path: "member-id/photo.webp",
        src: "blob:upload-preview",
      }),
      "blob:upload-preview",
    );
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = previous;
  }
});
test("only members without a photo use a stable local cartoon", () => {
  const src = avatarSource({ name: "Member", path: null });
  assert.equal(src, avatarSource({ name: "Member" }));
  assert.ok(existsSync(new URL(`../../public${src}`, import.meta.url)));
  assert.equal(
    avatarSource({ name: "Member", src: "https://photos.example/real.png" }),
    "https://photos.example/real.png",
  );
});
