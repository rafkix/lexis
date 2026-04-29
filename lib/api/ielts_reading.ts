// lib/api/ielts.ts
import { api } from "./client";

// ══════════════════════════════════════════════════════════════════════
// ENUMS
// ══════════════════════════════════════════════════════════════════════

export type DifficultyEnum = "EASY" | "MEDIUM" | "HARD";

export type QuestionTypeEnum =
  | "MATCHING_INFORMATION"
  | "MATCHING_HEADINGS"
  | "SUMMARY_COMPLETION"
  | "SUMMARY_COMPLETION_DRAG_DROP"
  | "SENTENCE_COMPLETION"
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE_NOT_GIVEN"
  | "YES_NO_NOT_GIVEN";

export type AnswerStatusEnum = "CORRECT" | "INCORRECT" | "UNANSWERED";

/**
 * PRACTICE — unlimited attempts, results shown immediately (FREE+)
 * EXAM     — one submission per test, real IELTS conditions (PRO only)
 */
export type AttemptModeEnum = "PRACTICE" | "EXAM";

/**
 * FULL — entire test (all 3 parts)          — available to all tiers
 * PART — a single passage in isolation      — PREMIUM and PRO only
 */
export type AttemptScopeEnum = "FULL" | "PART";

/**
 * FREE    — free tests only, PRACTICE + FULL scope
 * PREMIUM — all tests, PRACTICE + FULL or PART scope
 * PRO     — everything above + EXAM mode
 */
export type SubscriptionTierEnum = "FREE" | "PREMIUM" | "PRO";

// ══════════════════════════════════════════════════════════════════════
// TYPES — Tests
// ══════════════════════════════════════════════════════════════════════

export interface ReadingTestListOut {
  id: string;
  global_title: string;
  is_active: boolean;
  /** When true the test is accessible to FREE-tier users. */
  is_free: boolean;
  /** Question types present in this test — used for client-side filtering. */
  question_types: QuestionTypeEnum[];
  created_at: string;
  parts_count: number;
}

export interface OptionOut {
  id: number;
  option_key: string;
  option_text: string;
  order_index: number;
}

export interface SubQuestionOut {
  id: number;
  question_number: number;
  question_text: string | null;
  points: number;
}

export interface QuestionGroupOut {
  id: number;
  question_number: number;
  type: QuestionTypeEnum;
  instruction: string | null;
  question_text: string | null;
  context: string | null;
  heading_options: unknown | null;
  table_data: unknown | null;
  points: number;
  is_active: boolean;
  sub_questions: SubQuestionOut[];
  options: OptionOut[];
}

export interface ReadingPartOut {
  id: number;
  part: number;
  title: string;
  content: string;
  time_limit_minutes: number;
  difficulty: DifficultyEnum;
  is_active: boolean;
  total_questions: number;
  created_at: string;
  question_groups: QuestionGroupOut[];
}

export interface ReadingTestOut {
  id: string;
  global_title: string;
  is_active: boolean;
  is_free: boolean;
  question_types: QuestionTypeEnum[];
  created_at: string;
  parts: ReadingPartOut[];
}

// ══════════════════════════════════════════════════════════════════════
// TYPES — Attempts
// ══════════════════════════════════════════════════════════════════════

export interface StartAttemptIn {
  test_id: string;
  /** Defaults to PRACTICE. EXAM requires PRO subscription. */
  mode?: AttemptModeEnum;
  /** Defaults to FULL. PART requires PREMIUM or PRO subscription. */
  scope?: AttemptScopeEnum;
  /** Required when scope is PART. */
  part_id?: number | null;
}

export interface StartAttemptOut {
  attempt_id: number;
  started_at: string;
  test_id: string;
  mode: AttemptModeEnum;
  scope: AttemptScopeEnum;
  part_id: number | null;
}

export interface AnswerIn {
  sub_question_id: number;
  given_answer: string | null;
}

export interface SubmitAnswersIn {
  attempt_id: number;
  answers: AnswerIn[];
}

export interface QuestionResultOut {
  sub_question_id: number;
  question_number: number;
  given_answer: string | null;
  correct_answer: string | null;
  status: AnswerStatusEnum;
  explanation: string | null;
  from_passage: string | null;
}

