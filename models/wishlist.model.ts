import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface IWishlistItem {
  product:   Types.ObjectId;
  name:      string;
  thumbnail: string;
  price:     number;
  originalPrice?: number;
  slug:      string;
  category:  string;
  unit?:     string;
  addedAt:   Date;
}

export interface IWishlist extends Document {
  user:  Types.ObjectId;
  items: IWishlistItem[];
}

const wishlistItemSchema = new Schema<IWishlistItem>(
  {
    product:      { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name:         { type: String, required: true },
    thumbnail:    { type: String, default: ""   },
    price:        { type: Number, required: true, min: 0 },
    originalPrice:{ type: Number, min: 0 },
    slug:         { type: String, required: true },
    category:     { type: String, required: true },
    unit:         { type: String },
    addedAt:      { type: Date,   default: Date.now },
  },
  { _id: true, versionKey: false },
);

const wishlistSchema = new Schema<IWishlist>(
  {
    user:  { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: { type: [wishlistItemSchema], default: [] },
  },
  { timestamps: true, versionKey: false },
);

wishlistSchema.index({ "items.product": 1 });

const Wishlist: Model<IWishlist> =
  mongoose.models.Wishlist ?? mongoose.model<IWishlist>("Wishlist", wishlistSchema);

export default Wishlist;