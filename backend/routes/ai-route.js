/**
 * AI routes for Gemini integration (question generation, explanations).
 * Protected by auth middleware.
 */
import express from "express";
import {
  generateInterviewQuestions,
  generateConceptExplanation,
  getSessionById,
  togglePinQuestion,
} from "../controller/ai-controller.js";
import { protect } from "../middlewares/auth-middleware.js";

const router = express.Router();

router.post("/generate-questions", protect, generateInterviewQuestions);
router.post("/generate-explanation", protect, generateConceptExplanation);
router.patch("/toggle-pin/:questionId", protect, togglePinQuestion);
router.get("/session/:id", protect, getSessionById);

router.patch("/toggle-pin/:questionId", protect, togglePinQuestion);

export default router;
