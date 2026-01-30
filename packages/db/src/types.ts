export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      agent_profiles: {
        Row: {
          id: string;
          name: string;
          dialect_rules: Json | null;
          output_format: Json | null;
        };
        Insert: {
          id: string;
          name: string;
          dialect_rules?: Json | null;
          output_format?: Json | null;
        };
        Update: {
          id?: string;
          name?: string;
          dialect_rules?: Json | null;
          output_format?: Json | null;
        };
      };
      prompt_templates: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          type: string | null;
          mode_compatibility: string[] | null;
          base_structure: string | null;
          placeholders: Json | null;
          is_system: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          type?: string | null;
          mode_compatibility?: string[] | null;
          base_structure?: string | null;
          placeholders?: Json | null;
          is_system?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          type?: string | null;
          mode_compatibility?: string[] | null;
          base_structure?: string | null;
          placeholders?: Json | null;
          is_system?: boolean;
          created_at?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
          ai_provider: string | null;
          ai_api_key_encrypted: string | null;
          ai_model: string | null;
          default_mode: string;
          default_agent: string;
          theme: string;
          token_budget: string;
          linter_strictness: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          ai_provider?: string | null;
          ai_api_key_encrypted?: string | null;
          ai_model?: string | null;
          default_mode?: string;
          default_agent?: string;
          theme?: string;
          token_budget?: string;
          linter_strictness?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          ai_provider?: string | null;
          ai_api_key_encrypted?: string | null;
          ai_model?: string | null;
          default_mode?: string;
          default_agent?: string;
          theme?: string;
          token_budget?: string;
          linter_strictness?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          stack_summary: string | null;
          context_pack: string | null;
          dod_checklist: Json | null;
          default_mode: string | null;
          default_agent: string | null;
          constraints_preset: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          stack_summary?: string | null;
          context_pack?: string | null;
          dod_checklist?: Json | null;
          default_mode?: string | null;
          default_agent?: string | null;
          constraints_preset?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          stack_summary?: string | null;
          context_pack?: string | null;
          dod_checklist?: Json | null;
          default_mode?: string | null;
          default_agent?: string | null;
          constraints_preset?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      prompts: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          agent_profile_id: string | null;
          template_id: string | null;
          mode_used: string;
          input_raw: string;
          input_language: string | null;
          extracted_fields: Json | null;
          output_prompt: string;
          variant_type: string | null;
          strategy: string | null;
          context_injected: string | null;
          tags: string[] | null;
          is_favorite: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          agent_profile_id?: string | null;
          template_id?: string | null;
          mode_used: string;
          input_raw: string;
          input_language?: string | null;
          extracted_fields?: Json | null;
          output_prompt: string;
          variant_type?: string | null;
          strategy?: string | null;
          context_injected?: string | null;
          tags?: string[] | null;
          is_favorite?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string | null;
          agent_profile_id?: string | null;
          template_id?: string | null;
          mode_used?: string;
          input_raw?: string;
          input_language?: string | null;
          extracted_fields?: Json | null;
          output_prompt?: string;
          variant_type?: string | null;
          strategy?: string | null;
          context_injected?: string | null;
          tags?: string[] | null;
          is_favorite?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      prompt_outcomes: {
        Row: {
          id: string;
          prompt_id: string;
          worked: boolean | null;
          rating: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          prompt_id: string;
          worked?: boolean | null;
          rating?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          prompt_id?: string;
          worked?: boolean | null;
          rating?: number | null;
          notes?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
