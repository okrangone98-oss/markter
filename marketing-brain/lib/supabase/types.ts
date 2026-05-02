// Supabase 데이터베이스 타입 정의
// 스키마는 supabase/migrations/0001_initial_schema.sql과 일치합니다.
// 추후 `supabase gen types` 로 자동 생성 타입으로 교체할 수 있습니다.

// ─────────────────────────────────────────────
// 공용 JSON 타입 (jsonb 컬럼용)
// ─────────────────────────────────────────────
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ─────────────────────────────────────────────
// 1. profiles — 사용자 프로필 (auth.users 확장)
// ─────────────────────────────────────────────
export interface ProfileRow {
  id: string;
  display_name: string | null;
  brand_name: string | null;
  created_at: string;
}

export interface ProfileInsert {
  id: string;
  display_name?: string | null;
  brand_name?: string | null;
  created_at?: string;
}

export interface ProfileUpdate {
  id?: string;
  display_name?: string | null;
  brand_name?: string | null;
  created_at?: string;
}

// ─────────────────────────────────────────────
// 2. wiki_pages — 브랜드 위키 페이지
// ─────────────────────────────────────────────
export interface WikiPageRow {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string | null;
  tags: string[] | null;
  // pgvector 임베딩은 클라이언트 코드에서는 number[]로 다룹니다.
  embedding: number[] | null;
  created_at: string;
  updated_at: string;
}

export interface WikiPageInsert {
  id?: string;
  user_id: string;
  title: string;
  content: string;
  category?: string | null;
  tags?: string[] | null;
  embedding?: number[] | null;
  created_at?: string;
  updated_at?: string;
}

export interface WikiPageUpdate {
  id?: string;
  user_id?: string;
  title?: string;
  content?: string;
  category?: string | null;
  tags?: string[] | null;
  embedding?: number[] | null;
  created_at?: string;
  updated_at?: string;
}

// ─────────────────────────────────────────────
// 3. personas — 타겟 페르소나
// ─────────────────────────────────────────────
export interface PersonaRow {
  id: string;
  user_id: string;
  name: string | null;
  description: string | null;
  pain_points: string[] | null;
  channels: string[] | null;
  voice_preference: string | null;
  created_at: string;
}

export interface PersonaInsert {
  id?: string;
  user_id: string;
  name?: string | null;
  description?: string | null;
  pain_points?: string[] | null;
  channels?: string[] | null;
  voice_preference?: string | null;
  created_at?: string;
}

export interface PersonaUpdate {
  id?: string;
  user_id?: string;
  name?: string | null;
  description?: string | null;
  pain_points?: string[] | null;
  channels?: string[] | null;
  voice_preference?: string | null;
  created_at?: string;
}

// ─────────────────────────────────────────────
// 4. competitors — 경쟁사 추적
// ─────────────────────────────────────────────
export interface CompetitorRow {
  id: string;
  user_id: string;
  name: string | null;
  url: string | null;
  notes: string | null;
  last_checked: string | null;
  created_at: string;
}

export interface CompetitorInsert {
  id?: string;
  user_id: string;
  name?: string | null;
  url?: string | null;
  notes?: string | null;
  last_checked?: string | null;
  created_at?: string;
}

export interface CompetitorUpdate {
  id?: string;
  user_id?: string;
  name?: string | null;
  url?: string | null;
  notes?: string | null;
  last_checked?: string | null;
  created_at?: string;
}

// ─────────────────────────────────────────────
// 5. trends — 트렌드 키워드
// ─────────────────────────────────────────────
export interface TrendRow {
  id: string;
  user_id: string;
  keyword: string | null;
  source: string | null;
  score: number | null;
  matched_brand: boolean | null;
  detected_at: string;
}

export interface TrendInsert {
  id?: string;
  user_id: string;
  keyword?: string | null;
  source?: string | null;
  score?: number | null;
  matched_brand?: boolean | null;
  detected_at?: string;
}

export interface TrendUpdate {
  id?: string;
  user_id?: string;
  keyword?: string | null;
  source?: string | null;
  score?: number | null;
  matched_brand?: boolean | null;
  detected_at?: string;
}

// ─────────────────────────────────────────────
// 6. contents — 생성된 콘텐츠
// ─────────────────────────────────────────────
export interface ContentRow {
  id: string;
  user_id: string;
  type: string | null;
  topic: string | null;
  body: string | null;
  meta: Json | null;
  context_pages: string[] | null;
  refined_versions: Json | null;
  best_score: number | null;
  status: string | null;
  published_at: string | null;
  created_at: string;
}

export interface ContentInsert {
  id?: string;
  user_id: string;
  type?: string | null;
  topic?: string | null;
  body?: string | null;
  meta?: Json | null;
  context_pages?: string[] | null;
  refined_versions?: Json | null;
  best_score?: number | null;
  status?: string | null;
  published_at?: string | null;
  created_at?: string;
}

