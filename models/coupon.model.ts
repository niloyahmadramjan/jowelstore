import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ICoupon extends Document {
  code:          string;
  discountType:  "flat" | "percent";
  discountValue: number;
  minOrder:      number;
  maxDiscount?:  number;
  usageLimit:    number;
  usedCount:     number;
  expiresAt?:    Date;
  isActive:      boolean;
}

const couponSchema = new Schema<ICoupon>(
  {
    code:          { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType:  { type: String, enum: ["flat", "percent"], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minOrder:      { type: Number, default: 0,    min: 0 },
    maxDiscount:   { type: Number, min: 0 },
    usageLimit:    { type: Number, default: 9999  },
    usedCount:     { type: Number, default: 0     },
    expiresAt:     { type: Date },
    isActive:      { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false },
);

couponSchema.index({ code: 1 });

const Coupon: Model<ICoupon> =
  mongoose.models.Coupon ?? mongoose.model<ICoupon>("Coupon", couponSchema);

export default Coupon;