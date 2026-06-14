// PURPOSE: Defines the shape of every user document in MongoDB.
// Every user — candidate, recruiter, admin — uses this schema.
// WHY ONE SCHEMA: Role field differentiates behavior.
// Simpler than maintaining 3 separate collections.

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,                    // removes leading/trailing spaces
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,                  // no two users with same email
      lowercase: true,               // always store as lowercase
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false   // CRITICAL: never return password in queries by default
    },
    role: {
      type: String,
      enum: ['candidate', 'recruiter', 'admin'],  // only these 3 values allowed
      default: 'candidate'
    },
    // Only relevant for candidates
    resume: {
      type: String,      // Cloudinary URL
      default: null
    },
    // Only relevant for recruiters
    company: {
      type: String,
      trim: true,
      default: null
    },
    website: {
      type: String,
      default: null
    },

    avatar: {
      type: String,
      default: null
    },

    isActive: {
      type: Boolean,
      default: true      // admin can deactivate accounts
    },
    refreshToken: {
      type: String,
      default: null,
      select: false      // never return this in queries
    }
  },
  {
    timestamps: true     // auto-adds createdAt and updatedAt fields
  }
);

// ─── MONGOOSE MIDDLEWARE (Pre-save Hook) ───────────────────────
// This runs AUTOMATICALLY before every .save() call
// Perfect place to hash passwords
// We'll explain bcrypt deeply on Day 3

userSchema.pre('save', async function (next) {
  // Only hash if password was actually changed
  // (prevents re-hashing on profile updates)
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ─── INSTANCE METHOD ───────────────────────────────────────────
// Custom method available on every User document
// user.comparePassword("entered password") → true/false

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;