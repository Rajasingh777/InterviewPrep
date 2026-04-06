// Load environment variables from .env file for configuration
import dotenv from "dotenv";
dotenv.config();

// Import Google Generative AI client for AI-powered content generation
import { GoogleGenAI } from "@google/genai";

// Import database models for questions and interview sessions
import Question from "../models/question-model.js";
import Session from "../models/session-model.js";

// Import utility functions that generate prompts for AI models
import {
  conceptExplainPrompt,
  questionAnswerPrompt,
} from "../utils/prompts-util.js";

// Initialize and return Google AI client instance
// Returns null if API key is not configured in environment variables
const getAIClient = () => {
  // Get API key from environment variables and trim whitespace
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  // Return null if no API key is found (service unavailable)
  if (!apiKey) return null;
  // Create and return new Google AI client instance
  return new GoogleGenAI({ apiKey });
};

// Parse JSON response from AI model, handling various text formatting issues
// AI models sometimes return JSON wrapped in markdown code blocks or with extra text
const parseJsonFromModelText = (text) => {
  // Clean the response text by removing markdown code block markers and extra formatting
  const cleanedText = (text || "")
    .replace(/^```json\s*/i, "") // Remove opening ```json marker
    .replace(/^```\s*/, "") // Remove opening ``` marker
    .replace(/```$/, "") // Remove closing ``` marker
    .replace(/^json\s*/i, "") // Remove "json" prefix if present
    .trim(); // Remove leading/trailing whitespace

  try {
    return JSON.parse(cleanedText);
  } catch {
    const arrayMatch = cleanedText.match(/\[[\s\S]*\]/);
    if (arrayMatch) return JSON.parse(arrayMatch[0]);
    const objectMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (objectMatch) return JSON.parse(objectMatch[0]);
    // If no valid JSON found, throw error
    throw new Error("Failed to parse AI response as JSON");
  }
};

// Extract text content from Google AI model response
// Handles different response formats from the Gemini API
const extractModelText = (response) =>
  response.text || // Direct text property
  response.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") || // Nested content parts
  ""; // Fallback to empty string
const QUESTION_MODEL_CANDIDATES = [
  process.env.GEMINI_PRIMARY_MODEL,
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.5-flash",
].filter(Boolean);

const getRetryAfterSeconds = (error) => {
  if (Array.isArray(error?.modelAttempts) && error.modelAttempts.length > 0) {
    const retryValues = error.modelAttempts
      .map((attempt) => getRetryAfterSeconds(attempt.error))
      .filter((value) => Number.isFinite(value) && value > 0);
    if (retryValues.length > 0) return Math.max(...retryValues);
  }

  const message = String(error?.message || "");
  const retryInfoMatch = message.match(/"retryDelay":"(\d+)s"/i);
  if (retryInfoMatch) return Number(retryInfoMatch[1]);

  const plainTextMatch = message.match(/Please retry in ([\d.]+)s/i);
  if (plainTextMatch) return Math.ceil(Number(plainTextMatch[1]));

  return null;
};

const isQuotaError = (error) => {
  if (error?.code === "AI_QUOTA_EXCEEDED") return true;
  if (Array.isArray(error?.modelAttempts) && error.modelAttempts.length > 0) {
    return error.modelAttempts.every((attempt) => isQuotaError(attempt.error));
  }

  const status = String(error?.status || "");
  const message = String(error?.message || "");
  return (
    status === "429" ||
    status === "RESOURCE_EXHAUSTED" ||
    message.includes('"code":429') ||
    message.includes("RESOURCE_EXHAUSTED")
  );
};

const dedupeModels = (models) => {
  const seen = new Set();
  return models.filter((model) => {
    const key = String(model || "").trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const getQuestionModelCandidates = () =>
  dedupeModels(QUESTION_MODEL_CANDIDATES.length ? QUESTION_MODEL_CANDIDATES : [
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash",
  ]);

const generateQuestionsFromModels = async (ai, contents, models) => {
  const modelAttempts = [];

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          responseMimeType: "application/json",
        },
      });
      const parsed = parseJsonFromModelText(extractModelText(response));
      return { questions: parsed, model };
    } catch (error) {
      modelAttempts.push({ model, error });
    }
  }

  const aggregateError = new Error("All configured Gemini models failed");
  aggregateError.modelAttempts = modelAttempts;
  throw aggregateError;
};

const persistQuestions = async (sessionId, session, normalizedQuestions) => {
  const saved = await Question.insertMany(
    normalizedQuestions.map((q) => ({
      session: sessionId,
      question: q.question,
      answer: q.answer || "",
      note: "",
      isPinned: false,
    })),
  );

  session.questions.push(...saved.map((q) => q._id));
  await session.save();
  return saved;
};

// @desc    Generate AI-powered interview questions and save them to database for a specific session
// @route   POST /api/ai/generate-questions
// @access  Private (requires authentication)
export const generateInterviewQuestions = async (req, res) => {
  console.log("generateInterviewQuestions called with sessionId:", req.body.sessionId);
  try {
    const ai = getAIClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        message: "AI service is not configured. Missing GEMINI_API_KEY.",
      });
    }

    const { sessionId } = req.body;
    if (!sessionId) {
      return res
        .status(400)
        .json({ success: false, message: "sessionId is required" });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const {
      role,
      experience,
      topicsToFocus,
      interviewType,
      difficulty,
      company,
      questionCount,
    } = session;

    const finalQuestionCount = Math.min(12, Math.max(3, Number(questionCount) || 5));
    const contextSummary = [
      topicsToFocus ? `Topics: ${topicsToFocus}` : null,
      company ? `Target company: ${company}` : null,
      `Interview type: ${interviewType || "technical"}`,
      `Difficulty: ${difficulty || "medium"}`,
    ]
      .filter(Boolean)
      .join(" | ");

    const prompt = questionAnswerPrompt(
      role,
      experience,
      contextSummary,
      finalQuestionCount,
    );
    const modelCandidates = getQuestionModelCandidates();
    console.log("Using model candidates:", modelCandidates.join(" -> "));

    let questions;
    try {
      const firstAttempt = await generateQuestionsFromModels(
        ai,
        prompt,
        modelCandidates,
      );
      questions = firstAttempt.questions;
      console.log(`AI response received from ${firstAttempt.model}`);
    } catch (firstAttemptError) {
      // If first pass already failed due to quota/rate-limit, do not run
      // the strict second pass (it doubles API calls and worsens throttling).
      if (isQuotaError(firstAttemptError)) {
        throw firstAttemptError;
      }

      const strictPrompt = `Generate exactly ${finalQuestionCount} interview questions as valid JSON only.
Profile:
- Role: ${role}
- Experience: ${experience} years
- Context: ${contextSummary || "general topics"}

Rules:
- Return only a JSON array.
- Each item must be: {"question":"...","answer":"..."}
- Keep each answer between 100 and 180 words.
- Use plain markdown only:
  **Core Concept:** short paragraph
  **How to Answer in Interview:** 3-4 bullet points
  **Example:** 1 concise real-world example
- Do not use markdown code fences.
- Do not include trailing commas.`;

      const secondAttempt = await generateQuestionsFromModels(
        ai,
        strictPrompt,
        modelCandidates,
      );
      questions = secondAttempt.questions;
      console.warn(
        "First generation attempt failed, succeeded on strict retry:",
        firstAttemptError?.message,
      );
      console.log(`Retry AI response received from ${secondAttempt.model}`);
    }

    if (!Array.isArray(questions)) throw new Error("Response is not an array");

    const normalizedQuestions = questions
      .filter(
        (q) => q && typeof q === "object" && typeof q.question === "string",
      )
      .map((q) => ({
        question: q.question.trim(),
        answer: typeof q.answer === "string" ? q.answer.trim() : "",
      }))
      .filter((q) => q.question.length > 0);

    if (normalizedQuestions.length === 0) {
      throw new Error("AI returned no valid questions");
    }

    const saved = await persistQuestions(sessionId, session, normalizedQuestions);
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    console.error("ERROR generating interview questions:", {
      message: error.message,
      name: error.name,
      stack: error.stack?.split("\n").slice(0, 5).join("\n"),
      sessionId: req.body.sessionId,
    });

    if (isQuotaError(error)) {
      const retryAfterSeconds = getRetryAfterSeconds(error);
      if (retryAfterSeconds) {
        res.set("Retry-After", String(retryAfterSeconds));
      }
      return res.status(429).json({
        success: false,
        code: "AI_QUOTA_EXCEEDED",
        retryAfterSeconds: retryAfterSeconds || undefined,
        attemptedModels: Array.isArray(error?.modelAttempts)
          ? error.modelAttempts.map((a) => a.model)
          : getQuestionModelCandidates(),
        message:
          "AI quota exceeded for configured Gemini models. Please retry after cooldown or upgrade quota/billing.",
        ...(process.env.NODE_ENV === "development" && { debug: error.message }),
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to generate questions: " + error.message,
      ...(process.env.NODE_ENV === "development" && { debug: error.message }),
    });
  }
};
// @desc    Toggle the pinned status of a question (bookmark/unbookmark)
// @route   PATCH /api/ai/toggle-pin/:questionId
// @access  Private (requires authentication)
export const togglePinQuestion = async (req, res) => {
  try {
    // Step 1: Extract question ID from URL parameters
    const { questionId } = req.params;

    // Step 2: Find the question in database
    const question = await Question.findById(questionId);
    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }

    // Step 3: Verify ownership - ensure question belongs to user's session
    // This prevents users from modifying other users' questions
    const session = await Session.findById(question.session);
    if (!session || session.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    // Step 4: Toggle the pin status (true -> false, false -> true)
    question.isPinned = !question.isPinned;
    await question.save();

    // Step 5: Return success response with new pin status
    res.status(200).json({
      success: true,
      isPinned: question.isPinned,
    });
  } catch (error) {
    // Handle any database or server errors
    console.error("Error toggling question pin status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle pin status",
      error: error.message,
    });
  }
};

