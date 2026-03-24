import mongoose, { Document, Model, Schema, Types } from "mongoose";

/* ─────────────────────────────────────────────────────────
   Sub-document interfaces
───────────────────────────────────────────────────────── */
export interface IReview {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  name: string;
  rating: number;
  comment: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IVariant {
  label: string;
  price: number;
  stock: number;
  sku?: string;
}

/* ─────────────────────────────────────────────────────────
   Product interface
───────────────────────────────────────────────────────── */
export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  shortDesc?: string;
  images: string[];
  thumbnail: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  category: string;
  subCategory?: string;
  tags: string[];
  stock: number;
  sku: string;
  unit?: string;
  variants: IVariant[];
  sold: number;
  views: number;
  rating: number;
  numReviews: number;
  reviews: IReview[];
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  metaTitle?: string;
  metaDesc?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  /* Virtuals */
  inStock: boolean;
  discountPercent: number;
}

/* ─────────────────────────────────────────────────────────
   Model interface — add static methods here
───────────────────────────────────────────────────────── */
export interface IProductModel extends Model<IProduct> {
  recalcRating(productId: Types.ObjectId): Promise<void>;
}

/* ─────────────────────────────────────────────────────────
   Review sub-schema
───────────────────────────────────────────────────────── */
const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
    name: {
      type: String,
      required: [true, "Reviewer name is required"],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must be at most 5"],
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      trim: true,
      maxlength: [500, "Comment must be at most 500 characters"],
    },
  },
  { timestamps: true, versionKey: false },
);

/* ─────────────────────────────────────────────────────────
   Variant sub-schema
───────────────────────────────────────────────────────── */
const variantSchema = new Schema<IVariant>(
  {
    label: {
      type: String,
      required: [true, "Variant label is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Variant price is required"],
      min: [0, "Price cannot be negative"],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    sku: {
      type: String,
      trim: true,
    },
  },
  { _id: false, versionKey: false },
);

/* ─────────────────────────────────────────────────────────
   Product schema
───────────────────────────────────────────────────────── */
const productSchema = new Schema<IProduct, IProductModel>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [200, "Name must be at most 200 characters"],
    },

    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must contain only lowercase letters, numbers and hyphens",
      ],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [5000, "Description must be at most 5000 characters"],
    },

    shortDesc: {
      type: String,
      trim: true,
      maxlength: [300, "Short description must be at most 300 characters"],
    },

    images: {
      type: [String],
      default: [],
    },

    thumbnail: {
      type: String,
      required: [true, "Thumbnail image is required"],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    originalPrice: {
      type: Number,
      min: [0, "Original price cannot be negative"],
    },

    discount: {
      type: Number,
      min: [0, "Discount cannot be negative"],
      max: [100, "Discount cannot exceed 100%"],
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      lowercase: true,
      trim: true,
    },

    subCategory: {
      type: String,
      lowercase: true,
      trim: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },

    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },

    unit: {
      type: String,
      trim: true,
      default: "piece",
    },

    variants: {
      type: [variantSchema],
      default: [],
    },

    sold: {
      type: Number,
      default: 0,
      min: [0, "Sold count cannot be negative"],
    },

    views: {
      type: Number,
      default: 0,
      min: [0, "View count cannot be negative"],
    },

    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot exceed 5"],
    },

    numReviews: {
      type: Number,
      default: 0,
      min: [0, "Review count cannot be negative"],
    },

    reviews: {
      type: [reviewSchema],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isNewArrival: {
      type: Boolean,
      default: true,
    },

    metaTitle: {
      type: String,
      trim: true,
      maxlength: [70, "Meta title must be at most 70 characters"],
    },

    metaDesc: {
      type: String,
      trim: true,
      maxlength: [160, "Meta description must be at most 160 characters"],
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Product must have a creator"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

/* ─────────────────────────────────────────────────────────
   Virtuals
───────────────────────────────────────────────────────── */
productSchema.virtual("inStock").get(function (this: IProduct): boolean {
  return this.stock > 0;
});

productSchema.virtual("discountPercent").get(function (this: IProduct): number {
  if (this.discount != null) return this.discount;
  if (this.originalPrice != null && this.originalPrice > this.price) {
    return Math.round(
      ((this.originalPrice - this.price) / this.originalPrice) * 100,
    );
  }
  return 0;
});

/* ─────────────────────────────────────────────────────────
   Pre-save hooks
───────────────────────────────────────────────────────── */

/* Auto-set thumbnail from first image if not provided */
productSchema.pre("save", async function () {
  if (!this.thumbnail && this.images.length > 0) {
    this.thumbnail = this.images[0];
  }
});

/* Auto-calculate discount % from price vs originalPrice */
productSchema.pre("save", async function () {
  if (this.originalPrice != null && this.originalPrice > this.price) {
    this.discount = Math.round(
      ((this.originalPrice - this.price) / this.originalPrice) * 100,
    );
  }
});

/* ─────────────────────────────────────────────────────────
   Static methods
───────────────────────────────────────────────────────── */

/**
 * Recalculate and persist the average rating + review count.
 * Call this after every review add / update / delete.
 *
 * Usage:
 *   await Product.recalcRating(product._id);
 */
productSchema.statics.recalcRating = async function (
  this: IProductModel,
  productId: Types.ObjectId,
): Promise<void> {
  const product = await this.findById(productId);
  if (!product) return;

  const count = product.reviews.length;
  const sum = product.reviews.reduce(
    (acc: number, r: IReview) => acc + r.rating,
    0,
  );

  product.rating = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
  product.numReviews = count;
  await product.save();
};

/* ─────────────────────────────────────────────────────────
   Indexes
───────────────────────────────────────────────────────── */
productSchema.index({ category: 1 });
productSchema.index({ subCategory: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ sold: -1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ tags: 1 });

/* Weighted full-text search */
productSchema.index(
  { name: "text", description: "text", tags: "text", category: "text" },
  { weights: { name: 10, tags: 5, category: 3, description: 1 } },
);

/* ─────────────────────────────────────────────────────────
   Model — hot-reload safe
───────────────────────────────────────────────────────── */
const Product: IProductModel =
  (mongoose.models.Product as IProductModel) ??
  mongoose.model<IProduct, IProductModel>("Product", productSchema);

export default Product;
