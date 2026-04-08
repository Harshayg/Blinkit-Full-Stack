import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import DeliveryPartnerModel from '../models/deliveryPartner.model.js';
import generatedAccessToken from '../utils/generatedAccessToken.js';
import genertedRefreshToken from '../utils/generatedRefreshToken.js';
import uploadImageClodinary from '../utils/uploadImageClodinary.js';
import generatePickupBarcode from '../utils/generatePickupBarcode.js';
import OrderModel from '../models/order.model.js';
import sendEmail from '../config/sendEmail.js';
import orderStatusEmailTemplate from '../utils/orderStatusEmailTemplate.js';
// 🔔 Notification helper
import { triggerOrderNotification } from './Notification.controller.js';


// ─── Helper ───────────────────────────────────────────────────────────────────
function calculateDeliveryEarning(subTotal) {
  let earning = subTotal * 0.10;
  if (earning > 105) earning = 105;
  if (earning > 85 && subTotal < 2000) earning = 85;
  return Math.round(earning);
}


// ─── REGISTER ─────────────────────────────────────────────────────────────────
export async function registerDeliveryPartnerController(request, response) {
  try {
    const { name, email, phone, password, vehicleId, aadharId, photo } = request.body;

    if (!name || !email || !phone || !password || !vehicleId || !aadharId) {
      return response.status(400).json({
        message: "Please provide all required fields",
        error: true,
        success: false,
      });
    }

    const existing = await DeliveryPartnerModel.findOne({ email });
    if (existing) {
      return response.status(400).json({
        message: "Email already registered",
        error: true,
        success: false,
      });
    }

    const salt         = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);

    const newPartner = new DeliveryPartnerModel({
      name,
      email,
      phone,
      password: hashPassword,
      vehicleId,
      aadharId,
      photo: photo || null,
    });

    const save = await newPartner.save();

    return response.status(201).json({
      message: "Delivery partner registered successfully.",
      error: false,
      success: true,
      data: {
        _id:   save._id,
        name:  save.name,
        email: save.email,
        phone: save.phone,
      },
    });
  } catch (error) {
    console.error("Error in registration:", error);
    return response.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}


