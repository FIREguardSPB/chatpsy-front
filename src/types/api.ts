export interface AnalyzeRequest {
  chat_text: string;
}

export interface ParticipantProfile {
  id: string;
  display_name: string;
  traits: Record<string, string>;
  summary: string;
}

export interface RelationshipSummary {
  description: string;
  red_flags: string[];
  green_flags: string[];
}

export interface Recommendation {
  title: string;
  text: string;
}

export interface ParticipantStats {
  id: string;
  messages_count: number;
  avg_message_length: number;
}

export interface ChatStats {
  total_messages: number;
  participants: ParticipantStats[];
  first_message_at: string | null; // ISO-строка от FastAPI
  last_message_at: string | null;
}

export interface AnalyzeResponse {
  participants: {
    id: string;
    display_name: string;
    traits: Record<string, string>;
    summary: string;
  }[];
  relationship: {
    description: string;
    red_flags: string[];
    green_flags: string[];
  };
  recommendations: {
    title: string;
    text: string;
  }[];
  stats: ChatStats;
  // payment/preview fields
  analysis_id?: string | null;
  is_preview?: boolean;
  payment_required?: boolean;
  // error handling fields
  is_fallback?: boolean;
  error_message?: string | null;
}

export interface ChatMetaResponse {
  stats: ChatStats;
  upload_bytes: number;       // фактический объём текста
  recommended_bytes: number;  // рекомендуемый лимит (например, ~1 МБ)
}
