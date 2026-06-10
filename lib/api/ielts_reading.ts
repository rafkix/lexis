// lib/api/ielts_reading.ts
import { api } from "./client";

// ══════════════════════════════════════════════════════════════════════
// ENUMS
// ══════════════════════════════════════════════════════════════════════

export type DifficultyEnum = "EASY" | "MEDIUM" | "HARD";

export type QuestionTypeEnum =
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE_NOT_GIVEN"
  | "YES_NO_NOT_GIVEN"
  | "MATCHING_HEADINGS"
  | "MATCHING_INFORMATION"
  | "MATCHING_FEATURES"
  | "MATCHING_NAMES"
  | "MATCHING_SENTENCE_ENDINGS"
  | "SENTENCE_COMPLETION"
  | "SUMMARY_COMPLETION"
  | "SUMMARY_COMPLETION_DRAG_DROP"
  | "NOTE_COMPLETION"
  | "TABLE_COMPLETION"
  | "FLOW_CHART_COMPLETION"
  | "SHORT_ANSWER"
  | "DIAGRAM_LABELLING";

export type AnswerStatusEnum = "CORRECT" | "INCORRECT" | "UNANSWERED";

export type AttemptModeEnum = "PRACTICE" | "EXAM";

export type AttemptScopeEnum = "FULL" | "PART";

export type SubscriptionTierEnum = "FREE" | "PREMIUM" | "PRO" | "GRANDFATHERED";

// ══════════════════════════════════════════════════════════════════════
// TYPES — Tests
// ══════════════════════════════════════════════════════════════════════

export interface ReadingTestListOut {
  id: string;
  global_title: string;
  is_active: boolean;
  is_free: boolean;
  parts_count: number;
  total_questions: number;
  time_limit_min: number;
  question_types: QuestionTypeEnum[];
  created_at: string;
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
  question_text: string | null;
  instruction: string | null;
  context: string | null;
  image_url: string | null;
  diagram_data: string | null;
  table_data: unknown | null;
  points: number;
  sub_questions: SubQuestionOut[];
  options: OptionOut[];
}

export interface PassageOut {
  id: number;
  passage_number: number;
  title: string;
  content: string;
  image_url: string | null;
  word_count: number | null;
  question_groups: QuestionGroupOut[];
}

export interface ReadingTestOut {
  id: string;
  global_title: string;
  is_active: boolean;
  is_free: boolean;
  parts_count: number;
  total_questions: number;
  time_limit_min: number;
  question_types: QuestionTypeEnum[];
  created_at: string;
  passages: PassageOut[];
}

// ══════════════════════════════════════════════════════════════════════
// TYPES — Attempts
// ══════════════════════════════════════════════════════════════════════

export interface StartAttemptIn {
  mode?: AttemptModeEnum;
  scope?: AttemptScopeEnum;
  passage_id?: number | null;
}

export interface StartAttemptOut {
  attempt_id: number;
  test_id: string;
  mode: AttemptModeEnum;
  scope: AttemptScopeEnum;
  is_retake: boolean;
  started_at: string;
}

export interface AnswerIn {
  sub_question_id: number;
  given_answer: string | null;
}

export interface SubmitAnswersIn {
  answers: AnswerIn[];
  time_spent_sec?: number | null;
}

// ══════════════════════════════════════════════════════════════════════
// TYPES — Result
// ══════════════════════════════════════════════════════════════════════

export interface QuestionResultOut {
  sub_question_id: number;
  question_number: number;
  given_answer: string | null;
  correct_answer: string | null;
  status: AnswerStatusEnum;
  points: number;
  passage_number: number;
}

export interface PassageStatOut {
  passage_number: number;
  title: string;
  correct: number;
  incorrect: number;
  unanswered: number;
  total: number;
  accuracy_pct: number;
}

export interface QuestionTypeStatOut {
  question_type: string;
  correct: number;
  incorrect: number;
  unanswered: number;
  total: number;
  accuracy_pct: number;
}

export interface AttemptResultOut {
  attempt_id: number;
  test_id: string;
  mode: AttemptModeEnum;
  scope: AttemptScopeEnum;
  total_questions: number;
  correct_count: number;
  incorrect_count: number;
  unanswered_count: number;
  score_percent: number;
  band_score: number | null;
  time_spent_sec: number | null;
  started_at: string;
  finished_at: string | null;
  question_results: QuestionResultOut[];
  passage_stats: PassageStatOut[];
  question_type_stats: QuestionTypeStatOut[];
}

// ══════════════════════════════════════════════════════════════════════
// TYPES — History
// ══════════════════════════════════════════════════════════════════════

