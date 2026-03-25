import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Product from "@/models/product.model";
import uploadOnCloudinary from "@/lib/cloudinary";
import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const session = await auth();

    //  Admin check
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    //  Get form data
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const shortDesc = formData.get("shortDesc") as string;
    const category = formData.get("category") as string;
    const price = Number(formData.get("price"));
    const originalPrice = Number(formData.get("originalPrice"));
    const stock = Number(formData.get("stock"));
    const sku = formData.get("sku") as string;
    const unit = formData.get("unit") as string;

    // tags sent as comma separated
    const tags = (formData.get("tags") as string)?.split(",") || [];

    // images
    const thumbnailFile = formData.get("thumbnail") as Blob;
    const imageFiles = formData.getAll("images") as Blob[];

    //  Validation
    if (!name || !description || !category || !price || !sku) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    //  Slug generation
    const slug = slugify(name, { lower: true, strict: true });

    const thumbnailUrl = await uploadOnCloudinary(thumbnailFile);

    if (!thumbnailUrl) {
      return NextResponse.json(
        { message: "Thumbnail upload failed" },
        { status: 500 },
      );
    }

    const imageUrls: string[] = [];

    for (const file of imageFiles) {
      const url = await uploadOnCloudinary(file);
      if (url) imageUrls.push(url);
    }

    // Save product
    const product = await Product.create({
      name,
      slug,
      description,
      shortDesc,
      category,
      price,
      originalPrice,
      stock,
      sku,
      unit,
      tags,
      thumbnail: thumbnailUrl,
      images: imageUrls,
      createdBy: session.user.id,
    });

    return NextResponse.json(
      {
        message: "Product created successfully",
        product,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { message: error.message || "Server error" },
      { status: 500 },
    );
  }
}