export interface AttemptResultOut {
  attempt_id: number;
  test_id: string;
  user_id: string;
  mode: AttemptModeEnum;
  scope: AttemptScopeEnum;
  part_id: number | null;
  started_at: string;
  finished_at: string | null;
  is_completed: boolean;
  total_questions: number;
  correct_count: number;
  incorrect_count: number;
  unanswered_count: number;
  score_percent: number;
  band_score: number | null;
  time_spent_sec: number | null;
  question_results: QuestionResultOut[];
}

export interface AttemptHistoryOut {
  attempt_id: number;
  test_id: string;
  global_title: string;
  mode: AttemptModeEnum;
  scope: AttemptScopeEnum;
  part_id: number | null;
  started_at: string;
  finished_at: string | null;
  is_completed: boolean;
  score_percent: number;
  band_score: number | null;
  correct_count: number;
  total_questions: number;
}

// ══════════════════════════════════════════════════════════════════════
// TYPES — Analysis
// ══════════════════════════════════════════════════════════════════════

export interface QuestionTypeStatOut {
  correct: number;
  incorrect: number;
  unanswered: number;
  total: number;
  accuracy_pct: number;
}

export interface PartStatOut {
  title: string;
  correct: number;
  incorrect: number;
  unanswered: number;
  total: number;
  accuracy_pct: number;
}

export interface PerQuestionDetailOut {
  question_number: number;
  question_type: QuestionTypeEnum;
  part: number;
  part_title: string;
  status: AnswerStatusEnum;
  given_answer: string | null;
  correct_answer: string | null;
  explanation: string | null;
  from_passage: string | null;
}

export interface AttemptAnalysisOut {
  attempt_id: number;
  created_at: string;
  /** key: QuestionTypeEnum value */
  question_type_breakdown: Record<string, QuestionTypeStatOut>;
  /** key: part number as string ("1" | "2" | "3") */
  part_breakdown: Record<string, PartStatOut>;
  weak_question_types: QuestionTypeEnum[];
  per_question_detail: PerQuestionDetailOut[];
  avg_time_per_question_sec: number | null;
}

// ══════════════════════════════════════════════════════════════════════
// TYPES — Progress
// ══════════════════════════════════════════════════════════════════════

export interface ProgressPointOut {
  attempt_id: number;
  test_id: string;
  global_title: string;
  mode: AttemptModeEnum;
  scope: AttemptScopeEnum;
  finished_at: string;
  band_score: number;
  score_percent: number;
  correct_count: number;
  total_questions: number;
  time_spent_sec: number | null;
}

export interface WeakTypeProgressOut {
  question_type: QuestionTypeEnum;
  trend: Array<{
    finished_at: string;
    accuracy_pct: number;
    attempt_id: number;
  }>;
}

export interface ProgressOut {
  total_attempts: number;
  best_band_score: number | null;
  latest_band_score: number | null;
  avg_band_score: number | null;
  band_trend: ProgressPointOut[];
  /** key: QuestionTypeEnum value */
  overall_type_accuracy: Record<string, number>;
  top_weak_types: QuestionTypeEnum[];
  type_trends: WeakTypeProgressOut[];
}

// ══════════════════════════════════════════════════════════════════════
// TYPES — Admin create
// ══════════════════════════════════════════════════════════════════════

export interface OptionCreate {
  option_key: string;
  option_text: string;
  order_index?: number;
  is_correct?: boolean;
  explanation?: string | null;
  from_passage?: string | null;
}

export interface SubQuestionCreate {
  question_number: number;
  question_text?: string | null;
  points?: number;
  correct_answer?: string | null;
  explanation?: string | null;
  from_passage?: string | null;
}

export interface QuestionGroupCreate {
  question_number: number;
  type: QuestionTypeEnum;
  instruction?: string | null;
  question_text?: string | null;
  context?: string | null;
  heading_options?: unknown | null;
  table_data?: unknown | null;
  points?: number;
  is_active?: boolean;
  sub_questions?: SubQuestionCreate[];
  options?: OptionCreate[];
}

export interface ReadingPartCreate {
  part: number;
  title: string;
  content: string;
  time_limit_minutes?: number;
  difficulty?: DifficultyEnum;
  is_active?: boolean;
  total_questions?: number;
  question_groups?: QuestionGroupCreate[];
}

export interface ReadingTestCreate {
  global_title: string;
  is_active?: boolean;
  /** Mark true to expose this test to FREE-tier users. */
  is_free?: boolean;
  /** All question types present in this test (used for filtering). */
  question_types?: QuestionTypeEnum[];
  parts?: ReadingPartCreate[];
}

