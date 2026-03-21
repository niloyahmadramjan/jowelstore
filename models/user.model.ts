import mongoose, { Document, Model, Schema } from "mongoose";

/* ─────────────────────────────────────────────────────────
   Interface
───────────────────────────────────────────────────────── */
export interface IUser extends Document {
  _id:       mongoose.Types.ObjectId;
  name:      string;
  email:     string;
  password?: string;
  phone?:    string;
  image?:    string;
  role:      "user" | "deliveryman" | "admin";
  isActive:  boolean;
  createdAt: Date;
  updatedAt: Date;
}

/* ─────────────────────────────────────────────────────────
   Schema
───────────────────────────────────────────────────────── */
const userSchema = new Schema<IUser>(
  {
    name: {
      type:      String,
      required:  [true, "Name is required"],
      trim:      true,
      minlength: [2,  "Name must be at least 2 characters"],
      maxlength: [60, "Name must be at most 60 characters"],
    },

    email: {
      type:      String,
      required:  [true, "Email is required"],
      unique:    true,
      lowercase: true,
      trim:      true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    password: {
      type:      String,
      required:  false,
      select:    false,       // never returned unless explicitly requested
      minlength: [6, "Password must be at least 6 characters"],
    },

    phone: {
      type:     String,
      required: false,
      trim:     true,
      match: [
        /^[+]?[\d\s\-().]{7,20}$/,
        "Please provide a valid phone number",
      ],
    },

    image: {
      type:    String,
      default: null,
    },

    role: {
      type:    String,
      enum: {
        values:  ["user", "deliveryman", "admin"] as const,
        message: "{VALUE} is not a valid role",
      },
      default: "user",
    },

    isActive: {
      type:    Boolean,
      default: true,
    },
  },
  {
    timestamps:  true,
    versionKey:  false,

    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        return ret;
      },
    },
    toObject: {
      transform(_doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  },
);

/* ─────────────────────────────────────────────────────────
   Indexes
───────────────────────────────────────────────────────── */
userSchema.index({ role:      1 });
userSchema.index({ isActive:  1 });
userSchema.index({ createdAt: -1 });

/* ─────────────────────────────────────────────────────────
   Model
───────────────────────────────────────────────────────── */
const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ??
  mongoose.model<IUser>("User", userSchema);

export default User;