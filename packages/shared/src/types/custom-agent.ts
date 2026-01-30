export interface CustomAgent {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  tone: string | null;
  structure_preference: string | null;
  emphasis: string | null;
  extra_phrase: string | null;
  documentation_url: string | null;
  custom_instructions: string | null;
  icon: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomAgentRequest {
  name: string;
  description?: string;
  tone?: string;
  structure_preference?: string;
  emphasis?: string;
  extra_phrase?: string;
  documentation_url?: string;
  custom_instructions?: string;
  icon?: string;
}

export interface UpdateCustomAgentRequest extends Partial<CreateCustomAgentRequest> {
  is_active?: boolean;
}
