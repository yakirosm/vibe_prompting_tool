export type CustomTweakCategory = 'skill' | 'behavior' | 'custom';

export interface CustomTweak {
  id: string;
  user_id: string;
  name: string;
  short_name: string;
  instruction: string;
  description: string | null;
  category: CustomTweakCategory;
  icon: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomTweakRequest {
  name: string;
  short_name: string;
  instruction: string;
  description?: string;
  category?: CustomTweakCategory;
  icon?: string;
}

export interface UpdateCustomTweakRequest extends Partial<CreateCustomTweakRequest> {
  is_active?: boolean;
}
