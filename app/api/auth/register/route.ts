// /api/auth/register

import connectDb from "@/lib/db";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { name, email, password, mobile } = await req.json();
    const exist_user = await User.findOne({ email });
    if (exist_user) {
      return NextResponse.json({
        message: "Email already exist!",
        status: 400,
      });
    }
    if (password.length < 6) {
      return NextResponse.json({
        message: "Password must be at least 6 characters!",
        status: 400,
      });
    }

    const hashed_pass = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, hashed_pass, mobile });
    return NextResponse.json({
      data: user,
      message: "Congratulation your account created successfully.",
      status: 200,
    });
  } catch (error) {
    return NextResponse.json({
      message: error,
      status: 500,
    });
  }
}

// name , email , password , phone

/**
 *  /api/auth/register (post req)
 * client side sent name , email , password , mobile ,
 * password min 6 character & hash the password use bycriptjs sold 10
 * connect db frist hen check user already exist or not
 */
