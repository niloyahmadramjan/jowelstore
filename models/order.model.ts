import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

/* ── Sub-documents ──────────────────────────────────── */
export interface IOrderItem {
  product:      Types.ObjectId;
  name:         string;
  thumbnail:    string;
  slug:         string;
  price:        number;
  originalPrice?: number;
  quantity:     number;
  unit?:        string;
  variantLabel?: string;
}

export interface IShippingAddress {
  fullName:  string;
  phone:     string;
  address:   string;
  area:      string;
  city:      string;
  district:  string;
  zip?:      string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentMethod = "bkash" | "nagad" | "rocket" | "cash_on_delivery" | "card";
export type PaymentStatus = "unpaid" | "paid" | "refunded";

/* ── Order interface ────────────────────────────────── */
export interface IOrder extends Document {
  _id:             Types.ObjectId;
  orderId:         string;           // human-readable e.g. JS-20240315-001
  user:            Types.ObjectId;
  items:           IOrderItem[];
  shippingAddress: IShippingAddress;
  subtotal:        number;
  discount:        number;
  deliveryCharge:  number;
  total:           number;
  coupon?:         string;
  status:          OrderStatus;
  paymentMethod:   PaymentMethod;
  paymentStatus:   PaymentStatus;
  paymentRef?:     string;
  note?:           string;
  statusHistory:   { status: OrderStatus; at: Date; note?: string }[];
  deliveredAt?:    Date;
  createdAt:       Date;
  updatedAt:       Date;
}

/* ── Item sub-schema ────────────────────────────────── */
const orderItemSchema = new Schema<IOrderItem>(
  {
    product:      { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name:         { type: String, required: true },
    thumbnail:    { type: String, default: "" },
    slug:         { type: String, required: true },
    price:        { type: Number, required: true, min: 0 },
    originalPrice:{ type: Number, min: 0 },
    quantity:     { type: Number, required: true, min: 1 },
    unit:         { type: String },
    variantLabel: { type: String },
  },
  { _id: true, versionKey: false },
);

/* ── Shipping address sub-schema ────────────────────── */
const shippingSchema = new Schema<IShippingAddress>(
  {
    fullName: { type: String, required: true, trim: true },
    phone:    { type: String, required: true, trim: true },
    address:  { type: String, required: true, trim: true },
    area:     { type: String, required: true, trim: true },
    city:     { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    zip:      { type: String, trim: true },
  },
  { _id: false, versionKey: false },
);

/* ── Order schema ───────────────────────────────────── */
const orderSchema = new Schema<IOrder>(
  {
    orderId: {
      type:     String,
      unique:   true,
      required: true,
    },
    user: {
      type:     Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    items:           { type: [orderItemSchema], required: true },
    shippingAddress: { type: shippingSchema,    required: true },
    subtotal:        { type: Number, required: true, min: 0 },
    discount:        { type: Number, default: 0, min: 0 },
    deliveryCharge:  { type: Number, default: 0, min: 0 },
    total:           { type: Number, required: true, min: 0 },
    coupon:          { type: String },
    status: {
      type:    String,
      enum:    ["pending","confirmed","processing","shipped","delivered","cancelled","refunded"],
      default: "pending",
    },
    paymentMethod: {
      type:     String,
      enum:     ["bkash","nagad","rocket","cash_on_delivery","card"],
      required: true,
    },
    paymentStatus: {
      type:    String,
      enum:    ["unpaid","paid","refunded"],
      default: "unpaid",
    },
    paymentRef:   { type: String },
    note:         { type: String, maxlength: 500 },
    statusHistory: [{
      status: { type: String, required: true },
      at:     { type: Date,   default: Date.now },
      note:   { type: String },
    }],
    deliveredAt: { type: Date },
  },
  { timestamps: true, versionKey: false },
);

/* ── Indexes ────────────────────────────────────────── */
orderSchema.index({ user:    1, createdAt: -1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ status:  1 });

/* ── Auto-generate orderId ──────────────────────────── */
orderSchema.pre<IOrder>("save", async function () {
  if (!this.isNew) return;
  const date  = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const count = await (this.constructor as Model<IOrder>).countDocuments();
  this.orderId = `JS-${date}-${String(count + 1).padStart(4, "0")}`;
});

const Order: Model<IOrder> =
  mongoose.models.Order ?? mongoose.model<IOrder>("Order", orderSchema);

export default Order;