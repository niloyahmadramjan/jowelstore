import mongoose, { Document, Model, Schema } from "mongoose";

/* ─────────────────────────────────────────────
   Address Interface
───────────────────────────────────────────── */
export interface IAddress {
  _id?: string;
  label: "Home" | "Office" | "Other";
  fullName: string;
  phone: string;
  address: string;
  area: string;
  city: string;
  district: string;
  zip?: string;
  isDefault: boolean;
}

/* ─────────────────────────────────────────────
   User Interface
───────────────────────────────────────────── */
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;

  name: string;
  email: string;
  password?: string;

  phone?: string;
  image?: string;
  dateOfBirth?: Date;
  gender?: "male" | "female" | "other" | "";

  role: "user" | "deliveryman" | "admin";
  isActive: boolean;

  addresses: IAddress[];

  preferences: {
    newsletter: boolean;
    smsAlerts: boolean;
    emailAlerts: boolean;
  };

  createdAt: Date;
  updatedAt: Date;
}

/* ─────────────────────────────────────────────
   Address Schema
───────────────────────────────────────────── */
const addressSchema = new Schema<IAddress>(
  {
    label: {
      type: String,
      enum: ["Home", "Office", "Other"],
      default: "Home",
    },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    zip: { type: String, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

/* ─────────────────────────────────────────────
   User Schema
───────────────────────────────────────────── */
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [60, "Name must be at most 60 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email",
      ],
    },

    password: {
      type: String,
      select: false,
      minlength: [6, "Password must be at least 6 characters"],
    },

    phone: {
      type: String,
      trim: true,
      default: "",
      match: [
        /^[+]?[\d\s\-().]{7,20}$/,
        "Invalid phone number",
      ],
    },

    /* 🔥 image instead of image */
    image: {
      type: String,
      default: "",
    },

    dateOfBirth: {
      type: Date,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },

    role: {
      type: String,
      enum: ["user", "deliveryman", "admin"],
      default: "user",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    /* 🔥 Addresses */
    addresses: {
      type: [addressSchema],
      default: [], // VERY IMPORTANT
    },

    /* 🔥 Preferences */
    preferences: {
      newsletter: { type: Boolean, default: true },
      smsAlerts: { type: Boolean, default: true },
      emailAlerts: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
    versionKey: false,

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
  }
);

/* ─────────────────────────────────────────────
   Indexes
───────────────────────────────────────────── */
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

/* ─────────────────────────────────────────────
   Model Export
───────────────────────────────────────────── */
const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", userSchema);

export default User;