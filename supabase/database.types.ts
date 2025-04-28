export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type Database = {
    graphql_public: {
        Tables: {
            [_ in never]: never;
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            graphql: {
                Args: {
                    operationName?: string;
                    query?: string;
                    variables?: Json;
                    extensions?: Json;
                };
                Returns: Json;
            };
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
    public: {
        Tables: {
            assets: {
                Row: {
                    created_at: string | null;
                    file_path: string;
                    file_size: number;
                    file_type: string | null;
                    id: string;
                    user_id: string;
                    website_id: string | null;
                };
                Insert: {
                    created_at?: string | null;
                    file_path: string;
                    file_size: number;
                    file_type?: string | null;
                    id?: string;
                    user_id: string;
                    website_id?: string | null;
                };
                Update: {
                    created_at?: string | null;
                    file_path?: string;
                    file_size?: number;
                    file_type?: string | null;
                    id?: string;
                    user_id?: string;
                    website_id?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "assets_website_id_fkey";
                        columns: ["website_id"];
                        isOneToOne: false;
                        referencedRelation: "websites";
                        referencedColumns: ["id"];
                    },
                ];
            };
            domains: {
                Row: {
                    created_at: string | null;
                    domain: string;
                    id: string;
                    is_custom: boolean | null;
                    updated_at: string | null;
                    user_id: string;
                    website_id: string;
                };
                Insert: {
                    created_at?: string | null;
                    domain: string;
                    id?: string;
                    is_custom?: boolean | null;
                    updated_at?: string | null;
                    user_id: string;
                    website_id: string;
                };
                Update: {
                    created_at?: string | null;
                    domain?: string;
                    id?: string;
                    is_custom?: boolean | null;
                    updated_at?: string | null;
                    user_id?: string;
                    website_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "domains_website_id_fkey";
                        columns: ["website_id"];
                        isOneToOne: false;
                        referencedRelation: "websites";
                        referencedColumns: ["id"];
                    },
                ];
            };
            plans: {
                Row: {
                    created_at: string | null;
                    id: string;
                    max_llm_requests_per_day: number | null;
                    max_routes_per_website: number | null;
                    max_storage_mb: number | null;
                    max_websites: number | null;
                    name: string;
                };
                Insert: {
                    created_at?: string | null;
                    id?: string;
                    max_llm_requests_per_day?: number | null;
                    max_routes_per_website?: number | null;
                    max_storage_mb?: number | null;
                    max_websites?: number | null;
                    name: string;
                };
                Update: {
                    created_at?: string | null;
                    id?: string;
                    max_llm_requests_per_day?: number | null;
                    max_routes_per_website?: number | null;
                    max_storage_mb?: number | null;
                    max_websites?: number | null;
                    name?: string;
                };
                Relationships: [];
            };
            routes: {
                Row: {
                    created_at: string | null;
                    html_file_path: string;
                    id: string;
                    path: string;
                    website_id: string;
                };
                Insert: {
                    created_at?: string | null;
                    html_file_path: string;
                    id?: string;
                    path: string;
                    website_id: string;
                };
                Update: {
                    created_at?: string | null;
                    html_file_path?: string;
                    id?: string;
                    path?: string;
                    website_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "routes_website_id_fkey";
                        columns: ["website_id"];
                        isOneToOne: false;
                        referencedRelation: "websites";
                        referencedColumns: ["id"];
                    },
                ];
            };
            user_subscriptions: {
                Row: {
                    expires_at: string | null;
                    id: string;
                    plan_id: string;
                    subscribed_at: string | null;
                    user_id: string;
                };
                Insert: {
                    expires_at?: string | null;
                    id?: string;
                    plan_id: string;
                    subscribed_at?: string | null;
                    user_id: string;
                };
                Update: {
                    expires_at?: string | null;
                    id?: string;
                    plan_id?: string;
                    subscribed_at?: string | null;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "user_subscriptions_plan_id_fkey";
                        columns: ["plan_id"];
                        isOneToOne: false;
                        referencedRelation: "plans";
                        referencedColumns: ["id"];
                    },
                ];
            };
            user_usage: {
                Row: {
                    asset_storage_used_mb: number | null;
                    created_at: string | null;
                    daily_llm_requests: number | null;
                    id: string;
                    total_llm_requests: number | null;
                    updated_at: string | null;
                    user_id: string;
                };
                Insert: {
                    asset_storage_used_mb?: number | null;
                    created_at?: string | null;
                    daily_llm_requests?: number | null;
                    id?: string;
                    total_llm_requests?: number | null;
                    updated_at?: string | null;
                    user_id: string;
                };
                Update: {
                    asset_storage_used_mb?: number | null;
                    created_at?: string | null;
                    daily_llm_requests?: number | null;
                    id?: string;
                    total_llm_requests?: number | null;
                    updated_at?: string | null;
                    user_id?: string;
                };
                Relationships: [];
            };
            websites: {
                Row: {
                    created_at: string | null;
                    domain: string;
                    id: string;
                    is_first_visit: boolean | null;
                    is_published: boolean | null;
                    updated_at: string | null;
                    user_id: string;
                };
                Insert: {
                    created_at?: string | null;
                    domain: string;
                    id?: string;
                    is_first_visit?: boolean | null;
                    is_published?: boolean | null;
                    updated_at?: string | null;
                    user_id: string;
                };
                Update: {
                    created_at?: string | null;
                    domain?: string;
                    id?: string;
                    is_first_visit?: boolean | null;
                    is_published?: boolean | null;
                    updated_at?: string | null;
                    user_id?: string;
                };
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            reset_daily_usage: {
                Args: Record<PropertyKey, never>;
                Returns: undefined;
            };
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
    DefaultSchemaTableNameOrOptions extends
        | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
        | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database;
    }
        ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
              Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
        : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
          Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
        | keyof DefaultSchema["Tables"]
        | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database;
    }
        ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
        : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
        | keyof DefaultSchema["Tables"]
        | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database;
    }
        ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
        : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
        | keyof DefaultSchema["Enums"]
        | { schema: keyof Database },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof Database;
    }
        ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
        : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
      ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
      : never;

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
        | keyof DefaultSchema["CompositeTypes"]
        | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database;
    }
        ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
        : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
      ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
      : never;

export const Constants = {
    graphql_public: {
        Enums: {},
    },
    public: {
        Enums: {},
    },
} as const;