// @desc    Generate detailed explanation for a specific interview question concept
// @route   POST /api/ai/generate-explanation
// @access  Private (requires authentication)
export const generateConceptExplanation = async (req, res) => {
  try {
    // Step 1: Initialize AI client
    const ai = getAIClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        message: "AI service is not configured. Missing GEMINI_API_KEY.",
      });
    }

    // Step 2: Extract question from request body
    const { question } = req.body;

    // Step 3: Validate that question is provided
    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    // Step 4: Generate AI prompt for concept explanation
    const prompt = conceptExplainPrompt(question);

    // Step 5: Generate explanation using AI model
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite", // Use lightweight model for faster response
      contents: prompt,
      config: {
        responseMimeType: "application/json", // Expect structured JSON response
      },
    });

    // Step 6: Extract text from AI response (handles different response formats)
    const rawText =
      response.text || // Direct text response
      response.candidates?.[0]?.content?.parts // Nested content structure
        ?.map((p) => p.text ?? "")
        .join("") ||
      ""; // Fallback to empty string
    // Step 7: Parse the AI response into structured explanation data
    const explanation = parseJsonFromModelText(rawText);

    // Step 8: Validate that response contains required fields
    if (!explanation.title || !explanation.explanation) {
      throw new Error(
        "Response missing required fields: title and explanation",
      );
    }

    // Step 9: Return success response with explanation data
    res.status(200).json({
      success: true,
      data: explanation,
    });
  } catch (error) {
    // Handle any errors during explanation generation
    console.error("Error generating concept explanation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate explanation",
      error: error.message,
    });
  }
};

// @desc    Get a specific interview session with all its questions populated
// @route   GET /api/sessions/:id
// @access  Private (requires authentication)
export const getSessionById = async (req, res) => {
  try {
    // Find session by ID and populate the questions array with full question objects
    // The .populate("questions") replaces question IDs with actual question documents
    const session = await Session.findById(req.params.id).populate("questions");

    // Check if session exists
    if (!session)
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });

    // Return session with populated questions
    res.status(200).json({ success: true, session });
  } catch (error) {
    // Handle database errors
    console.error("Error fetching session:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};




