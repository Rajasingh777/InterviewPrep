# NightSpider Interview Prep - Detailed Project Report

Snapshot date: April 7, 2026
Repository root: `NIGHT-CODING-MARATHON`

## 1. Executive Summary

NightSpider is a full-stack AI-assisted interview preparation platform where users can:
- Register and log in
- Create interview sessions (role, experience, topics, company, interview type, difficulty, question count)
- Generate AI interview questions/answers via Gemini
- Pin sessions and questions
- Download question sets as PDF

The project is functionally solid for an MVP and already includes useful UX polish (animations, toasts, skeleton loading, responsive navbar/menu). The core architecture is straightforward and maintainable. The most important next upgrades are reliability hardening, response consistency, testing, and small security/config improvements.

## 2. Tech Stack and Runtime

### Frontend
- React 19 + Vite 7
- Tailwind CSS 4
- React Router DOM 7
- Axios
- Framer Motion
- react-hot-toast
- react-markdown
- jsPDF

### Backend
- Node.js + Express 5
- MongoDB + Mongoose 9
- JWT auth (jsonwebtoken)
- bcryptjs
- Google Gemini via `@google/genai`
- dotenv + cors + nodemon

## 3. High-Level Architecture

### Request Flow
1. User interacts with React pages/components
2. Frontend sends requests through Axios instance with JWT `Authorization: Bearer <token>`
3. Express routes dispatch to controllers
4. `protect` middleware validates JWT and hydrates `req.user`
5. Controllers read/write MongoDB via Mongoose models
6. AI endpoints call Gemini APIs, normalize output, and persist generated questions

### Main Domains
- Auth domain: signup/login, token issuance
- Session domain: create/read/list/delete/pin interview sessions
- Question domain: pin/unpin generated questions
- AI domain: question generation + explanation generation

## 4. Backend Deep Dive

### 4.1 Server Boot and Middleware
File: `backend/index.js`
- Loads env vars and connects to MongoDB before serving
- CORS currently allows `http://localhost:5173`
- Registers JSON/urlencoded parsers
- Mounts:
  - `/api/auth`
  - `/api/sessions`
  - `/api/ai`
- Includes `/health` endpoint
- Has generic 500 handler + 404 handler

### 4.2 Data Models

#### User (`backend/models/user-model.js`)
- `name` (required)
- `email` (required, unique, lowercase, trimmed)
- `password` (required, hashed)
- timestamps

#### Session (`backend/models/session-model.js`)
- `user` ref -> User (required)
- `role`, `experience` (required)
- `topicsToFocus`, `company` (optional)
- `interviewType` enum: technical | behavioral | mixed
- `difficulty` enum: easy | medium | hard
- `questionCount` number (3 to 12)
- `isPinned` boolean
- `questions` array of Question refs
- timestamps

#### Question (`backend/models/question-model.js`)
- `session` ref -> Session (required)
- `question` (required)
- `answer` (required)
- `isPinned` boolean
- timestamps

### 4.3 Authentication and Authorization

#### Auth Controller (`backend/controller/auth-controller.js`)
- Signup:
  - Normalizes email
  - Validates required fields
  - Checks duplicate email
  - Hashes password (`bcrypt`, salt rounds 12)
  - Returns token + user payload
- Login:
  - Normalizes email
  - Validates credentials using safe comparer
  - Handles malformed hashes safely
  - Returns token + user payload
- JWT payload key is `id` and matches auth middleware

#### Protect Middleware (`backend/middlewares/auth-middleware.js`)
- Reads bearer token
- Verifies JWT
- Loads user document excluding password
- Attaches user to `req.user`

### 4.4 Session Controller (`backend/controller/session-controller.js`)
- Create session with validation on role/experience/type/difficulty/questionCount
- Get all user sessions, sorted by newest, with populated questions
- Get session by id with user ownership check
- Delete session + associated question docs
- Toggle session pin status

