import { z } from "zod";
export const id = z.string().uuid();
const text = (max = 120) => z.string().trim().min(1).max(max);
const optionalText = (max = 3000) => z.string().trim().max(max).default("");
const url = z
  .string()
  .trim()
  .max(1000)
  .refine(
    (v) => !v || /^https?:\/\//i.test(v),
    "Use a full http:// or https:// link",
  )
  .default("");
const number = (max: number) => z.number().min(0).max(max).nullable();
export const onboardingSchema = z.discriminatedUnion("role", [
  z.object({
    role: z.literal("developer"),
    name: text(100),
    headline: text(),
    location: text(),
    timezone: text(80),
    skills: z.array(text(40)).min(1).max(5),
  }),
  z.object({
    role: z.literal("recruiter"),
    name: text(100),
    company: text(),
    intent: z.enum(["Hiring", "Co-founder", "Collaboration"]),
  }),
]);
export const profileSchema = z
  .object({
    name: text(100),
    headline: text(),
    bio: optionalText(),
    location: text(),
    timezone: text(80),
    category: z.enum([
      "Frontend",
      "Full-stack",
      "Backend",
      "Mobile",
      "Data & AI",
      "DevOps",
      "Other",
    ]),
    skills: z.array(text(40)).max(30),
    experience_years: z.number().int().min(0).max(70).nullable(),
    availability: text(),
    engagements: z
      .array(z.enum(["Freelance", "Full-time", "Co-founder"]))
      .min(1),
    work_style: text(),
    hours_per_week: number(168),
    start_weeks: number(104),
    utc_start: number(23),
    utc_end: number(24),
    hourly_usd: number(100000),
    salary_usd: number(100000000),
    website: url,
    github: url,
    linkedin: url,
  })
  .refine(
    (v) =>
      v.utc_start === null || v.utc_end === null || v.utc_end > v.utc_start,
    { message: "End time must be later than start time", path: ["utc_end"] },
  );
export const projectSchema = z.object({
  id: id.optional(),
  title: text(),
  description: optionalText(4000),
  contribution: optionalText(2000),
  stack: z.array(text(40)).max(30),
  live_url: url,
  repository_url: url,
  image_path: z.string().max(500).nullable().default(null),
  published: z.boolean(),
  position: z.number().int().min(0).max(10000),
});
export const opportunitySchema = z.object({
  id: id.optional(),
  title: text(),
  company: text(),
  engagement: z.enum(["Freelance", "Full-time", "Co-founder"]),
  description: z.string().trim().min(20).max(4000),
  requirements: optionalText(2000),
  budget: optionalText(200),
  timeline: optionalText(200),
  status: z.enum(["draft", "active", "closed"]),
});
export const messageSchema = z.object({
  recipient: id,
  body: z.string().trim().min(1).max(4000),
  client_id: id,
  opportunity: id.nullable().optional(),
});
export const candidateSchema = z.object({
  developer_id: id,
  shortlist_id: id.nullable().optional(),
  opportunity_id: id.nullable().optional(),
  stage: z
    .enum(["shortlisted", "contacted", "interested", "hired", "closed"])
    .default("shortlisted"),
  notes: optionalText(5000),
});
export const reviewSchema = z.object({
  developer_id: id,
  rating: z.number().int().min(1).max(5),
  body: z.string().trim().min(10).max(2000),
});
export const pendingDraftSchema = z.object({
  version: z.literal(1),
  recipient: id,
  handle: text(50),
  body: z.string().max(4000),
  createdAt: z.number(),
  clientId: id.optional(),
  opportunityId: id.optional(),
  invitation: z
    .object({
      title: z.string().max(120),
      company: z.string().max(120),
      engagement: z.enum(["Freelance", "Full-time", "Co-founder"]),
      description: z.string().max(4000),
      budget: z.string().max(200),
      timeline: z.string().max(200),
    })
    .optional(),
});
export type PendingDraft = z.infer<typeof pendingDraftSchema>;
export function parseDraft(
  raw: string | null,
  now = Date.now(),
): PendingDraft | null {
  try {
    const result = pendingDraftSchema.safeParse(JSON.parse(raw || "null"));
    return result.success &&
      now - result.data.createdAt <= 86400000 &&
      result.data.createdAt <= now
      ? result.data
      : null;
  } catch {
    return null;
  }
}
export function splitList(value: string) {
  return [
    ...new Set(
      value
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
    ),
  ];
}
export const filterSchema = z.object({
  q: z.string().max(200).default(""),
  category: z.string().max(40).default(""),
  location: z.string().max(100).default(""),
  engagement: z.string().max(40).default(""),
  availability: z.string().max(100).default(""),
  experience: z.coerce.number().min(0).max(70).default(0),
  hours: z.coerce.number().min(0).max(168).default(0),
  budget: z.coerce.number().min(0).max(100000000).default(0),
  start: z.string().max(3).default(""),
  overlap: z.enum(["", "Europe", "Americas", "Asia"]).default(""),
  sort: z.enum(["relevance", "newest", "top-rated"]).default("relevance"),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  layout: z.enum(["showcase", "compact"]).default("showcase"),
});
export type Filters = z.infer<typeof filterSchema>;
