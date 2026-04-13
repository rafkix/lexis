/* ----------------------------------
    1. SKILL TYPE
---------------------------------- */
export type SkillType = "READING" | "LISTENING" | "WRITING" | "SPEAKING";


/* ----------------------------------
    2. USER MOCK EXAM RESPONSE
---------------------------------- */
export interface UserMockExamResponse {
  id: string;
  title: string;
  cefr_level: string;
  price: number;
  is_active: boolean;
  is_purchased: boolean;
  reading_id?: string | null;
  listening_id?: string | null;
  writing_id?: string | null;
  speaking_id?: string | null;
  created_at?: string | null;
}

/* --- Frontend qulayligi uchun kengaytirilgan versiya --- */
export interface ApiMockExam extends UserMockExamResponse {
  description?: string | null;
  image_file?: string | null;
  duration_minutes?: number;
}


/* ----------------------------------
    3. MOCK EXAM START RESPONSE
---------------------------------- */
export interface MockExamStartResponse {
  attempt_id: number;        // Backenddagi Field(..., validation_alias="id")
  mock_exam_id: string;
  started_at: string;
}


/* ----------------------------------
    4. MOCK SKILL SUBMIT PAYLOAD
---------------------------------- */
export interface MockSkillSubmit {
  raw_score: number;
  user_answers?: Record<string, any>;
}


/* ----------------------------------
    5. MOCK SKILL ATTEMPT RESPONSE
---------------------------------- */
export interface MockSkillAttemptResponse {
  id: number;
  attempt_id: number;
  user_id: number;
  skill: SkillType;
  raw_score: number;        // To'g'ri javoblar soni
  scaled_score: number;     // 75 ballik shkala
  cefr_level: string | null;
  is_checked: boolean;
  submitted_at: string | null;
}


/* ----------------------------------
    6. MOCK SKILL STATUS RESPONSE
---------------------------------- */
export interface MockSkillStatusResponse {
  skill: SkillType;
  is_checked: boolean;
  is_submitted?: boolean;
  submitted_at?: string | null;
}


/* ----------------------------------
    7. MOCK EXAM RESULT
---------------------------------- */
export interface MockExamResult {
  id: number;
  attempt_id: number;
  user_id: number;
  reading_ball: number;
  listening_ball: number;
  writing_ball: number;
  speaking_ball: number;
  overall_score: number;     // 4 bo'lim o'rtacha bali
  cefr_level: string;
  created_at: string;
}


/* ----------------------------------
    8. EXAM DETAIL (Dashboard / Page view)
---------------------------------- */
export interface ExamDetail extends ApiMockExam {
  shortDesc?: string;
  category?: "CEFR";
  questions?: number;
  usersCount?: number;
  rating?: number;
  requirements?: string[];
  skills?: SkillType[];
}
