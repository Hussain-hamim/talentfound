import test from "node:test";
import assert from "node:assert/strict";
import { publicMetadata, jsonLd, siteUrl } from "../lib/seo/metadata.ts";

test("public metadata uses the configured domain for canonicals and social images", () => {
  const original = process.env.NEXT_PUBLIC_APP_URL;
  const environment = process.env.VERCEL_ENV;
  try {
    process.env.NEXT_PUBLIC_APP_URL = "https://talent.example/";
    process.env.VERCEL_ENV = "production";
    const metadata = publicMetadata({
      title: "Find developers",
      description: "Explore work",
      path: "/developers",
    });
    assert.equal(siteUrl(), "https://talent.example");
    assert.equal(
      metadata.alternates.canonical,
      "https://talent.example/developers",
    );
    assert.equal(
      metadata.openGraph.images[0].url,
      "https://talent.example/share-image",
    );
    assert.equal(metadata.twitter.card, "summary_large_image");
    assert.equal(metadata.robots.index, true);
    assert.equal(
      publicMetadata({
        title: "Demo",
        description: "Sample",
        path: "/developers/demo",
        index: false,
      }).robots.index,
      false,
    );
    process.env.VERCEL_ENV = "preview";
    assert.equal(
      publicMetadata({ title: "Preview", description: "Preview", path: "/" })
        .robots.index,
      false,
    );
    process.env.VERCEL_ENV = "production";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    assert.equal(
      publicMetadata({ title: "Local", description: "Local", path: "/" }).robots
        .index,
      false,
    );
  } finally {
    if (original === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
    else process.env.NEXT_PUBLIC_APP_URL = original;
    if (environment === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = environment;
  }
});
test("profile JSON-LD cannot terminate its script element", () => {
  const name = '</script><script>alert("x")</script>';
  const result = jsonLd({ name });
  assert.ok(!result.includes("<"));
  assert.equal(JSON.parse(result).name, name);
});