### 4.5 AI Controller (`backend/controller/ai-controller.js`)
- Initializes Gemini client from `GEMINI_API_KEY`
- Generates interview questions:
  - Pulls session metadata
  - Constructs prompt using utility
  - Tries multiple candidate models with fallback order
  - Parses potentially noisy model output into JSON
  - Normalizes and persists questions
  - Handles quota/rate errors with `429`, optional `Retry-After`
- Toggles question pin with ownership verification through parent session
- Generates concept explanations as structured JSON (`title`, `explanation`)

### 4.6 Route Matrix

#### Auth routes
- `POST /api/auth/signup`
- `POST /api/auth/login`

#### Session routes (protected)
- `POST /api/sessions/create`
- `GET /api/sessions/my-sessions`
- `PATCH /api/sessions/pin/:id`
- `GET /api/sessions/:id`
- `DELETE /api/sessions/:id`

#### AI routes (protected)
- `POST /api/ai/generate-questions`
- `POST /api/ai/generate-explanation`
- `PATCH /api/ai/toggle-pin/:questionId`
- `GET /api/ai/session/:id` (controller does not enforce ownership)

## 5. Frontend Deep Dive

### 5.1 App Composition
Files: `frontend/src/main.jsx`, `frontend/src/App.jsx`
- `BrowserRouter` wraps app
- Navbar rendered globally
- Routes:
  - `/` landing
  - `/signup`
  - `/login`
  - `/dashboard`
  - `/interview/:id`

### 5.2 API Client and Paths
Files: `frontend/src/utils/axiosInstance.js`, `frontend/src/utils/apiPaths.js`
- Axios instance injects JWT from localStorage
- API paths centralized
- Uses `VITE_API_BASE_URL`

### 5.3 Key Pages

#### Landing Page
- Marketing page with feature cards and CTA actions
- Strong visual presentation with gradients and responsive layout

#### Login/Signup
- Basic form handling with loading states and toast feedback
- Login stores token and lightweight user profile in localStorage

#### Dashboard
- Auth guard checks token
- Session creation form with interview metadata
- Session cards support pin, delete, navigate to prep
- Client-side sort prioritizes pinned sessions

#### Interview Prep
- Fetches session questions
- Triggers AI generation
- Handles 429 cooldown/retry messaging
- Pin/unpin question support
- Markdown rendering for answers
- PDF export via jsPDF

### 5.4 Reusable Components
- `Navbar`: responsive nav, auth-aware links, profile dropdown
- `GenerateButton`: generating/loading/cooldown state UX
- `EmptyState`, `ErrorBanner`, `SkeletonCard`
- `QAItems`: expandable markdown answer cards with pin control

## 6. Strengths

1. Good MVP feature coverage from auth to AI generation to export.
2. Ownership checks are implemented for major session/question operations.
3. AI generation logic has robust fallback and parsing protections.
4. Frontend UX quality is above typical MVP (animations, toasts, skeletons, responsive nav).
5. Data model design is simple and aligns well with product goals.

## 7. Risks and Gaps (Important)

1. Duplicate AI route registration:
- `PATCH /api/ai/toggle-pin/:questionId` is registered twice.

2. Inconsistent session retrieval ownership checks:
- `session-controller.getSessionById` checks owner.
- `ai-controller.getSessionById` does not check owner.
- Route overlap can cause security ambiguity depending on which endpoint frontend calls.

3. API response shape inconsistency:
- Some handlers return `{ success, session }`, others `{ success, data }`, others plain payload.
- Frontend currently uses fallback parsing patterns to cope.

