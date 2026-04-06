/**
 * Question routes (pin toggle etc.).
 */
import express from "express";
import { togglePinQuestion } from "../controller/ai-controller.js";
import { protect } from "../middlewares/auth-middleware.js";

const router = express.Router({ mergeParams: true });

router.patch("/toggle-pin/:questionId", protect, togglePinQuestion);

export default router;
