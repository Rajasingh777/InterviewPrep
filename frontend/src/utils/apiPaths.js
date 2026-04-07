const rawApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:9000";

// Avoid malformed URLs like https://host.com//api when env has trailing slash.
const normalizedApiBaseUrl = rawApiBaseUrl.replace(/\/+$/, "");
const BASE_URL = `${normalizedApiBaseUrl}/api`;

export const API_PATHS = {
  AUTH: {
    LOGIN: `${BASE_URL}/auth/login`,
    SIGNUP: `${BASE_URL}/auth/signup`,
  },
  SESSION: {
    CREATE: `${BASE_URL}/sessions/create`,
    GET_ALL: `${BASE_URL}/sessions/my-sessions`,
    GET_ONE: `${BASE_URL}/sessions`, // usage: GET_ONE/:id
    DELETE: `${BASE_URL}/sessions`, // usage: DELETE/:id
    TOGGLE_PIN: `${BASE_URL}/sessions/pin`, // usage: TOGGLE_PIN/:id
  },
  AI: {
    GENERATE_QUESTIONS: `${BASE_URL}/ai/generate-questions`,
    EXPLAIN: `${BASE_URL}/ai/generate-explanation`,
    TOGGLE_PIN: `${BASE_URL}/ai/toggle-pin`,
  },
};
