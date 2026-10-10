import type { Database, Json } from "@/lib/supabase/database.types";
export type Row<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Person = Row<"members">;
export type Developer = Row<"developer_profiles"> & {
  member: Person;
  projects: (Row<"portfolio_projects"> & { imageUrl?: string | null })[];
  reviewCount: number;
  viewCount: number | null;
  rating: number;
  score: number;
  avatarUrl: string | null;
  coverUrl?: string | null;
};
export type InboxItem = {
  id: string;
  other_id: string;
  name: string;
  avatar_path: string | null;
  last_message: string | null;
  last_at: string;
  unread: number;
  blocked: boolean;
};
export type Analytics = {
  views: number;
  projectClicks: number;
  conversations: number;
  invitations: number;
  daily: { day: string; views: number; visitors: number }[];
  visitors: {
    id: string;
    name: string;
    avatar_path: string | null;
    viewed_at: string;
  }[];
};
export type WorkspaceData = {
  member: Person;
  account: Row<"accounts">;
  developer: Row<"developer_profiles"> | null;
  recruiter: Row<"recruiter_profiles"> | null;
  projects: Row<"portfolio_projects">[];
  opportunities: Row<"opportunities">[];
  shortlists: Row<"shortlists">[];
  candidates: Row<"candidates">[];
  savedSearches: Row<"saved_searches">[];
  invitations: Row<"invitations">[];
  inbox: InboxItem[];
  blocks: Row<"blocks">[];
  people: Person[];
  analytics: Analytics;
};
export type { Json };