export interface AttemptHistoryOut {
  attempt_id: number;
  test_id: string;
  test_title: string;
  mode: AttemptModeEnum;
  scope: AttemptScopeEnum;
  is_retake: boolean;
  total_questions: number;
  correct_count: number;
  score_percent: number;
  band_score: number | null;
  started_at: string;
  finished_at: string | null;
  is_completed: boolean;
}

// ══════════════════════════════════════════════════════════════════════
// TYPES — Analysis
// ══════════════════════════════════════════════════════════════════════

export interface QuestionTypeBreakdownItem {
  correct: number;
  incorrect: number;
  unanswered: number;
  total: number;
  accuracy_pct: number;
}

export interface PassageBreakdownItem {
  title: string;
  correct: number;
  incorrect: number;
  unanswered: number;
  total: number;
  accuracy_pct: number;
}

export interface PerQuestionDetailOut {
  sub_question_id: number;
  question_number: number | null;
  question_type: QuestionTypeEnum | string;
  passage_number: number | null;
  given_answer: string | null;
  correct_answer: string | null;
  status: AnswerStatusEnum;
}

export interface AttemptAnalysisOut {
  attempt_id: number;
  created_at: string;
  question_type_breakdown: Record<string, QuestionTypeBreakdownItem>;
  passage_breakdown: Record<string, PassageBreakdownItem>;
  weak_question_types: QuestionTypeEnum[];
  per_question_detail: PerQuestionDetailOut[];
  avg_time_per_question_sec: number | null;
}

// ══════════════════════════════════════════════════════════════════════
// TYPES — Progress
// FIX: ProgressOut mirrors backend exactly:
//   { test_id, test_title, attempts: ProgressPointOut[] }
// Backend does NOT return latest_band_score / best_band_score at root level.
// Compute those client-side from the attempts array.
// ══════════════════════════════════════════════════════════════════════

export interface ProgressPointOut {
  date: string;
  band_score: number;
  correct_count: number;
  total_questions: number;
}

export interface ProgressOut {
  test_id: string;
  test_title: string;
  attempts: ProgressPointOut[];
}

/**
 * Compute latest and best band score from a ProgressOut.
 * Safe to call even when attempts is empty.
 */
export function computeProgressStats(progress: ProgressOut | null): {
  latestBand: number;
  bestBand: number;
} {
  if (!progress || progress.attempts.length === 0) {
    return { latestBand: 0, bestBand: 0 };
  }
  const bands = progress.attempts.map((a) => a.band_score);
  return {
    latestBand: bands[bands.length - 1] ?? 0,
    bestBand: Math.max(...bands),
  };
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
}

export interface SubQuestionCreate {
  question_number: number;
  question_text?: string | null;
  points?: number;
  correct_answer?: string | null;
  explanation?: string | null;
}

export interface QuestionGroupCreate {
  question_number: number;
  type: QuestionTypeEnum;
  question_text?: string | null;
  instruction?: string | null;
  context?: string | null;
  image_url?: string | null;
  diagram_data?: string | null;
  table_data?: unknown | null;
  points?: number;
  sub_questions?: SubQuestionCreate[];
  options?: OptionCreate[];
}

export interface PassageCreate {
  passage_number: number;
  title: string;
  content: string;
  image_url?: string | null;
  word_count?: number | null;
  question_groups: QuestionGroupCreate[];
}

export interface ReadingTestCreate {
  title: string;
  difficulty?: DifficultyEnum;
  is_active?: boolean;
  is_free?: boolean;
  total_questions?: number;
  time_limit_min?: number;
  question_types?: QuestionTypeEnum[];
  passages: PassageCreate[];
}

export interface SetAnswerIn {
  correct_answer: string;
  explanation?: string | null;
}

export interface SetOptionCorrectIn {
  is_correct: boolean;
}

export interface SuccessResponse {
  success: boolean;
  message: string;
}

// ══════════════════════════════════════════════════════════════════════
// QUERY PARAM TYPES
// ══════════════════════════════════════════════════════════════════════

export interface ListTestsParams {
  skip?: number;
  limit?: number;
  free_only?: boolean;
  difficulty?: DifficultyEnum;
}

export interface ListAttemptsParams {
  skip?: number;
  limit?: number;
  user_id?: string;
}

// ══════════════════════════════════════════════════════════════════════
// URL PATHS
// ══════════════════════════════════════════════════════════════════════

const BASE = "/ielts/reading";

