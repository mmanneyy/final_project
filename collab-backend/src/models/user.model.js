import mongoose from "mongoose";
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    username: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-z0-9_]+$/, // allowed characters only
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^\S+@\S+\.\S+$/, // basic email validation
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // excluded from query results by default
    },

    //Disabled users cannot interact with the system.
    status: {
      type: String,
      enum: ["active", "disabled"],
      default: "active",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);
// Ensures email uniqueness and fast lookup during authentication
UserSchema.index({ email: 1 }, { unique: true });

// Ensures username uniqueness and enables fast user search
UserSchema.index({ username: 1 }, { unique: true });

export default mongoose.model("User", UserSchema);