4. Environment fallback expression in frontend paths:
- `const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api` || ...` always resolves to string form even when env is undefined, risking malformed URLs.

5. CORS currently hard-coded for localhost only:
- Production frontend origin support is not configured.

6. No automated test suite:
- No backend integration tests or frontend component/page tests observed.

7. Some text encoding artifacts in UI strings:
- Several strings show mojibake (for example emoji apostrophe artifacts), likely file encoding mismatch.

8. Sensitive defaults:
- JWT fallback secrets exist; should be avoided in production runtime.

## 8. Security and Reliability Notes

### Positive
- Password hashing present
- JWT auth enforced on protected routes
- Ownership checks present in most critical mutating endpoints

### Needs Improvement
- Standardize and enforce ownership checks on all session read paths
- Add request validation layer (`zod`/`joi` or express-validator)
- Add rate limiting and brute-force protection on auth routes
- Add structured logging and correlation IDs

## 9. Performance and Scalability Observations

1. Session list populates full question docs on dashboard (`populate("questions")`), which can grow payload size unnecessarily.
2. AI generation inserts many question docs then pushes refs to session (acceptable for current scale).
3. Frontend refreshes full lists frequently after mutations; can be optimized with optimistic updates.
4. Vite build warns about large chunks; code-splitting opportunities exist.

## 10. Recommended Roadmap (Prioritized)

### Phase 1 - Correctness and Security (High Priority)
1. Remove duplicate AI toggle-pin route registration.
2. Consolidate session-by-id retrieval to one authorized path.
3. Standardize API response contract across all controllers.
4. Fix `API_PATHS` base URL fallback logic.
5. Add production-ready CORS env config.

### Phase 2 - Developer Experience and Stability
1. Add input validation middleware across routes.
2. Add global error formatter with machine-readable codes.
3. Add backend tests (auth/session/AI happy+error paths).
4. Add frontend smoke tests for critical flows (login, session create, question generate).

### Phase 3 - Product Enhancements
1. Add pagination/infinite loading for sessions/questions.
2. Add regeneration options per question/session.
3. Add richer export formats (markdown/docx) and branded PDF template.
4. Add profile/settings page and token expiry UX.

## 11. Environment and Deployment Notes

### Backend env (inferred from code)
- `MONGODB_URI`
- `JWT_SECRET`
- `GEMINI_API_KEY`
- `GEMINI_PRIMARY_MODEL` (optional)
- `PORT` (optional, defaults 9000)

### Frontend env
- `VITE_API_BASE_URL`

### Deployment
- Frontend has Vercel rewrite config for SPA routing.
- Backend deployment config is not present in repo (would need platform-specific setup).

## 12. Current Project Maturity Assessment

- Product maturity: MVP+ (usable end-to-end)
- Code maturity: Moderate (good structure, needs consistency hardening)
- Security maturity: Basic to Moderate (auth present, still needs guardrail improvements)
- Operational maturity: Basic (limited test/monitoring evidence)

## 13. File-Level Reference Map

### Backend
- Entry: `backend/index.js`
- DB: `backend/config/database-config.js`
- Middleware: `backend/middlewares/auth-middleware.js`
- Controllers:
  - `backend/controller/auth-controller.js`
  - `backend/controller/session-controller.js`
  - `backend/controller/ai-controller.js`
- Routes:
  - `backend/routes/auth-route.js`
  - `backend/routes/session-route.js`
  - `backend/routes/ai-route.js`
  - `backend/routes/question-route.js`
- Models:
  - `backend/models/user-model.js`
  - `backend/models/session-model.js`
  - `backend/models/question-model.js`
- Prompt utilities:
  - `backend/utils/prompts-util.js`
  - `backend/utils/prompts-util-optimized.js`

### Frontend
- Entry: `frontend/src/main.jsx`
- App shell/routes: `frontend/src/App.jsx`
- API client: `frontend/src/utils/axiosInstance.js`
- API paths: `frontend/src/utils/apiPaths.js`
- Pages:
  - `frontend/src/pages/LandingPage.jsx`
  - `frontend/src/pages/Login.jsx`
  - `frontend/src/pages/SignUp.jsx`
  - `frontend/src/pages/Dashboard.jsx`
  - `frontend/src/pages/InterviewPrep.jsx`
- Shared components: `frontend/src/components/*`

## 14. Conclusion

NightSpider already delivers a complete and valuable interview-prep journey with a strong user-facing experience. The core foundation is good. If you execute the Phase 1 recommendations, the project will quickly move from polished MVP to a much more production-ready baseline.