export interface SuccessResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

// ══════════════════════════════════════════════════════════════════════
// QUERY PARAM TYPES
// ══════════════════════════════════════════════════════════════════════

export interface ListTestsParams {
  skip?: number;
  limit?: number;
  /** Filter to tests that contain this question type. */
  question_type?: QuestionTypeEnum;
  /** When true, only free tests are returned regardless of subscription. */
  free_only?: boolean;
}

export interface ListAttemptsParams {
  skip?: number;
  limit?: number;
  /** Admin only: filter by a specific user's UUID. */
  user_id?: string;
}

// ══════════════════════════════════════════════════════════════════════
// URL PATHS
// ══════════════════════════════════════════════════════════════════════

const BASE = "/ielts/reading";

export const IELTS_PATHS = {
  // ── Tests (public / tier-aware) ──────────────────────────────────
  tests: {
    list: `${BASE}/tests`,
    detail: (testId: string) => `${BASE}/tests/${testId}`,
  },

  // ── Attempts (authenticated user) ────────────────────────────────
  attempts: {
    start: `${BASE}/attempts/start`,
    submit: `${BASE}/attempts/submit`,
    history: `${BASE}/attempts/history`,
    progress: `${BASE}/attempts/progress`,
    result: (attemptId: number) => `${BASE}/attempts/${attemptId}/result`,
    analysis: (attemptId: number) => `${BASE}/attempts/${attemptId}/analysis`,
  },

  // ── Admin ─────────────────────────────────────────────────────────
  admin: {
    createTest: `${BASE}/admin/tests`,
    deleteTest: (testId: string) => `${BASE}/admin/tests/${testId}`,
    attempts: `${BASE}/admin/attempts`,
    analysis: (attemptId: number) =>
      `${BASE}/admin/attempts/${attemptId}/analysis`,
  },
} as const;

// ══════════════════════════════════════════════════════════════════════
// API FUNCTIONS — Tests
// ══════════════════════════════════════════════════════════════════════

/**
 * GET /ielts/reading/tests
 *
 * Returns a paginated list of active tests (no passage content).
 * FREE-tier users only see tests where `is_free=true`.
 * Optionally filter by `question_type` or set `free_only=true`.
 */
export async function listTests(
  params?: ListTestsParams,
): Promise<ReadingTestListOut[]> {
  const { data } = await api.get<ReadingTestListOut[]>(IELTS_PATHS.tests.list, {
    params,
  });
  return data;
}

/**
 * GET /ielts/reading/tests/:testId
 *
 * Returns the full test with passage content and all question groups.
 * Correct answers are never included.
 * Requires PREMIUM or PRO subscription for tests where `is_free=false`.
 */
export async function getTest(testId: string): Promise<ReadingTestOut> {
  const { data } = await api.get<ReadingTestOut>(
    IELTS_PATHS.tests.detail(testId),
  );
  return data;
}

// ══════════════════════════════════════════════════════════════════════
// API FUNCTIONS — Attempts
// ══════════════════════════════════════════════════════════════════════

/**
 * POST /ielts/reading/attempts/start
 *
 * Creates a new attempt for the authenticated user.
 *
 * Subscription rules enforced by the server:
 *   FREE    — mode=PRACTICE, scope=FULL, free tests only
 *   PREMIUM — mode=PRACTICE, scope=FULL or PART, all tests
 *   PRO     — any mode and scope, all tests
 *
 * When scope=PART, part_id is required.
 * Requires USER role.
 */
export async function startAttempt(
  payload: StartAttemptIn,
): Promise<StartAttemptOut> {
  const { data } = await api.post<StartAttemptOut>(
    IELTS_PATHS.attempts.start,
    payload,
  );
  return data;
}

/**
 * POST /ielts/reading/attempts/submit
 *
 * Submits all answers for an in-progress attempt, grades them, calculates
 * the IELTS band score, and persists a detailed AttemptAnalysis.
 * An attempt can only be submitted once.
 * Requires USER role.
 */
export async function submitAttempt(
  payload: SubmitAnswersIn,
): Promise<AttemptResultOut> {
  const { data } = await api.post<AttemptResultOut>(
    IELTS_PATHS.attempts.submit,
    payload,
  );
  return data;
}

