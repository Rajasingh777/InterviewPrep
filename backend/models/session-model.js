// Import Mongoose for MongoDB object modeling
import mongoose from "mongoose";

// Define the Session schema for storing interview preparation sessions
// Each session represents a unique interview preparation scenario with specific parameters
const sessionSchema = new mongoose.Schema(
  {
    // Reference to the user who created this session (required for ownership)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // References the User model
      required: true,
    },

    // Job role for interview preparation (e.g., "MERN Full Stack", "Java Full Stack", "Frontend Developer")
    role: {
      type: String,
      required: true,
    },

    // Years of experience (stored as string to allow flexible input like "2", "1-2", "10+")
    experience: {
      type: String,
      required: true,
    },

    // Specific topics to focus on during interview preparation (optional)
    topicsToFocus: {
      type: String,
      default: "",
    },

    // Target company for interview preparation (optional)
    company: {
      type: String,
      default: "",
    },

    // Type of interview questions to generate
    interviewType: {
      type: String,
      enum: ["technical", "behavioral", "mixed"], // Only these values allowed
      default: "technical", // Default to technical questions
    },

    // Difficulty level of questions
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"], // Only these values allowed
      default: "medium", // Default to medium difficulty
    },

    // Number of questions to generate for this session
    questionCount: {
      type: Number,
      default: 5, // Default to 5 questions
      min: 3, // Minimum 3 questions
      max: 12, // Maximum 12 questions
    },

    // Whether this session is pinned/bookmarked by the user
    isPinned: {
      type: Boolean,
      default: false, // Default to not pinned
    },

    // Array of references to Question documents generated for this session
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question", // References the Question model
      },
    ],
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  },
);

// Create the Session model from the schema
// This model provides methods for database operations on session documents
const Session = mongoose.model("Session", sessionSchema);

// Export the Session model for use in controllers and other parts of the application
export default Session;

// let sessionDoc = {
//   user: "USER_ID",
//   role: "MERN full stack",
//   exp: 2,
//   questions: [],
// };