export const IELTS_PATHS = {
  tests: {
    list: `${BASE}/tests`,
    detail: (testId: string) => `${BASE}/tests/${testId}`,
  },
  attempts: {
    start: (testId: string) => `${BASE}/tests/${testId}/attempts`,
    submit: (attemptId: number) => `${BASE}/attempts/${attemptId}/submit`,
    history: `${BASE}/attempts/history`,
    progress: `${BASE}/attempts/progress`,
    result: (attemptId: number) => `${BASE}/attempts/${attemptId}/result`,
    analysis: (attemptId: number) => `${BASE}/attempts/${attemptId}/analysis`,
  },
  admin: {
    createTest: `${BASE}/admin/tests`,
    importTest: `${BASE}/admin/tests/import`,
    getTest: (testId: string) => `${BASE}/admin/tests/${testId}`,
    deleteTest: (testId: string) => `${BASE}/admin/tests/${testId}`,
    setAnswer: (subQuestionId: number) =>
      `${BASE}/admin/sub-questions/${subQuestionId}/answer`,
    setOptionCorrect: (optionId: number) =>
      `${BASE}/admin/options/${optionId}/correct`,
    attempts: `${BASE}/admin/attempts`,
    analysis: (attemptId: number) =>
      `${BASE}/admin/attempts/${attemptId}/analysis`,
  },
} as const;

// ══════════════════════════════════════════════════════════════════════
// API FUNCTIONS — Tests
// ══════════════════════════════════════════════════════════════════════

export async function listTests(
  params?: ListTestsParams,
): Promise<ReadingTestListOut[]> {
  const { data } = await api.get<ReadingTestListOut[]>(IELTS_PATHS.tests.list, {
    params,
  });
  return data;
}

export async function getTest(testId: string): Promise<ReadingTestOut> {
  const { data } = await api.get<ReadingTestOut>(
    IELTS_PATHS.tests.detail(testId),
  );
  return data;
}

// ══════════════════════════════════════════════════════════════════════
// API FUNCTIONS — Attempts
// ══════════════════════════════════════════════════════════════════════

export async function startAttempt(
  testId: string,
  payload: StartAttemptIn,
): Promise<StartAttemptOut> {
  const { data } = await api.post<StartAttemptOut>(
    IELTS_PATHS.attempts.start(testId),
    payload,
  );
  return data;
}

export async function submitAttempt(
  attemptId: number,
  payload: SubmitAnswersIn,
): Promise<AttemptResultOut> {
  const { data } = await api.post<AttemptResultOut>(
    IELTS_PATHS.attempts.submit(attemptId),
    payload,
  );
  return data;
}

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
 * GET /ielts/reading/attempts/progress?test_id={testId}
 * FIX: test_id is a REQUIRED query param — always pass it.
 */
export async function getMyProgress(testId: string): Promise<ProgressOut> {
  const { data } = await api.get<ProgressOut>(IELTS_PATHS.attempts.progress, {
    params: { test_id: testId },
  });
  return data;
}

export async function getAttemptResult(
  attemptId: number,
): Promise<AttemptResultOut> {
  const { data } = await api.get<AttemptResultOut>(
    IELTS_PATHS.attempts.result(attemptId),
  );
  return data;
}

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

export async function adminCreateTest(
  payload: ReadingTestCreate,
): Promise<ReadingTestOut> {
  const { data } = await api.post<ReadingTestOut>(
    IELTS_PATHS.admin.createTest,
    payload,
  );
  return data;
}

export async function adminDeleteTest(
  testId: string,
): Promise<SuccessResponse> {
  const { data } = await api.delete<SuccessResponse>(
    IELTS_PATHS.admin.deleteTest(testId),
  );
  return data;
}

export async function adminSetCorrectAnswer(
  subQuestionId: number,
  payload: SetAnswerIn,
): Promise<SuccessResponse> {
  const { data } = await api.patch<SuccessResponse>(
    IELTS_PATHS.admin.setAnswer(subQuestionId),
    payload,
  );
  return data;
}

export async function adminSetOptionCorrect(
  optionId: number,
  payload: SetOptionCorrectIn,
): Promise<SuccessResponse> {
  const { data } = await api.patch<SuccessResponse>(
    IELTS_PATHS.admin.setOptionCorrect(optionId),
    payload,
  );
  return data;
}

export async function adminListAttempts(
  params?: ListAttemptsParams,
): Promise<AttemptHistoryOut[]> {
  const { data } = await api.get<AttemptHistoryOut[]>(
    IELTS_PATHS.admin.attempts,
    { params },
  );
  return data;
}

export async function adminGetAttemptAnalysis(
  attemptId: number,
): Promise<AttemptAnalysisOut> {
  const { data } = await api.get<AttemptAnalysisOut>(
    IELTS_PATHS.admin.analysis(attemptId),
  );
  return data;
}
