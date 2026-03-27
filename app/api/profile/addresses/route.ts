import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";

/* ─────────────────────────────────────────────
   🔒 Get Current User
───────────────────────────────────────────── */
async function getUser() {
  const session = await auth();

  if (!session?.user?.email) return null;

  await connectDb();

  return await User.findOne({ email: session.user.email });
}

/* ─────────────────────────────────────────────
   ➕ POST → Add new address
───────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    /* If default → remove previous default */
    if (body.isDefault) {
      user.addresses.forEach((addr: any) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push(body);

    await user.save();

    return NextResponse.json({
      message: "Address added",
      addresses: user.addresses,
    });
  } catch {
    return NextResponse.json(
      { message: "Failed to add address" },
      { status: 500 }
    );
  }
}

/* ─────────────────────────────────────────────
   ✏️ PATCH → Update address
───────────────────────────────────────────── */
export async function PATCH(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Address ID required" },
        { status: 400 }
      );
    }

    const body = await req.json();

    /* ✅ FIX: use find instead of .id() */
    const address = user.addresses.find(
      (addr: any) => addr._id.toString() === id
    );

    if (!address) {
      return NextResponse.json(
        { message: "Address not found" },
        { status: 404 }
      );
    }

    /* If default → remove others */
    if (body.isDefault) {
      user.addresses.forEach((addr: any) => {
        addr.isDefault = false;
      });
    }

    /* Update fields */
    Object.assign(address, body);

    await user.save();

    return NextResponse.json({
      message: "Address updated",
      addresses: user.addresses,
    });
  } catch {
    return NextResponse.json(
      { message: "Failed to update address" },
      { status: 500 }
    );
  }
}

/* ─────────────────────────────────────────────
   ❌ DELETE → Remove address
───────────────────────────────────────────── */
export async function DELETE(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Address ID required" },
        { status: 400 }
      );
    }

    const exists = user.addresses.some(
      (addr: any) => addr._id.toString() === id
    );

    if (!exists) {
      return NextResponse.json(
        { message: "Address not found" },
        { status: 404 }
      );
    }

    user.addresses = user.addresses.filter(
      (addr: any) => addr._id.toString() !== id
    );

    await user.save();

    return NextResponse.json({
      message: "Address deleted",
      addresses: user.addresses,
    });
  } catch {
    return NextResponse.json(
      { message: "Failed to delete address" },
      { status: 500 }
    );
  }
}