export interface ContentUpdate {
  id?: string;
  user_id?: string;
  type?: string | null;
  topic?: string | null;
  body?: string | null;
  meta?: Json | null;
  context_pages?: string[] | null;
  refined_versions?: Json | null;
  best_score?: number | null;
  status?: string | null;
  published_at?: string | null;
  created_at?: string;
}

// ─────────────────────────────────────────────
// 7. campaigns — 통합 캠페인
// ─────────────────────────────────────────────
export interface CampaignRow {
  id: string;
  user_id: string;
  title: string | null;
  brief: string | null;
  content_ids: string[] | null;
  schedule: Json | null;
  status: string | null;
  created_at: string;
}

export interface CampaignInsert {
  id?: string;
  user_id: string;
  title?: string | null;
  brief?: string | null;
  content_ids?: string[] | null;
  schedule?: Json | null;
  status?: string | null;
  created_at?: string;
}

export interface CampaignUpdate {
  id?: string;
  user_id?: string;
  title?: string | null;
  brief?: string | null;
  content_ids?: string[] | null;
  schedule?: Json | null;
  status?: string | null;
  created_at?: string;
}

// ─────────────────────────────────────────────
// 8. experiments — 자동 개선 실험
// ─────────────────────────────────────────────
export interface ExperimentRow {
  id: string;
  user_id: string;
  content_id: string | null;
  prompt_version: string | null;
  model: string | null;
  output: string | null;
  judge_score: Json | null;
  judge_critique: string | null;
  iteration: number | null;
  created_at: string;
}

export interface ExperimentInsert {
  id?: string;
  user_id: string;
  content_id?: string | null;
  prompt_version?: string | null;
  model?: string | null;
  output?: string | null;
  judge_score?: Json | null;
  judge_critique?: string | null;
  iteration?: number | null;
  created_at?: string;
}

export interface ExperimentUpdate {
  id?: string;
  user_id?: string;
  content_id?: string | null;
  prompt_version?: string | null;
  model?: string | null;
  output?: string | null;
  judge_score?: Json | null;
  judge_critique?: string | null;
  iteration?: number | null;
  created_at?: string;
}

// ─────────────────────────────────────────────
// 9. performance — 발행 성과
// ─────────────────────────────────────────────
export interface PerformanceRow {
  id: string;
  user_id: string;
  content_id: string | null;
  url: string | null;
  metrics: Json | null;
  measured_at: string;
}

export interface PerformanceInsert {
  id?: string;
  user_id: string;
  content_id?: string | null;
  url?: string | null;
  metrics?: Json | null;
  measured_at?: string;
}

export interface PerformanceUpdate {
  id?: string;
  user_id?: string;
  content_id?: string | null;
  url?: string | null;
  metrics?: Json | null;
  measured_at?: string;
}

// ─────────────────────────────────────────────
// 10. coaching_logs — 코칭 기록
// ─────────────────────────────────────────────
export interface CoachingLogRow {
  id: string;
  user_id: string;
  weak_points: string[] | null;
  suggested_challenge: string | null;
  completed: boolean | null;
  created_at: string;
}

export interface CoachingLogInsert {
  id?: string;
  user_id: string;
  weak_points?: string[] | null;
  suggested_challenge?: string | null;
  completed?: boolean | null;
  created_at?: string;
}

export interface CoachingLogUpdate {
  id?: string;
  user_id?: string;
  weak_points?: string[] | null;
  suggested_challenge?: string | null;
  completed?: boolean | null;
  created_at?: string;
}

// ─────────────────────────────────────────────
// supabase-js 호환 Database 타입
// supabase-js 의 createClient<Database> 제네릭에 그대로 사용 가능합니다.
// ─────────────────────────────────────────────
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [];
      };
      wiki_pages: {
        Row: WikiPageRow;
        Insert: WikiPageInsert;
        Update: WikiPageUpdate;
        Relationships: [];
      };
      personas: {
        Row: PersonaRow;
        Insert: PersonaInsert;
        Update: PersonaUpdate;
        Relationships: [];
      };
      competitors: {
        Row: CompetitorRow;
        Insert: CompetitorInsert;
        Update: CompetitorUpdate;
        Relationships: [];
      };
      trends: {
        Row: TrendRow;
        Insert: TrendInsert;
        Update: TrendUpdate;
        Relationships: [];
      };
      contents: {
        Row: ContentRow;
        Insert: ContentInsert;
        Update: ContentUpdate;
        Relationships: [];
      };
      campaigns: {
        Row: CampaignRow;
        Insert: CampaignInsert;
        Update: CampaignUpdate;
        Relationships: [];
      };
      experiments: {
        Row: ExperimentRow;
        Insert: ExperimentInsert;
        Update: ExperimentUpdate;
        Relationships: [];
      };
      performance: {
        Row: PerformanceRow;
        Insert: PerformanceInsert;
        Update: PerformanceUpdate;
        Relationships: [];
      };
      coaching_logs: {
        Row: CoachingLogRow;
        Insert: CoachingLogInsert;
        Update: CoachingLogUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
