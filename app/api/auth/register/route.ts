import connectDb          from "@/lib/db";
import User               from "@/models/user.model";
import bcrypt             from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const { name, email, password, mobile } = await req.json();

    /* Basic validation */
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email and password are required." },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters." },
        { status: 400 },
      );
    }

    /* Check duplicate */
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 400 },
      );
    }

    /* Hash password */
    const hashed = await bcrypt.hash(password, 10);

    /* Create user — field name is "phone" in schema, not "mobile" */
    const user = await User.create({
      name,
      email:    email.toLowerCase().trim(),
      password: hashed,
      phone:    mobile,   // ✅ fixed: mobile → phone
    });

    return NextResponse.json(
      { message: "Account created successfully.", data: { id: user._id, email: user.email } },
      { status: 201 },
    );

  } catch (error) {
    console.error("[Register Error]", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}