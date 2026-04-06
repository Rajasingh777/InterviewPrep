// Import Mongoose for MongoDB object modeling
import mongoose from "mongoose";

// Define the User schema for storing user account information
// This schema represents registered users in the interview preparation system
const UserSchema = new mongoose.Schema(
  {
    // User's full name - required field for personalization
    name: { type: String, required: true },

    // User's email address - must be unique, automatically converted to lowercase and trimmed
    // Used for authentication and account identification
    email: {
      type: String,
      required: true,
      unique: true, // Ensures no duplicate email addresses
      lowercase: true, // Converts to lowercase for consistency
      trim: true, // Removes leading/trailing whitespace
    },

    // Hashed password for secure authentication
    // Passwords are hashed using bcrypt before storage
    password: { type: String, required: true },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  },
);

// Create the User model from the schema
// This model provides methods for database operations on user documents
const User = mongoose.model("User", UserSchema);

// Export the User model for use in controllers and other parts of the application
export default User;
