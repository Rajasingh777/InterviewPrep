/**
 * Session routes for interview prep sessions.
 * Protected by auth middleware.
 */
import express from "express";
import {
  createSession,
  getMySessions,
  getSessionById,
  deleteSession,
  togglePinSession,
} from "../controller/session-controller.js";
import { protect } from "../middlewares/auth-middleware.js";

const router = express.Router();

router.post("/create", protect, createSession);
router.get("/my-sessions", protect, getMySessions);
router.patch("/pin/:id", protect, togglePinSession);
router.get("/:id", protect, getSessionById);
router.delete("/:id", protect, deleteSession);

export default router;
