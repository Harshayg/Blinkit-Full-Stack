import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      index:    true,
    },
    type: {
      type:    String,
      // "order" covers all order lifecycle events
      enum:    ["restock", "order", "promo", "general"],
      default: "general",
    },
    title: {
      type:     String,
      required: true,
    },
    message: {
      type:     String,
      required: true,
    },
    // ── For restock notifications ──────────────────────────────────
    productId: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     "product",
      default: null,
    },
    // ── For order notifications ────────────────────────────────────
    // Stores the Order _id so the frontend can navigate to the order detail screen
    orderId: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     "order",
      default: null,
    },
    isRead: {
      type:    Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const NotificationModel = mongoose.model("Notification", notificationSchema);

export default NotificationModel;