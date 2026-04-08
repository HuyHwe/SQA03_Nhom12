// src/utils/attempt.js
export const ATTEMPT_KEY_PREFIX = "attempt"; // key = attempt_<examId>_<attemptId>

export function generateAttemptId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function attemptKey(examId, attemptId) {
  return `${ATTEMPT_KEY_PREFIX}_${examId}_${attemptId}`;
}

export function readAttempt(examId, attemptId) {
  try {
    const raw = localStorage.getItem(attemptKey(examId, attemptId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeAttempt(examId, attemptId, payload) {
  try {
    localStorage.setItem(attemptKey(examId, attemptId), JSON.stringify(payload));
  } catch {}
}

export function clearAttemptsForExam(examId) {
  Object.keys(localStorage).forEach((k) => {
    if (k.startsWith(`${ATTEMPT_KEY_PREFIX}_${examId}_`)) localStorage.removeItem(k);
  });
}

export function findActiveAttemptId(examId) {
  // trả về attemptId đầu tiên chưa submitted (nếu muốn resume), ngược lại trả null
  for (const k of Object.keys(localStorage)) {
    if (k.startsWith(`${ATTEMPT_KEY_PREFIX}_${examId}_`)) {
      try {
        const v = JSON.parse(localStorage.getItem(k));
        if (v && v.submitted === false) {
          const parts = k.split("_");
          return parts[2]; // attemptId
        }
      } catch {}
    }
  }
  return null;
}
