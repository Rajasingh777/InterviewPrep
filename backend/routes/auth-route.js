/**
 * Authentication routes module.
 * Handles user registration (signup) and login.
 * Protected by auth-middleware where needed (public for these).
 */
import express from "express";
import { loginUser, registerUser } from "../controller/auth-controller.js";

const router = express.Router();

// POST /api/auth/signup - Register new user
router.post("/signup", registerUser);

// POST /api/auth/login - Authenticate existing user
router.post("/login", loginUser);

export default router;
