import type { AnswerMap } from "./types";

const STORAGE_KEY = "programmer-mbti-session";

export interface SessionState {
  screen: "intro" | "questions" | "result";
  currentIndex: number;
  answers: AnswerMap;
}

export function loadSessionState(): SessionState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SessionState;
  } catch {
    return null;
  }
}

export function saveSessionState(value: SessionState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function clearSessionState() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