/**
 * GET /ielts/reading/attempts/history
 *
 * Returns the authenticated user's own attempt history (most recent first).
 * Each entry includes mode (PRACTICE / EXAM) and scope (FULL / PART).
 */
export async function getMyHistory(params?: {
  skip?: number;
  limit?: number;
}): Promise<AttemptHistoryOut[]> {
  const { data } = await api.get<AttemptHistoryOut[]>(
    IELTS_PATHS.attempts.history,
    { params },
  );
  return data;
}

/**
 * GET /ielts/reading/attempts/progress
 *
 * Returns a full progress report:
 *   - band_trend            — band score over time (per attempt)
 *   - overall_type_accuracy — cumulative accuracy per question type
 *   - top_weak_types        — up to 3 types with accuracy below 60%
 *   - type_trends           — per-type accuracy trend over time
 */
export async function getMyProgress(): Promise<ProgressOut> {
  const { data } = await api.get<ProgressOut>(IELTS_PATHS.attempts.progress);
  return data;
}

/**
 * GET /ielts/reading/attempts/:attemptId/result
 *
 * Returns the full graded result for a completed attempt including
 * per-question breakdown with correct answers and explanations.
 * USER can only view their own attempts; ADMIN / TEACHER can view any.
 */
export async function getAttemptResult(
  attemptId: number,
): Promise<AttemptResultOut> {
  const { data } = await api.get<AttemptResultOut>(
    IELTS_PATHS.attempts.result(attemptId),
  );
  return data;
}

/**
 * GET /ielts/reading/attempts/:attemptId/analysis
 *
 * Returns the detailed analysis generated at submission time:
 *   - question_type_breakdown — accuracy per question type
 *   - part_breakdown          — accuracy per passage
 *   - weak_question_types     — types with accuracy below 60%
 *   - per_question_detail     — per-question: type, passage, answer, explanation
 *   - avg_time_per_question_sec
 *
 * USER can only view their own attempts; ADMIN / TEACHER can view any.
 */
export async function getAttemptAnalysis(
  attemptId: number,
): Promise<AttemptAnalysisOut> {
  const { data } = await api.get<AttemptAnalysisOut>(
    IELTS_PATHS.attempts.analysis(attemptId),
  );
  return data;
}

// ══════════════════════════════════════════════════════════════════════
// API FUNCTIONS — Admin
// ══════════════════════════════════════════════════════════════════════

/**
 * POST /ielts/reading/admin/tests
 *
 * Creates a complete reading test (parts → question groups →
 * sub-questions → options) in a single transaction.
 * Set is_free=true to expose the test to FREE-tier users.
 * Populate question_types with every type present (used for filtering).
 * Requires ADMIN or TEACHER role.
 */
export async function adminCreateTest(
  payload: ReadingTestCreate,
): Promise<ReadingTestOut> {
  const { data } = await api.post<ReadingTestOut>(
    IELTS_PATHS.admin.createTest,
    payload,
  );
  return data;
}

/**
 * DELETE /ielts/reading/admin/tests/:testId
 *
 * Soft-deletes a test (sets is_active=false). Record is retained.
 * Requires ADMIN role.
 */
export async function adminDeleteTest(
  testId: string,
): Promise<SuccessResponse> {
  const { data } = await api.delete<SuccessResponse>(
    IELTS_PATHS.admin.deleteTest(testId),
  );
  return data;
}

/**
 * GET /ielts/reading/admin/attempts
 *
 * Returns a paginated list of all users' attempts (most recent first).
 * Optionally filter by user_id.
 * Requires ADMIN or TEACHER role.
 */
export async function adminListAttempts(
  params?: ListAttemptsParams,
): Promise<AttemptHistoryOut[]> {
  const { data } = await api.get<AttemptHistoryOut[]>(
    IELTS_PATHS.admin.attempts,
    { params },
  );
  return data;
}

/**
 * GET /ielts/reading/admin/attempts/:attemptId/analysis
 *
 * Returns the full analysis for any user's attempt by ID.
 * No ownership check is applied.
 * Requires ADMIN or TEACHER role.
 */
export async function adminGetAttemptAnalysis(
  attemptId: number,
): Promise<AttemptAnalysisOut> {
  const { data } = await api.get<AttemptAnalysisOut>(
    IELTS_PATHS.admin.analysis(attemptId),
  );
  return data;
}
