import Question from "../models/question-model.js";
import Session from "../models/session-model.js";

// @desc    Create a new session
// @route   POST /api/sessions/create
// @access  Private
export const createSession = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }
    const {
      role,
      experience,
      topicsToFocus = "",
      company = "",
      interviewType = "technical",
      difficulty = "medium",
      questionCount = 5,
    } = req.body;
    const userId = req.user._id;
    const normalizedRole = role?.trim();
    const normalizedExperience = experience?.toString().trim();
    const normalizedTopics = topicsToFocus?.trim();
    const normalizedCompany = company?.trim();
    const normalizedQuestionCount = Number(questionCount);

    // Validate required fields
    if (!normalizedRole || !normalizedExperience) {
      return res.status(400).json({
        success: false,
        message: "Role and experience are required",
      });
    }

    if (
      !["technical", "behavioral", "mixed"].includes(interviewType) ||
      !["easy", "medium", "hard"].includes(difficulty)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview type or difficulty",
      });
    }

    if (
      Number.isNaN(normalizedQuestionCount) ||
      normalizedQuestionCount < 3 ||
      normalizedQuestionCount > 12
    ) {
      return res.status(400).json({
        success: false,
        message: "Question count must be between 3 and 12",
      });
    }

    // Create the session
    const session = await Session.create({
      user: userId,
      role: normalizedRole,
      experience: normalizedExperience,
      topicsToFocus: normalizedTopics,
      company: normalizedCompany,
      interviewType,
      difficulty,
      questionCount: normalizedQuestionCount,
      questions: [], // Start with empty questions array
    });

    res.status(201).json({
      success: true,
      session,
    });
  } catch (error) {
    console.error("Create session error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get all sessions for the logged-in user
// @route   GET /api/sessions/my-sessions
// @access  Private
export const getMySessions = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }
    const userId = req.user._id;

    const sessions = await Session.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("questions");

    res.status(200).json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get a session by ID with populated questions
// @route   GET /api/sessions/:id
// @access  Private
export const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate("questions")
      .populate("user", "name email");

    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    // Check if the session belongs to the logged-in user
    if (session.user._id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Delete a session and its associated questions
// @route   DELETE /api/sessions/:id
// @access  Private
export const deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    // Check if the session belongs to the logged-in user
    if (session.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    // Delete associated questions
    await Question.deleteMany({ session: req.params.id });

    // Delete the session
    await Session.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Session deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Toggle pin status for a session
// @route   PATCH /api/sessions/pin/:id
// @access  Private
export const togglePinSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

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

    session.isPinned = !session.isPinned;
    await session.save();

    res.status(200).json({
      success: true,
      isPinned: session.isPinned,
      message: session.isPinned ? "Session pinned" : "Session unpinned",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