// ─── LOGIN ────────────────────────────────────────────────────────────────────
export async function loginDeliveryPartnerController(request, response) {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      return response.status(400).json({
        message: "Provide email and password",
        error: true,
        success: false,
      });
    }

    const partner = await DeliveryPartnerModel.findOne({ email });
    if (!partner) {
      return response.status(400).json({
        message: "Delivery partner not registered",
        error: true,
        success: false,
      });
    }

    const checkPassword = await bcryptjs.compare(password, partner.password);
    if (!checkPassword) {
      return response.status(400).json({
        message: "Incorrect password",
        error: true,
        success: false,
      });
    }

    const accesstoken  = await generatedAccessToken(partner._id);
    const refreshToken = await genertedRefreshToken(partner._id);

    const cookiesOption = { httpOnly: true, secure: true, sameSite: "None" };
    response.cookie("accessToken",  accesstoken,  cookiesOption);
    response.cookie("refreshToken", refreshToken, cookiesOption);

    return response.json({
      message: "Login successfully",
      error: false,
      success: true,
      data: {
        accesstoken,
        refreshToken,
        partner: {
          id:        partner._id,
          name:      partner.name,
          email:     partner.email,
          phone:     partner.phone,
          vehicleId: partner.vehicleId,
          aadharId:  partner.aadharId,
          photo:     partner.photo || null,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return response.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}


// ─── GET PROFILE ──────────────────────────────────────────────────────────────
export const getDeliveryPartnerProfile = async (req, res) => {
  try {
    const deliveryPartner = await DeliveryPartnerModel.findById(req.userId).select("-password");

    if (!deliveryPartner) {
      return res.status(404).json({
        message: "Delivery partner not found",
        error: true,
        success: false,
      });
    }

    const now        = new Date();
    const todayStart = new Date().setHours(0, 0, 0, 0);

    let todayActivity = deliveryPartner.activity.find(
      (a) => new Date(a.date).setHours(0, 0, 0, 0) === todayStart
    );

    let totalOnlineMinutes   = 0;
    let totalDeliveryMinutes = 0;

    if (todayActivity) {
      totalDeliveryMinutes = todayActivity.totalDeliveryMinutes || 0;

      for (const session of todayActivity.sessions) {
        let end = session.offlineAt ? new Date(session.offlineAt) : now;
        totalOnlineMinutes += Math.floor((end - new Date(session.onlineAt)) / 60000);
      }
    }

    const hours   = Math.floor(totalOnlineMinutes / 60);
    const minutes = totalOnlineMinutes % 60;

    return res.status(200).json({
      message: "Profile fetched successfully",
      success: true,
      error: false,
      data: {
        ...deliveryPartner.toObject(),
        status:               deliveryPartner.status,
        todayOnlineTime:      `${hours}h ${minutes}m`,
        totalOnlineMinutes,
        totalDeliveryMinutes,
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return res.status(500).json({
      message: "Server error while fetching profile",
      success: false,
      error: true,
    });
  }
};


// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────
export const updateDeliveryPartnerProfile = async (req, res) => {
  try {
    const { name, mobile } = req.body;

    const updatedProfile = await DeliveryPartnerModel.findByIdAndUpdate(
      req.userId,
      { $set: { name, mobile } },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedProfile) {
      return res.status(404).json({
        message: "Delivery partner not found",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      success: true,
      error: false,
      data: updatedProfile,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating profile",
      success: false,
      error: true,
    });
  }
};


// ─── UPLOAD AVATAR ────────────────────────────────────────────────────────────
export async function uploadDeliveryPartnerAvatar(request, response) {
  try {
    const deliveryPartnerId = request.userId;
    const image             = request.file;

    if (!image) {
      return response.status(400).json({
        message: "No image file provided.",
        error: true,
        success: false,
      });
    }

    const upload = await uploadImageClodinary(image);

    const updated = await DeliveryPartnerModel.findByIdAndUpdate(
      deliveryPartnerId,
      { photo: upload.url },
      { new: true }
    );

    return response.json({
      message: "Delivery partner avatar uploaded",
      success: true,
      error: false,
      data: {
        _id:   updated._id,
        photo: updated.photo,
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Failed to upload photo.",
      error: true,
      success: false,
    });
  }
}


// ─── GET UNASSIGNED ORDERS ────────────────────────────────────────────────────
export async function getUnassignedOrdersController(req, res) {
  try {
    const pendingOrders = await OrderModel.find({
      deliveryPartner:  null,
      delivery_status:  'Ready to Dispatch',
      order_status:     { $nin: ['Cancelled', 'Returned'] },
    })
      .populate({ path: 'products.productId', model: 'product' })
      .populate('userId', 'name email phone')
      .populate('delivery_address');

    const formattedPending = pendingOrders.map(order => {
      const orderObj = order.toObject();
      return {
        ...orderObj,
        type:                   "Original",
        deliveryPartnerEarning: calculateDeliveryEarning(orderObj.subTotalAmt || 0),
      };
    });

    const returnOrders = await OrderModel.find({
      deliveryPartner: null,
      delivery_status: 'Return Requested',
      order_type:      'Return',
      order_status:    { $nin: ['Cancelled', 'Returned'] },
    })
      .populate({ path: 'products.productId', model: 'product' })
      .populate('userId', 'name email phone')
      .populate('delivery_address');

    const formattedReturns = returnOrders.map(order => {
      const orderObj = order.toObject();
      return {
        ...orderObj,
        type:                   "Return",
        deliveryPartnerEarning: calculateDeliveryEarning(orderObj.subTotalAmt || 0),
      };
    });

    const combinedOrders = [...formattedPending, ...formattedReturns];

    return res.json({
      message: 'Unassigned orders fetched successfully.',
      error:   false,
      success: true,
      data:    combinedOrders,
    });
  } catch (error) {
    console.error('Error fetching unassigned orders:', error);
    return res.status(500).json({
      message: error.message || 'Internal server error',
      error:   true,
      success: false,
    });
  }
}


// ─── ACCEPT ORDER ─────────────────────────────────────────────────────────────
// 🔔 Triggers "out_for_delivery" notification for original orders
//    and "return_accepted" for return orders
export async function acceptOrderController(request, response) {
  try {
    const deliveryPartnerId = request.userId;
    const { orderIds }      = request.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return response.status(400).json({
        message: "orderIds must be a non-empty array.",
        error: true,
        success: false,
      });
    }

    const updatedOrders = [];

    for (const id of orderIds) {
      const order = await OrderModel.findById(id);

      // Skip invalid / already assigned / terminal status
      if (
        !order ||
        order.deliveryPartner ||
        ['Cancelled', 'Returned', 'Delivered'].includes(order.delivery_status)
      ) continue;

      // Only accept "Ready to Dispatch" or "Return Requested"
      if (order.delivery_status === "Ready to Dispatch") {
        order.delivery_status = "Out for Delivery";
      } else if (order.delivery_status === "Return Requested") {
        order.delivery_status = "Return Accepted";
      } else {
        continue;
      }

      // Assign delivery partner
      order.deliveryPartner = deliveryPartnerId;

      // Auto-generate pickup barcode
      order.pickupBarcode            = generatePickupBarcode(order._id.toString());
      order.pickupBarcodeGeneratedAt = new Date();
      order.pickupConfirmed          = false;
      order.pickupConfirmedAt        = null;

      await order.save();

      // 🔔 Notify customer
      if (order.order_type === "Return") {
        await triggerOrderNotification(order, "return_accepted");
      } else {
        await triggerOrderNotification(order, "out_for_delivery");
      }

      updatedOrders.push(order);
    }

    if (updatedOrders.length === 0) {
      return response.status(404).json({
        message: "No valid orders found to accept.",
        error: true,
        success: false,
      });
    }

    // Set delivery partner status to busy
    await DeliveryPartnerModel.findByIdAndUpdate(deliveryPartnerId, { status: "busy" });

    return response.status(200).json({
      message: "Orders accepted successfully.",
      error:   false,
      success: true,
      data:    updatedOrders,
    });

  } catch (error) {
    console.error("Error accepting orders:", error);
    return response.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
}


// ─── GET ASSIGNED ORDERS ──────────────────────────────────────────────────────
export const getAssignedOrdersController = async (req, res) => {
  try {
    const deliveryPartnerId = req.userId;

    if (!deliveryPartnerId) {
      return res.status(401).json({
        message: "Unauthorized: Delivery partner ID missing",
        error: true,
        success: false,
      });
    }

    const assignedOrders = await OrderModel.find({
      deliveryPartner: deliveryPartnerId,
      delivery_status: { $ne: "Delivered" },
    })
      .populate("userId", "name email phone")
      .populate("products.productId")
      .populate("delivery_address");

    const formattedAssigned = assignedOrders.map(order => {
      const orderObj = order.toObject();
      return {
        ...orderObj,
        deliveryPartnerEarning: calculateDeliveryEarning(orderObj.subTotalAmt || 0),
        type: orderObj.order_type === "Return" ? "Return" : "Original",
      };
    });

    return res.status(200).json({
      message: "Assigned orders fetched successfully.",
      error:   false,
      success: true,
      data:    formattedAssigned,
    });
  } catch (error) {
    console.error("Error fetching assigned orders:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: true,
      success: false,
    });
  }
};


// ─── UPDATE DELIVERY STATUS ───────────────────────────────────────────────────
// 🔔 Notifies customer on every status change
export const updateDeliveryStatusController = async (req, res) => {
  try {
    const deliveryPartnerId = req.userId;
    const { orderId, newStatus } = req.body;

    if (!orderId || !newStatus) {
      return res.status(400).json({
        message: "orderId and newStatus are required",
        error: true,
        success: false,
      });
    }

    const order = await OrderModel.findOne({
      _id:             orderId,
      deliveryPartner: deliveryPartnerId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found or not assigned to you",
        error: true,
        success: false,
      });
    }

    const originalStatuses = ["Out for Delivery", "Delivered"];
    const returnStatuses   = ["Return Accepted", "Return Picked", "Return Completed"];

    if (
      (order.order_type === "Original" && !originalStatuses.includes(newStatus)) ||
      (order.order_type === "Return"   && !returnStatuses.includes(newStatus))
    ) {
      return res.status(400).json({
        message: `Invalid status for ${order.order_type} order.`,
        error: true,
        success: false,
      });
    }

    order.delivery_status = newStatus;
    const now             = new Date();

    if (order.order_type === "Original" && newStatus === "Delivered") {
      order.isDelivered   = true;
      order.delivery_time = now;

      const partner = await DeliveryPartnerModel.findById(deliveryPartnerId);
      if (partner) {
        const today = new Date().setHours(0, 0, 0, 0);
        let todayActivity = partner.activity.find(
          (a) => new Date(a.date).setHours(0, 0, 0, 0) === today
        );

        if (!todayActivity) {
          todayActivity = { date: now, sessions: [], totalOnlineMinutes: 0, totalDeliveryMinutes: 0 };
          partner.activity.push(todayActivity);
        }

        if (order.delivery_time && order.order_time && order.delivery_time > order.order_time) {
          const durationMs      = order.delivery_time - order.order_time;
          const durationMinutes = Math.floor(durationMs / 60000);
          todayActivity.totalDeliveryMinutes += durationMinutes;
        }

        await partner.save();
      }
    }

    if (order.order_type === "Return" && newStatus === "Return Completed") {
      order.products = order.products.map(product => ({
        ...product.toObject(),
        isReturned:   true,
        returnStatus: "Return Completed"
      }));
      order.returnCancelledAt = null;
    }

    await order.save();

    // 🔔 Notify customer of the status change
    const eventMap = {
      "Out for Delivery": "out_for_delivery",
      "Delivered":        "delivered",
      "Return Accepted":  "return_accepted",
      "Return Picked":    "return_accepted",    // reuse accepted message for mid-step
      "Return Completed": "return_completed",
    };
    const notifEvent = eventMap[newStatus];
    if (notifEvent) {
      await triggerOrderNotification(order, notifEvent);
    }

    // Reset partner status if no remaining active orders
    const remainingOrders = await OrderModel.countDocuments({
      deliveryPartner: deliveryPartnerId,
      delivery_status: { $nin: ["Delivered", "Return Completed"] },
    });

    if (remainingOrders === 0) {
      await DeliveryPartnerModel.findByIdAndUpdate(deliveryPartnerId, { status: "online" });
    }

    return res.status(200).json({
      message: "Delivery status updated successfully.",
      error:   false,
      success: true,
      data:    order,
    });

  } catch (error) {
    console.error("Error updating delivery status:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: true,
      success: false,
    });
  }
};


// ─── VERIFY DELIVERY OTP ──────────────────────────────────────────────────────
// 🔔 Triggers "delivered" notification on successful OTP verification
export const verifyDeliveryOTPController = async (req, res) => {
  try {
    const deliveryPartnerId = req.userId;
    const { orderId, enteredOTP } = req.body;

    if (!orderId || !enteredOTP) {
      return res.status(400).json({
        message: "orderId and enteredOTP are required",
        error: true,
        success: false,
      });
    }

    const order = await OrderModel.findOne({
      _id:             orderId,
      deliveryPartner: deliveryPartnerId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found or not assigned to this delivery partner",
        error: true,
        success: false,
      });
    }

    if (order.delivery_otp !== enteredOTP) {
      return res.status(400).json({
        message: "Invalid OTP",
        error: true,
        success: false,
      });
    }

    order.isDelivered   = true;
    order.delivery_status = "Delivered";
    order.delivery_time = new Date();

    // Delivery time tracking
    const partner = await DeliveryPartnerModel.findById(deliveryPartnerId);
    if (partner) {
      const now   = new Date();
      const today = new Date().setHours(0, 0, 0, 0);

      let todayActivity = partner.activity.find(
        (a) => new Date(a.date).setHours(0, 0, 0, 0) === today
      );

      if (!todayActivity) {
        todayActivity = { date: now, sessions: [], totalOnlineMinutes: 0, totalDeliveryMinutes: 0 };
        partner.activity.push(todayActivity);
      }

      if (order.delivery_time && order.order_time && order.delivery_time > order.order_time) {
        const durationMs      = order.delivery_time - order.order_time;
        const durationMinutes = Math.floor(durationMs / 60000);
        todayActivity.totalDeliveryMinutes += durationMinutes;
      }

      await partner.save();
    }

    await order.save();

    // 🔔 Notify customer: order delivered
    await triggerOrderNotification(order, "delivered");

    const remainingOrders = await OrderModel.countDocuments({
      deliveryPartner: deliveryPartnerId,
      delivery_status: { $ne: "Delivered" },
    });

    if (remainingOrders === 0) {
      await DeliveryPartnerModel.findByIdAndUpdate(deliveryPartnerId, { status: "online" });
    }

    return res.status(200).json({
      message: "OTP verified and order marked as delivered",
      error:   false,
      success: true,
      data:    order,
    });
  } catch (err) {
    console.error("OTP verification error:", err);
    return res.status(500).json({
      message: "Internal Server Error",
      error:   true,
      success: false,
    });
  }
};


// ─── LOGOUT ───────────────────────────────────────────────────────────────────
export const logoutDeliveryPartner = async (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure:   true,
      sameSite: "None",
    });

    return res.status(200).json({
      message: "Logout successful",
      error:   false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Logout failed",
      error:   true,
      success: false,
    });
  }
};


// ─── DELIVERY HISTORY ─────────────────────────────────────────────────────────
export const getDeliveryHistory = async (request, response) => {
  try {
    const deliveryPartnerId = request.userId;

    const deliveredOrders = await OrderModel.find({
      deliveryPartner: deliveryPartnerId,
      isDelivered:     true,
    })
      .populate("userId", "name email")
      .populate("products.productId")
      .populate("delivery_address");

    const deliveredOrdersWithEarning = deliveredOrders.map(order => {
      const orderObj = order.toObject();
      return {
        ...orderObj,
        deliveryPartnerEarning: calculateDeliveryEarning(orderObj.subTotalAmt || 0),
      };
    });

    return response.status(200).json({
      message: "Delivery history fetched successfully.",
      error:   false,
      success: true,
      data:    deliveredOrdersWithEarning,
    });
  } catch (error) {
    console.error("Error fetching delivery history:", error);
    return response.status(500).json({
      message: "Failed to fetch delivery history.",
      error:   true,
      success: false,
    });
  }
};


// ─── UPDATE PARTNER STATUS ────────────────────────────────────────────────────
export const updateDeliveryPartnerStatusController = async (req, res) => {
  try {
    const deliveryPartnerId = req.userId;
    const { status }        = req.body;

    const validStatuses = ["active", "online", "busy", "offline"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed values: ${validStatuses.join(", ")}`,
        error: true,
        success: false,
      });
    }

    const partner = await DeliveryPartnerModel.findById(deliveryPartnerId);
    if (!partner) {
      return res.status(404).json({
        message: "Delivery partner not found",
        error: true,
        success: false,
      });
    }

    const now   = new Date();
    const today = new Date().setHours(0, 0, 0, 0);

    let todayActivity = partner.activity.find(
      (a) => new Date(a.date).setHours(0, 0, 0, 0) === today
    );

    if (!todayActivity) {
      todayActivity = { date: now, sessions: [], totalOnlineMinutes: 0, totalDeliveryMinutes: 0 };
      partner.activity.push(todayActivity);
    }

    if (status === "online") {
      todayActivity.sessions.push({ onlineAt: now });
    } else if (status === "offline") {
      const sessions = todayActivity.sessions;
      if (sessions.length > 0) {
        const latest = sessions[sessions.length - 1];
        if (!latest.offlineAt) {
          latest.offlineAt       = now;
          const durationMs       = now - new Date(latest.onlineAt);
          const durationMinutes  = Math.floor(durationMs / 60000);
          latest.durationMinutes = durationMinutes;
          todayActivity.totalOnlineMinutes += durationMinutes;
        }
      }
    }

    partner.status = status;
    await partner.save();

    return res.status(200).json({
      message: "Status updated successfully",
      success: true,
      error:   false,
      data:    partner,
    });
  } catch (error) {
    console.error("Status update error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error:   true,
    });
  }
};


// ─── UPDATE PARTNER RATING ────────────────────────────────────────────────────
export const updateDeliveryPartnerRatingController = async (req, res) => {
  try {
    const deliveryPartnerId = req.userId;
    const { rating }        = req.body;

    if (typeof rating !== "number" || rating < 0 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be a number between 0 and 5",
        error: true,
        success: false,
      });
    }

    const updated = await DeliveryPartnerModel.findByIdAndUpdate(
      deliveryPartnerId,
      { rating },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      message: "Rating updated successfully",
      success: true,
      error:   false,
      data:    updated,
    });
  } catch (error) {
    console.error("Rating update error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error:   true,
    });
  }
};


// ─── UPDATE PARTNER LOCATION ──────────────────────────────────────────────────
export const updateDeliveryPartnerLocationController = async (req, res) => {
  try {
    const deliveryPartnerId     = req.userId;
    const { latitude, longitude } = req.body;

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return res.status(400).json({
        message: "Latitude and longitude must be numbers",
        error: true,
        success: false,
      });
    }

    const updated = await DeliveryPartnerModel.findByIdAndUpdate(
      deliveryPartnerId,
      { currentLocation: { latitude, longitude } },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      message: "Location updated successfully",
      success: true,
      error:   false,
      data:    updated,
    });
  } catch (error) {
    console.error("Location update error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error:   true,
    });
  }
};


// ─── GET ALL DELIVERY PARTNERS (Admin) ────────────────────────────────────────
export const getAllDeliveryPartnersController = async (req, res) => {
  try {
    const partners = await DeliveryPartnerModel.find().select("-password -aadharId");

    const now        = new Date();
    const todayStart = new Date().setHours(0, 0, 0, 0);

    const partnersWithStats = await Promise.all(
      partners.map(async (partner) => {
        const partnerObj = partner.toObject();

        const todayActivity = partner.activity.find(
          (a) => new Date(a.date).setHours(0, 0, 0, 0) === todayStart
        );

        let totalOnlineMinutes   = 0;
        let totalDeliveryMinutes = 0;

        if (todayActivity) {
          totalDeliveryMinutes = todayActivity.totalDeliveryMinutes || 0;
          for (const session of todayActivity.sessions) {
            const end = session.offlineAt ? new Date(session.offlineAt) : now;
            totalOnlineMinutes += Math.floor(
              (end - new Date(session.onlineAt)) / 60000
            );
          }
        }

        const hours   = Math.floor(totalOnlineMinutes / 60);
        const minutes = totalOnlineMinutes % 60;

        const activeOrders = await OrderModel.find({
          deliveryPartner: partner._id,
          isDelivered:     false,
          delivery_status: { $nin: ["Delivered", "Cancelled"] },
        })
          .populate("userId", "name phone")
          .populate("delivery_address")
          .populate("products.productId", "name image");

        const todayDelivered = await OrderModel.find({
          deliveryPartner: partner._id,
          isDelivered:     true,
          delivery_time:   { $gte: new Date(todayStart) },
        });

        const todayDeliveries = todayDelivered.length;
        const todayEarnings   = todayDelivered.reduce((sum, order) => {
          return sum + calculateDeliveryEarning(order.subTotalAmt || 0);
        }, 0);

        return {
          ...partnerObj,
          todayOnlineTime:      `${hours}h ${minutes}m`,
          totalOnlineMinutes,
          totalDeliveryMinutes,
          activeOrders,
          todayDeliveries,
          todayEarnings,
        };
      })
    );

    return res.status(200).json({
      message: "All delivery partners fetched successfully",
      success: true,
      error:   false,
      data:    partnersWithStats,
    });
  } catch (error) {
    console.error("Error fetching all delivery partners:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      success: false,
      error:   true,
    });
  }
};


// ─── GENERATE PICKUP BARCODE ──────────────────────────────────────────────────
export const generatePickupBarcodeController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order       = await OrderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found', error: true, success: false });
    }

    const allowedStatuses = ['Ready to Dispatch', 'Out for Delivery'];
    if (!allowedStatuses.includes(order.delivery_status)) {
      return res.status(400).json({
        message: `Barcode can only be generated when order status is: ${allowedStatuses.join(', ')}. Current: ${order.delivery_status}`,
        error: true,
        success: false,
      });
    }

    if (order.pickupBarcode && !order.pickupConfirmed) {
      return res.status(200).json({
        message: 'Barcode already exists for this order',
        error:   false,
        success: true,
        data: {
          orderId:                  order._id,
          pickupBarcode:            order.pickupBarcode,
          pickupBarcodeGeneratedAt: order.pickupBarcodeGeneratedAt,
          pickupConfirmed:          order.pickupConfirmed,
        },
      });
    }

    if (order.pickupConfirmed) {
      return res.status(400).json({
        message: 'Pickup already confirmed for this order. Barcode cannot be regenerated.',
        error:   true,
        success: false,
      });
    }

    const barcode = generatePickupBarcode(order._id.toString());

    order.pickupBarcode            = barcode;
    order.pickupBarcodeGeneratedAt = new Date();
    order.pickupConfirmed          = false;
    order.pickupConfirmedAt        = null;

    await order.save();

    return res.status(200).json({
      message: 'Pickup barcode generated successfully',
      error:   false,
      success: true,
      data: {
        orderId:                  order._id,
        pickupBarcode:            barcode,
        pickupBarcodeGeneratedAt: order.pickupBarcodeGeneratedAt,
        pickupConfirmed:          false,
      },
    });

  } catch (error) {
    console.error('Error generating pickup barcode:', error);
    return res.status(500).json({
      message: error.message || 'Internal server error',
      error:   true,
      success: false,
    });
  }
};


// ─── VERIFY PICKUP BARCODE ────────────────────────────────────────────────────
export const verifyPickupBarcodeController = async (req, res) => {
  try {
    const deliveryPartnerId = req.userId;
    const { scannedBarcode } = req.body;

    if (!scannedBarcode) {
      return res.status(400).json({
        message: 'scannedBarcode is required',
        error:   true,
        success: false,
      });
    }

    const order = await OrderModel.findOne({
      pickupBarcode:   scannedBarcode.trim().toUpperCase(),
      deliveryPartner: deliveryPartnerId,
    });

    if (!order) {
      return res.status(404).json({
        message: 'Invalid barcode or this order is not assigned to you',
        error:   true,
        success: false,
      });
    }

    if (order.pickupConfirmed) {
      return res.status(400).json({
        message: 'Pickup already confirmed for this order',
        error:   true,
        success: false,
        data: {
          orderId:          order._id,
          pickupConfirmedAt: order.pickupConfirmedAt,
        },
      });
    }

    const allowedStatuses = ['Out for Delivery', 'Return Accepted'];
    if (!allowedStatuses.includes(order.delivery_status)) {
      return res.status(400).json({
        message: `Cannot confirm pickup. Order is currently: ${order.delivery_status}`,
        error:   true,
        success: false,
      });
    }

    order.pickupConfirmed  = true;
    order.pickupConfirmedAt = new Date();

    await order.save();

    return res.status(200).json({
      message: 'Pickup confirmed! You can now proceed with delivery.',
      error:   false,
      success: true,
      data: {
        orderId:          order._id,
        pickupConfirmed:  true,
        pickupConfirmedAt: order.pickupConfirmedAt,
        delivery_status:  order.delivery_status,
      },
    });

  } catch (error) {
    console.error('Error verifying pickup barcode:', error);
    return res.status(500).json({
      message: error.message || 'Internal server error',
      error:   true,
      success: false,
    });
  }
};


export const confirmReturnPickupController = async (req, res) => {
  try {
    const deliveryPartnerId = req.userId;
    const { orderId, feedback, note } = req.body;

    if (!orderId) {
      return res.status(400).json({
        message: "orderId is required",
        error: true,
        success: false,
      });
    }

    const order = await OrderModel.findOne({
      _id: orderId,
      deliveryPartner: deliveryPartnerId,
      order_type: "Return",
    });

    if (!order) {
      return res.status(404).json({
        message: "Return order not found or not assigned to you",
        error: true,
        success: false,
      });
    }

    // ✅ Update status
    order.delivery_status = "Return Picked";

    // ✅ Save inspection details
    order.returnPickupDetails = {
      feedback,
      note,
      pickedAt: new Date(),
    };

    await order.save();

    return res.status(200).json({
      message: "Return pickup confirmed successfully",
      success: true,
      error: false,
      data: order,
    });

  } catch (error) {
    console.error("Return pickup confirm error:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
};