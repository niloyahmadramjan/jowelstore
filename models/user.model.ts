import mongoose, { mongo } from "mongoose";

interface int_user {
  _id?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "user" | "deliveryman" | "admin";
}

const userScheema = new mongoose.Schema<int_user>(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ["user", "deleveryman", "admin"],
      default: "user",
    },
  },
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model("User", userScheema)
export default User