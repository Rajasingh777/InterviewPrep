# Fix /api/ai/generate-questions 500 Error

## Status: 🔄 In Progress

### Step 1: [DONE] Understand codebase and error flow
### Step 2: [DONE] Confirm server running, env basics

### Pending Steps:
**Step 3: Add GEMINI_API_KEY to backend/.env**
- Edit backend/.env to include: `GEMINI_API_KEY=your_actual_gemini_api_key_here`
- Get free key from https://aistudio.google.com/app/apikey if needed

**Step 4: Add detailed logging to ai-controller.js**
- More console.log in generateInterviewQuestions to pinpoint failure

**Step 5: Test endpoint manually**
```
# From backend dir, need auth token from login
curl -X POST http://localhost:9000/api/ai/generate-questions \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"sessionId": "VALID_SESSION_ID"}'
```

**Step 6: Fix any Gemini model/package issues**
- Check @google/genai version compatibility
- gemini-2.5-flash may not exist, fallback to gemini-1.5-flash

**Step 7: Restart backend (`rs` in terminal or npm run dev)**
**Step 8: Frontend test InterviewPrep generate button**
**Step 9: [ ] Mark complete**

**Next Action:** User add GEMINI_API_KEY to backend/.env and share exact console error after clicking generate.

