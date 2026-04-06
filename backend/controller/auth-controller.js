import User from "../models/user-model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

/**
 * Generate JWT token for user authentication.
 * @param {string} userId - The MongoDB user ID
 * @returns {string} Signed JWT token
 */
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || "fallback_secret_for_dev";
  // Fixed: Change payload key to 'id' to match middleware decoded.id
  const token = jwt.sign({ id: userId }, secret, { expiresIn: "7d" });
  return token;
};

const isDbUnavailableError = (error) => {
  const message = String(error?.message || "");
  return (
    error?.name === "MongooseServerSelectionError" ||
    message.includes("Could not connect to any servers") ||
    message.includes("ReplicaSetNoPrimary")
  );
};

const safeComparePassword = async (plainPassword, storedHash) => {
  if (!plainPassword || typeof plainPassword !== "string") return false;
  if (!storedHash || typeof storedHash !== "string") return false;

  // bcrypt hashes normally start with "$2". If data is malformed/legacy, avoid throwing.
  if (!storedHash.startsWith("$2")) return plainPassword === storedHash;

  try {
    return await bcrypt.compare(plainPassword, storedHash);
  } catch {
    return false;
  }
};

// Register new user
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!name || !normalizedEmail || !password) {
      return res
        .status(400)
        .json({ message: "Please provide name, email, and password" });
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Login existing user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    const isPasswordValid = await safeComparePassword(password, user?.password);
    if (!user || !isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    if (isDbUnavailableError(error) || mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message:
          "Database connection is unavailable. Please check MongoDB Atlas network access and try again.",
      });
    }

    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
};
