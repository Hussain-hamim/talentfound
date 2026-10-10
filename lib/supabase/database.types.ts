export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      accounts: {
        Row: {
          active_workspace: string;
          email_notifications: boolean;
          id: string;
          identify_visits: boolean;
        };
        Insert: {
          active_workspace?: string;
          email_notifications?: boolean;
          id: string;
          identify_visits?: boolean;
        };
        Update: {
          active_workspace?: string;
          email_notifications?: boolean;
          id?: string;
          identify_visits?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "accounts_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
      analytics_events: {
        Row: {
          bucket: string;
          created_at: string;
          developer_id: string;
          id: number;
          kind: string;
          project_id: string | null;
          visitor_hash: string;
          visitor_id: string | null;
        };
        Insert: {
          bucket: string;
          created_at?: string;
          developer_id: string;
          id?: never;
          kind: string;
          project_id?: string | null;
          visitor_hash: string;
          visitor_id?: string | null;
        };
        Update: {
          bucket?: string;
          created_at?: string;
          developer_id?: string;
          id?: never;
          kind?: string;
          project_id?: string | null;
          visitor_hash?: string;
          visitor_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "analytics_events_developer_id_fkey";
            columns: ["developer_id"];
            isOneToOne: false;
            referencedRelation: "developer_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analytics_events_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "portfolio_projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analytics_events_visitor_id_fkey";
            columns: ["visitor_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
      bids: {
        Row: {
          amount_cents: number;
          created_at: string;
          id: string;
          listing_id: string | null;
          metadata: Json;
          payer_id: string;
          payment_id: string | null;
          payment_session_id: string | null;
          platform_fee_cents: number;
          previous_owner_id: string | null;
          seller_credit_cents: number;
          type: string;
        };
        Insert: {
          amount_cents: number;
          created_at?: string;
          id?: string;
          listing_id?: string | null;
          metadata?: Json;
          payer_id: string;
          payment_id?: string | null;
          payment_session_id?: string | null;
          platform_fee_cents?: number;
          previous_owner_id?: string | null;
          seller_credit_cents?: number;
          type: string;
        };
        Update: {
          amount_cents?: number;
          created_at?: string;
          id?: string;
          listing_id?: string | null;
          metadata?: Json;
          payer_id?: string;
          payment_id?: string | null;
          payment_session_id?: string | null;
          platform_fee_cents?: number;
          previous_owner_id?: string | null;
          seller_credit_cents?: number;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bids_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bids_payer_id_fkey";
            columns: ["payer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bids_previous_owner_id_fkey";
            columns: ["previous_owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      blocks: {
        Row: {
          blocked_id: string;
          created_at: string;
          owner_id: string;
        };
        Insert: {
          blocked_id: string;
          created_at?: string;
          owner_id: string;
        };
        Update: {
          blocked_id?: string;
          created_at?: string;
          owner_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "blocks_blocked_id_fkey";
            columns: ["blocked_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "blocks_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
      candidates: {
        Row: {
          created_at: string;
          developer_id: string;
          id: string;
          notes: string;
          opportunity_id: string | null;
          owner_id: string;
          shortlist_id: string | null;
          stage: string;
        };
        Insert: {
          created_at?: string;
          developer_id: string;
          id?: string;
          notes?: string;
          opportunity_id?: string | null;
          owner_id: string;
          shortlist_id?: string | null;
          stage?: string;
        };
        Update: {
          created_at?: string;
          developer_id?: string;
          id?: string;
          notes?: string;
          opportunity_id?: string | null;
          owner_id?: string;
          shortlist_id?: string | null;
          stage?: string;
        };
        Relationships: [
          {
            foreignKeyName: "candidates_developer_id_fkey";
            columns: ["developer_id"];
            isOneToOne: false;
            referencedRelation: "developer_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "candidates_opportunity_id_fkey";
            columns: ["opportunity_id"];
            isOneToOne: false;
            referencedRelation: "opportunities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "candidates_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "candidates_shortlist_id_fkey";
            columns: ["shortlist_id"];
            isOneToOne: false;
            referencedRelation: "shortlists";
            referencedColumns: ["id"];
          },
        ];
      };
      conversation_reads: {
        Row: {
          conversation_id: string;
          member_id: string;
          read_at: string;
        };
        Insert: {
          conversation_id: string;
          member_id: string;
          read_at?: string;
        };
        Update: {
          conversation_id?: string;
          member_id?: string;
          read_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversation_reads_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversation_reads_member_id_fkey";
            columns: ["member_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
      conversations: {
        Row: {
          created_at: string;
          id: string;
          member_a: string;
          member_b: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          member_a: string;
          member_b: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          member_a?: string;
          member_b?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_member_a_fkey";
            columns: ["member_a"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_member_b_fkey";
            columns: ["member_b"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
      developer_profiles: {
        Row: {
          availability: string;
          bio: string;
          category: string;
          created_at: string;
          engagements: string[];
          experience_years: number | null;
          github: string;
          handle: string;
          headline: string;
          hourly_usd: number | null;
          hours_per_week: number | null;
          id: string;
          linkedin: string;
          location: string;
          published: boolean;
          salary_usd: number | null;
          skills: string[];
          start_weeks: number | null;
          timezone: string;
          utc_end: number | null;
          utc_start: number | null;
          website: string;
          work_style: string;
        };
        Insert: {
          availability?: string;
          bio?: string;
          category?: string;
          created_at?: string;
          engagements?: string[];
          experience_years?: number | null;
          github?: string;
          handle: string;
          headline: string;
          hourly_usd?: number | null;
          hours_per_week?: number | null;
          id: string;
          linkedin?: string;
          location: string;
          published?: boolean;
          salary_usd?: number | null;
          skills?: string[];
          start_weeks?: number | null;
          timezone: string;
          utc_end?: number | null;
          utc_start?: number | null;
          website?: string;
          work_style?: string;
        };
        Update: {
          availability?: string;
          bio?: string;
          category?: string;
          created_at?: string;
          engagements?: string[];
          experience_years?: number | null;
          github?: string;
          handle?: string;
          headline?: string;
          hourly_usd?: number | null;
          hours_per_week?: number | null;
          id?: string;
          linkedin?: string;
          location?: string;
          published?: boolean;
          salary_usd?: number | null;
          skills?: string[];
          start_weeks?: number | null;
          timezone?: string;
          utc_end?: number | null;
          utc_start?: number | null;
          website?: string;
          work_style?: string;
        };
        Relationships: [
          {
            foreignKeyName: "developer_profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
      invitations: {
        Row: {
          brief: Json;
          conversation_id: string;
          created_at: string;
          id: string;
          opportunity_id: string | null;
          recipient_id: string;
          sender_id: string;
          status: string;
        };
        Insert: {
          brief: Json;
          conversation_id: string;
          created_at?: string;
          id?: string;
          opportunity_id?: string | null;
          recipient_id: string;
          sender_id: string;
          status?: string;
        };
        Update: {
          brief?: Json;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          opportunity_id?: string | null;
          recipient_id?: string;
          sender_id?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invitations_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invitations_opportunity_id_fkey";
            columns: ["opportunity_id"];
            isOneToOne: false;
            referencedRelation: "opportunities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invitations_recipient_id_fkey";
            columns: ["recipient_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invitations_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
      ledger: {
        Row: {
          amount_cents: number;
          bid_id: string | null;
          created_at: string;
          id: string;
          note: string | null;
          payout_transfer_id: string | null;
          profile_id: string | null;
          type: string;
        };
        Insert: {
          amount_cents: number;
          bid_id?: string | null;
          created_at?: string;
          id?: string;
          note?: string | null;
          payout_transfer_id?: string | null;
          profile_id?: string | null;
          type: string;
        };
        Update: {
          amount_cents?: number;
          bid_id?: string | null;
          created_at?: string;
          id?: string;
          note?: string | null;
          payout_transfer_id?: string | null;
          profile_id?: string | null;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ledger_bid_id_fkey";
            columns: ["bid_id"];
            isOneToOne: false;
            referencedRelation: "bids";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ledger_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      listings: {
        Row: {
          canonical_url: string;
          category: string;
          click_count: number;
          created_at: string;
          current_bid_cents: number;
          description: string;
          favicon_url: string | null;
          id: string;
          owner_id: string;
          pending_credit_cents: number;
          status: string;
          title: string;
          updated_at: string;
          url: string;
        };
        Insert: {
          canonical_url: string;
          category: string;
          click_count?: number;
          created_at?: string;
          current_bid_cents: number;
          description?: string;
          favicon_url?: string | null;
          id?: string;
          owner_id: string;
          pending_credit_cents?: number;
          status?: string;
          title?: string;
          updated_at?: string;
          url: string;
        };
        Update: {
          canonical_url?: string;
          category?: string;
          click_count?: number;
          created_at?: string;
          current_bid_cents?: number;
          description?: string;
          favicon_url?: string | null;
          id?: string;
          owner_id?: string;
          pending_credit_cents?: number;
          status?: string;
          title?: string;
          updated_at?: string;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "listings_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      members: {
        Row: {
          avatar_path: string | null;
          created_at: string;
          id: string;
          name: string;
        };
        Insert: {
          avatar_path?: string | null;
          created_at?: string;
          id: string;
          name: string;
        };
        Update: {
          avatar_path?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          body: string;
          conversation_id: string;
          created_at: string;
          id: string;
          invitation_id: string | null;
          sender_id: string;
        };
        Insert: {
          body: string;
          conversation_id: string;
          created_at?: string;
          id: string;
          invitation_id?: string | null;
          sender_id: string;
        };
        Update: {
          body?: string;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          invitation_id?: string | null;
          sender_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_invitation_id_fkey";
            columns: ["invitation_id"];
            isOneToOne: false;
            referencedRelation: "invitations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
      opportunities: {
        Row: {
          budget: string;
          company: string;
          created_at: string;
          description: string;
          engagement: string;
          id: string;
          owner_id: string;
          requirements: string;
          status: string;
          timeline: string;
          title: string;
        };
        Insert: {
          budget?: string;
          company: string;
          created_at?: string;
          description: string;
          engagement: string;
          id?: string;
          owner_id: string;
          requirements?: string;
          status?: string;
          timeline?: string;
          title: string;
        };
        Update: {
          budget?: string;
          company?: string;
          created_at?: string;
          description?: string;
          engagement?: string;
          id?: string;
          owner_id?: string;
          requirements?: string;
          status?: string;
          timeline?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "opportunities_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
      portfolio_projects: {
        Row: {
          contribution: string;
          created_at: string;
          description: string;
          id: string;
          image_path: string | null;
          live_url: string;
          owner_id: string;
          position: number;
          published: boolean;
          repository_url: string;
          stack: string[];
          title: string;
        };
        Insert: {
          contribution?: string;
          created_at?: string;
          description?: string;
          id?: string;
          image_path?: string | null;
          live_url?: string;
          owner_id: string;
          position?: number;
          published?: boolean;
          repository_url?: string;
          stack?: string[];
          title: string;
        };
        Update: {
          contribution?: string;
          created_at?: string;
          description?: string;
          id?: string;
          image_path?: string | null;
          live_url?: string;
          owner_id?: string;
          position?: number;
          published?: boolean;
          repository_url?: string;
          stack?: string[];
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "portfolio_projects_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "developer_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      presence_sessions: {
        Row: {
          last_seen: string;
          session_id: string;
        };
        Insert: {
          last_seen?: string;
          session_id: string;
        };
        Update: {
          last_seen?: string;
          session_id?: string;
        };
        Relationships: [];
      };
      processed_payment_events: {
        Row: {
          event_id: string;
          processed_at: string;
        };
        Insert: {
          event_id: string;
          processed_at?: string;
        };
        Update: {
          event_id?: string;
          processed_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          dodo_customer_id: string | null;
          email: string | null;
          id: string;
          updated_at: string;
          withdrawable_cents: number;
        };
        Insert: {
          created_at?: string;
          dodo_customer_id?: string | null;
          email?: string | null;
          id: string;
          updated_at?: string;
          withdrawable_cents?: number;
        };
        Update: {
          created_at?: string;
          dodo_customer_id?: string | null;
          email?: string | null;
          id?: string;
          updated_at?: string;
          withdrawable_cents?: number;
        };
        Relationships: [];
      };
      recruiter_profiles: {
        Row: {
          bio: string;
          company: string;
          id: string;
          intent: string;
        };
        Insert: {
          bio?: string;
          company: string;
          id: string;
          intent?: string;
        };
        Update: {
          bio?: string;
          company?: string;
          id?: string;
          intent?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recruiter_profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
      reports: {
        Row: {
          created_at: string;
          id: string;
          reason: string;
          reporter_id: string;
          target_id: string;
          target_type: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          reason: string;
          reporter_id: string;
          target_id: string;
          target_type: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          reason?: string;
          reporter_id?: string;
          target_id?: string;
          target_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey";
            columns: ["reporter_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
      review_replies: {
        Row: {
          body: string;
          created_at: string;
          developer_id: string;
          review_id: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          developer_id: string;
          review_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          developer_id?: string;
          review_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "review_replies_developer_id_fkey";
            columns: ["developer_id"];
            isOneToOne: false;
            referencedRelation: "developer_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "review_replies_review_id_fkey";
            columns: ["review_id"];
            isOneToOne: true;
            referencedRelation: "reviews";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: {
          body: string;
          created_at: string;
          developer_id: string;
          id: string;
          rating: number;
          reviewer_id: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          developer_id: string;
          id?: string;
          rating: number;
          reviewer_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          developer_id?: string;
          id?: string;
          rating?: number;
          reviewer_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_developer_id_fkey";
            columns: ["developer_id"];
            isOneToOne: false;
            referencedRelation: "developer_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey";
            columns: ["reviewer_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
      saved_searches: {
        Row: {
          created_at: string;
          filters: Json;
          id: string;
          name: string;
          owner_id: string;
        };
        Insert: {
          created_at?: string;
          filters?: Json;
          id?: string;
          name: string;
          owner_id: string;
        };
        Update: {
          created_at?: string;
          filters?: Json;
          id?: string;
          name?: string;
          owner_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "saved_searches_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
      shortlists: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          owner_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          owner_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          owner_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shortlists_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
      site_stats: {
        Row: {
          id: number;
          updated_at: string;
          visitor_count: number;
        };
        Insert: {
          id?: number;
          updated_at?: string;
          visitor_count?: number;
        };
        Update: {
          id?: number;
          updated_at?: string;
          visitor_count?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      claim_notification_batches: { Args: never; Returns: Json };
      complete_onboarding: { Args: { payload: Json }; Returns: string };
      finish_notification_batch: {
        Args: { batch: string; failure?: string; success: boolean };
        Returns: undefined;
      };
      mark_read: { Args: { conversation: string }; Returns: undefined };
      notification_batch_allowed: { Args: { batch: string }; Returns: boolean };
      profile_analytics: { Args: { days?: number }; Returns: Json };
      record_profile_event: {
        Args: {
          developer: string;
          event_kind: string;
          project?: string;
          rate_key: string;
          visitor: string;
          visitor_key: string;
        };
        Returns: boolean;
      };
      reorder_projects: { Args: { project_ids: string[] }; Returns: undefined };
      respond_invitation: {
        Args: { invitation: string; response: string };
        Returns: undefined;
      };
      search_developers: { Args: { filters?: Json }; Returns: Json };
      send_message: {
        Args: {
          body: string;
          client_id: string;
          opportunity?: string;
          recipient: string;
        };
        Returns: string;
      };
      talentfound_inbox: { Args: never; Returns: Json };
      workspace_snapshot: { Args: never; Returns: Json };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
