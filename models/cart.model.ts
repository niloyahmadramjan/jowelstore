import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface ICartItem {
  product:       Types.ObjectId;
  name:          string;
  thumbnail:     string;
  price:         number;
  originalPrice?: number;
  slug:          string;
  unit?:         string;
  category:      string;
  variantLabel?: string;
  quantity:      number;
}

export interface ICart extends Document {
  user:      Types.ObjectId;
  items:     ICartItem[];
  coupon?:   string;
  discount:  number;
  updatedAt: Date;
  subtotal:  number;
  total:     number;
  itemCount: number;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    product:      { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name:         { type: String,  required: true },
    thumbnail:    { type: String,  default: ""    },
    price:        { type: Number,  required: true, min: 0 },
    originalPrice:{ type: Number,  min: 0 },
    slug:         { type: String,  required: true },
    unit:         { type: String  },
    category:     { type: String,  required: true },
    variantLabel: { type: String  },
    quantity:     { type: Number,  required: true, min: 1, default: 1 },
  },
  { _id: true, versionKey: false },
);

const cartSchema = new Schema<ICart>(
  {
    user:     { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items:    { type: [cartItemSchema], default: [] },
    coupon:   { type: String, trim: true, uppercase: true },
    discount: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  },
);

cartSchema.virtual("subtotal").get(function (this: ICart) {
  return this.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
});

cartSchema.virtual("total").get(function (this: ICart) {
  const sub = this.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  return Math.max(0, sub - this.discount);
});

cartSchema.virtual("itemCount").get(function (this: ICart) {
  return this.items.reduce((sum, i) => sum + i.quantity, 0);
});

cartSchema.index({ user: 1 });

const Cart: Model<ICart> =
  mongoose.models.Cart ?? mongoose.model<ICart>("Cart", cartSchema);

export default Cart;