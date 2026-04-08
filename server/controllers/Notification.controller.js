import NotificationModel from "../models/Notification.model.js";
import UserModel from "../models/user.model.js";
import ProductModel from "../models/product.model.js";

// ─────────────────────────────────────────────────────────────────────────────
// 🔔 TRIGGER RESTOCK NOTIFICATIONS
// Call inside your product update controller when stock goes 0 → >0
//
// Usage:
//   import { triggerRestockNotifications } from "./Notification.controller.js";
//   await triggerRestockNotifications(productId);
// ─────────────────────────────────────────────────────────────────────────────
export async function triggerRestockNotifications(productId) {
  try {
    const product = await ProductModel.findById(productId);
    if (!product) return;

    const subscribedUsers = await UserModel.find({
      notify_products: productId,
    }).select("_id");

    if (!subscribedUsers.length) return;

    const notifications = subscribedUsers.map((user) => ({
      userId:    user._id,
      type:      "restock",
      title:     "Product Back in Stock! 🎉",
      message:   `${product.name} is now available. Grab it before it sells out!`,
      productId: product._id,
      orderId:   null,
      isRead:    false,
    }));

    await NotificationModel.insertMany(notifications);

    // Remove product from all subscriptions (fulfilled)
    await UserModel.updateMany(
      { notify_products: productId },
      { $pull: { notify_products: productId } }
    );

    console.log(
      `✅ Restock notifications sent to ${subscribedUsers.length} users for: ${product.name}`
    );
  } catch (error) {
    console.error("❌ triggerRestockNotifications error:", error.message);
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// 🚚 TRIGGER ORDER LIFECYCLE NOTIFICATIONS
// Call this whenever an order status changes to notify the customer.
//
// Usage:
//   import { triggerOrderNotification } from "./Notification.controller.js";
//   await triggerOrderNotification(order, "placed");
//
// Supported events:
//   "placed"            → order just created (COD or UPI)
//   "accepted"          → admin accepted the order
//   "ready_to_dispatch" → order packed and ready
//   "out_for_delivery"  → delivery partner accepted + picked up
//   "delivered"         → order successfully delivered
//   "cancelled"         → order cancelled
//   "return_requested"  → customer requested return
//   "return_accepted"   → delivery partner accepted the return pickup
//   "return_completed"  → return picked and completed
// ─────────────────────────────────────────────────────────────────────────────
export async function triggerOrderNotification(order, event) {
  try {
    if (!order || !order.userId) return;

    // Build a short product summary (max 3 items)
    const itemList = (order.products || [])
      .slice(0, 3)
      .map((p) => `${p.name} x${p.quantity}`)
      .join(", ");
    const extraItems = (order.products || []).length - 3;
    const productSummary =
      extraItems > 0 ? `${itemList} +${extraItems} more` : itemList;

    const orderId = order.orderId || order._id?.toString()?.slice(-6)?.toUpperCase();
    const total   = order.totalAmt ? `₹${order.totalAmt}` : "";

    let title   = "";
    let message = "";

    switch (event) {
      case "placed":
        title   = "Order Placed Successfully ✅";
        message = `Your order #${orderId} has been placed! Items: ${productSummary}. Total: ${total}. We'll notify you when it's accepted.`;
        break;

      case "accepted":
        title   = "Order Accepted 🏪";
        message = `Great news! Your order #${orderId} has been accepted by our store and is being prepared.`;
        break;

      case "ready_to_dispatch":
        title   = "Order Packed & Ready 📦";
        message = `Your order #${orderId} is packed and ready to go! A delivery partner will pick it up shortly.`;
        break;

      case "out_for_delivery":
        title   = "Out for Delivery 🛵";
        message = `Your order #${orderId} is on its way! Our delivery partner has picked it up. Keep your OTP ready.`;
        break;

      case "delivered":
        title   = "Order Delivered 🎉";
        message = `Your order #${orderId} has been delivered successfully. Enjoy your items! Thank you for shopping with us.`;
        break;

      case "cancelled":
        title   = "Order Cancelled ❌";
        message = `Your order #${orderId} has been cancelled. If any amount was charged, it will be refunded within 3–5 business days.`;
        break;

      case "return_requested":
        title   = "Return Request Received 🔄";
        message = `We've received your return request for order #${orderId}. A delivery partner will be assigned to pick it up soon.`;
        break;

      case "return_accepted":
        title   = "Return Pickup On the Way 🚚";
        message = `Your return for order #${orderId} has been accepted. Our delivery partner is heading to your location.`;
        break;

      case "return_completed":
        title   = "Return Completed ✅";
        message = `Your return for order #${orderId} has been successfully completed. Your refund will be processed shortly.`;
        break;

      default:
        console.warn(`⚠️ Unknown order notification event: ${event}`);
        return;
    }

    await NotificationModel.create({
      userId:    order.userId,
      type:      "order",
      title,
      message,
      productId: null,
      orderId:   order._id,   // lets the frontend navigate to order detail screen
      isRead:    false,
    });

    console.log(`✅ Order notification [${event}] → user: ${order.userId}`);
  } catch (error) {
    console.error(`❌ triggerOrderNotification [${event}] error:`, error.message);
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// 📋 GET ALL NOTIFICATIONS  —  GET /api/notification/get
// ─────────────────────────────────────────────────────────────────────────────
export async function getNotificationsController(req, res) {
  try {
    const userId = req.userId;

    const notifications = await NotificationModel.find({ userId })
      .populate("productId", "name image price stock")
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await NotificationModel.countDocuments({
      userId,
      isRead: false,
    });

    return res.json({
      message:     "Notifications fetched",
      success:     true,
      error:       false,
      data:        notifications,
      unreadCount,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error:   true,
      success: false,
    });
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// ✅ MARK ONE AS READ  —  PUT /api/notification/mark-read/:id
// ─────────────────────────────────────────────────────────────────────────────
export async function markNotificationReadController(req, res) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    await NotificationModel.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true }
    );

    return res.json({ message: "Marked as read", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: error.message, error: true, success: false });
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// ✅ MARK ALL AS READ  —  PUT /api/notification/mark-all-read
// ─────────────────────────────────────────────────────────────────────────────
export async function markAllNotificationsReadController(req, res) {
  try {
    const userId = req.userId;
    await NotificationModel.updateMany({ userId, isRead: false }, { isRead: true });
    return res.json({ message: "All marked as read", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: error.message, error: true, success: false });
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// 🗑️ DELETE ONE  —  DELETE /api/notification/delete/:id
// ─────────────────────────────────────────────────────────────────────────────
export async function deleteNotificationController(req, res) {
  try {
    const userId = req.userId;
    const { id } = req.params;
    await NotificationModel.findOneAndDelete({ _id: id, userId });
    return res.json({ message: "Notification deleted", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: error.message, error: true, success: false });
  }
}