import Stripe from "../config/stripe.js";
import CartProductModel from "../models/cartproduct.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import mongoose from "mongoose";
import ProductModel from "../models/product.model.js";
import { generateInvoiceBuffer } from "../utils/invoiceGenerator.js";
import uploadImageClodinary from "../utils/uploadImageClodinary.js";
import orderConfirmationTemplate from "../utils/orderConfirmationTemplate.js";
import sendEmail from '../config/sendEmail.js';
import orderStatusEmailTemplate from '../utils/orderStatusEmailTemplate.js';
import returnRequestTemplate from "../utils/returnRequestTemplate.js";
// 🔔 Notification helper
import { triggerOrderNotification } from "./Notification.controller.js";

// Helper to generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export async function CashOnDeliveryOrderController(request, response) {
  try {
    console.log("✅ Received order payload:", JSON.stringify(request.body, null, 2));

    const userId = request.userId;
    const { list_items, totalAmt, addressId, subTotalAmt, couponCode, couponDiscount } = request.body;

    if (!list_items || list_items.length === 0 || !totalAmt || !addressId) {
      return response.status(400).json({
        message: "Missing required order details.",
        error: true,
        success: false
      });
    }

    // ✅ STEP 1: Check stock availability
    for (const el of list_items) {
      const product = await ProductModel.findById(el.productId._id);
      if (!product) {
        return response.status(404).json({
          message: `Product ${el.productId.name} not found.`,
          error: true,
          success: false
        });
      }

      if (product.stock < el.quantity) {
        return response.status(400).json({
          message: `Not enough stock for ${product.name}. Available: ${product.stock}, Requested: ${el.quantity}`,
          error: true,
          success: false
        });
      }
    }

    // ✅ STEP 2: Build product items with correct price
    const productItems = [];
    for (const el of list_items) {
      const product = await ProductModel.findById(el.productId._id).lean();

      productItems.push({
        productId: product._id,
        name:      product.name,
        image:     product.image,
        quantity:  el.quantity || 1,
        price:     product.price - (product.discount || 0),
        unit:      product.unit || ""
      });
    }

    const orderId      = `ORD-${new mongoose.Types.ObjectId()}`;
    const delivery_otp = generateOTP();

    // ✅ STEP 3: Create the order
    const order = await OrderModel.create({
      userId,
      orderId,
      products:         productItems,
      payment_status:   "CASH ON DELIVERY",
      payment_method:   "CashOnDelivery",
      delivery_address: addressId,
      subTotalAmt,
      totalAmt,
      couponCode:     couponCode || "none",
      couponDiscount: couponDiscount || 0,
      delivery_otp,
      order_status:   "Placed",
    });

    // ✅ STEP 4: Decrease stock
    for (const el of list_items) {
      await ProductModel.updateOne(
        { _id: el.productId._id },
        { $inc: { stock: -el.quantity } }
      );
    }

    // ✅ STEP 5: Cleanup cart
    await CartProductModel.deleteMany({ userId });
    await UserModel.updateOne({ _id: userId }, { shopping_cart: [] });

    // ✅ STEP 6: Send confirmation email
    const user = await UserModel.findById(userId);
    if (user && user.email) {
      const deliveryAddress = user.addresses?.find(
        addr => addr._id.toString() === addressId.toString()
      );

      await sendEmail({
        sendTo: user.email,
        subject: `Order Confirmation - ${orderId}`,
        html: orderConfirmationTemplate({
          name:          user.name,
          orderId,
          items:         productItems,
          total:         totalAmt,
          paymentMethod: "Cash on Delivery",
          status:        "Placed",
          address: deliveryAddress
            ? `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.state} - ${deliveryAddress.zip}`
            : "N/A"
        })
      });
    }

    // ✅ STEP 7: Send in-app "order placed" notification
    await triggerOrderNotification(order, "placed");

    return response.json({
      message: "Order placed successfully (Cash on Delivery)",
      error:   false,
      success: true,
      data:    order
    });

  } catch (error) {
    console.error("CashOnDeliveryOrderController error:", error);
    return response.status(500).json({
      message: error.message || "An error occurred during COD order placement.",
      error:   true,
      success: false
    });
  }
}

export async function UPIPaymentOrderController(request, response) {
  try {
    const userId = request.userId;
    const {
      list_items,
      totalAmt,
      addressId,
      subTotalAmt,
      couponCode,
      couponDiscount,
      paymentId,
      paymentMethod
    } = request.body;

    if (
      !list_items ||
      list_items.length === 0 ||
      !totalAmt ||
      !addressId ||
      !paymentId ||
      !paymentMethod
    ) {
      return response.status(400).json({
        message: "Missing required order or payment details.",
        error:   true,
        success: false
      });
    }

    // ✅ STEP 1: Check stock availability
    for (const el of list_items) {
      const product = await ProductModel.findById(el.productId._id);

      if (!product) {
        return response.status(404).json({
          message: `Product ${el.productId.name} not found.`,
          error:   true,
          success: false
        });
      }

      if (product.stock < el.quantity) {
        return response.status(400).json({
          message: `Not enough stock for ${product.name}. Available: ${product.stock}, Requested: ${el.quantity}`,
          error:   true,
          success: false
        });
      }
    }

    // ✅ STEP 2: Prepare product items
    const productItems = list_items.map(el => ({
      productId: el.productId._id,
      name:      el.productId.name,
      image:     el.productId.image,
      quantity:  el.quantity || 1,
      price:     el.price || 0
    }));

    const orderId      = `ORD-${new mongoose.Types.ObjectId()}`;
    const delivery_otp = generateOTP();

    // ✅ STEP 3: Create order
    const order = await OrderModel.create({
      userId,
      orderId,
      products:         productItems,
      paymentId,
      payment_status:   `PAID VIA ${paymentMethod.toUpperCase()}`,
      payment_method:   paymentMethod,
      delivery_address: addressId,
      subTotalAmt,
      totalAmt,
      couponCode:     couponCode || "none",
      couponDiscount: couponDiscount || 0,
      delivery_otp,
      order_status:   "Placed"
    });

    // ✅ STEP 4: Reduce stock after successful payment
    for (const el of list_items) {
      await ProductModel.updateOne(
        { _id: el.productId._id },
        { $inc: { stock: -el.quantity } }
      );
    }

    // ✅ STEP 5: Clear cart
    await CartProductModel.deleteMany({ userId });
    await UserModel.updateOne(
      { _id: userId },
      { shopping_cart: [] }
    );

    // ✅ STEP 6: Send in-app "order placed" notification
    await triggerOrderNotification(order, "placed");

    return response.json({
      message: "Order placed successfully via UPI/QR payment.",
      error:   false,
      success: true,
      data:    order
    });

  } catch (error) {
    console.error("UPIPaymentOrderController error:", error);
    return response.status(500).json({
      message: error.message || "An error occurred during UPI/QR order placement.",
      error:   true,
      success: false
    });
  }
}

// Payment Intent (Stripe)
export async function paymentController(request, response) {
  try {
    const userId = request.userId;
    const { totalAmt, addressId, couponCode, couponDiscount } = request.body;

    const amountInSmallestUnit = Math.round(parseFloat(totalAmt) * 100);

    if (isNaN(amountInSmallestUnit) || amountInSmallestUnit <= 0) {
      return response.status(400).json({
        message: "Invalid total amount received.",
        error: true,
        success: false
      });
    }

    // ✅ Create Payment Intent (NEW LOGIC)
    const paymentIntent = await Stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency: "inr",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId,
        addressId,
        couponCode: couponCode || "none",
        couponDiscount: couponDiscount?.toString() || "0",
        originalTotal: totalAmt?.toString() || "0"
      }
    });

    return response.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });

  } catch (error) {
    console.error("Stripe payment error:", error);
    return response.status(500).json({
      message: error.message || "Payment intent creation failed.",
      error: true,
      success: false
    });
  }
}

export async function getOrderDetailsController(request, response) {
  try {
    const userId = request.userId;

    const orders = await OrderModel.find({ userId })
      .sort({ createdAt: -1 })
      .populate('delivery_address')
      .populate({
        path:   'deliveryPartner',
        select: 'name phone photo'
      });

    const finalOrders = orders.map(order => ({
      orderId:         order.orderId,
      createdAt:       order.createdAt,
      delivery_address: order.delivery_address,
      payment_status:  order.payment_status,
      payment_method:  order.payment_method,
      products:        order.products,
      totalAmt:        order.totalAmt,
      subTotalAmt:     order.subTotalAmt,
      couponCode:      order.couponCode || null,
      couponDiscount:  order.couponDiscount || 0,
      delivery_status: order.delivery_status,
      isDelivered:     order.isDelivered,
      delivery_otp:    !order.isDelivered ? order.delivery_otp : null,
      order_status:    order.order_status,
      totalItems:      order.products.length,

      deliveryPartner: order.deliveryPartner
        ? {
            name:  order.deliveryPartner.name,
            phone: order.deliveryPartner.phone,
            photo: order.deliveryPartner.photo,
          }
        : null
    }));

    return response.json({
      message: "Order list",
      data:    finalOrders,
      error:   false,
      success: true
    });

  } catch (error) {
    console.error("getOrderDetailsController error:", error);
    return response.status(500).json({
      message: error.message || "An error occurred while fetching order details.",
      error:   true,
      success: false
    });
  }
}

/* ──────────────────────────────────────────────────────────────
   FIXED: getLiveOrderStatusController
   Now correctly hides return orders when they reach "Return Completed"
   ────────────────────────────────────────────────────────────── */
export async function getLiveOrderStatusController(req, res) {
  try {
    const userId = req.userId;

    const liveOrder = await OrderModel.findOne({
      userId,
      // ✅ Only active orders (both normal + returns)
      delivery_status: { 
        $nin: ["Delivered", "Return Completed", "Cancelled", "Returned"] 
      }
    })
      .sort({ createdAt: -1 })
      .populate("delivery_address")
      .populate({
        path:   "deliveryPartner",
        select: "name phone photo"
      });

    if (!liveOrder) {
      return res.status(404).json({
        message: "No active order",
        success: false,
        error:   false
      });
    }

    return res.json({
      message: "Live order fetched",
      success: true,
      error:   false,
      data:    liveOrder
    });

  } catch (error) {
    console.error("Live order error:", error);
    return res.status(500).json({
      message: error.message,
      success: false,
      error:   true
    });
  }
}

export const cancelOrderController = async (req, res) => {
  try {
    const userId    = req.userId;
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        message: "orderId is required.",
        success: false,
        error:   true
      });
    }

    const order = await OrderModel.findOne({
      orderId,
      userId,
      deliveryPartner:  null,
      delivery_status:  "Pending"
    }).populate("delivery_address");

    if (!order) {
      return res.status(404).json({
        message: "Only unassigned pending orders can be cancelled.",
        success: false,
        error:   true
      });
    }

    // ⭐ STEP 1: RESTORE PRODUCT STOCK
    for (const item of order.products) {
      await ProductModel.updateOne(
        { _id: item.productId },
        { $inc: { stock: item.quantity } }
      );
    }

    // ⭐ STEP 2: UPDATE ORDER STATUS
    order.order_status    = "Cancelled";
    order.delivery_status = "Cancelled";
    await order.save();

    // ⭐ STEP 3: SEND EMAIL
    const user = await UserModel.findById(userId);
    if (user && user.email) {
      await sendEmail({
        sendTo:  user.email,
        subject: `Order Cancelled - ${orderId}`,
        html: orderStatusEmailTemplate({
          name:    user.name,
          orderId,
          items:   order.products,
          total:   order.totalAmt,
          status:  "Cancelled",
          address: order.delivery_address
            ? `${order.delivery_address.street}, ${order.delivery_address.city}, ${order.delivery_address.state} - ${order.delivery_address.zip}`
            : "N/A",
          message: "Your order has been successfully cancelled."
        })
      });
    }

    // ⭐ STEP 4: SEND IN-APP NOTIFICATION
    await triggerOrderNotification(order, "cancelled");

    return res.status(200).json({
      message: "Order cancelled successfully and stock restored.",
      success: true,
      error:   false
    });

  } catch (error) {
    console.error("Cancel order error:", error);
    return res.status(500).json({
      message: error.message,
      success: false,
      error:   true
    });
  }
};

export const returnProductOrOrderController = async (req, res) => {
  try {
    const { orderId, products = [], returnReason } = req.body;

    if (!orderId) return res.status(400).json({ success: false, message: "orderId is required" });

    const order = await OrderModel.findOne({ orderId });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const productsToReturn = [];

    if (!products || products.length === 0) {
      // Full return
      for (const p of order.products) {
        if (!p.isReturned) {
          const productDetails = await ProductModel.findById(p.productId).lean();
          const finalPrice     = productDetails?.price ? productDetails.price - (productDetails.discount || 0) : 0;

          p.isReturned          = true;
          p.returnReason        = returnReason || "No reason provided";
          p.returnRequestedAt   = new Date();
          p.returnStatus        = "Return Requested";

          productsToReturn.push({ ...p.toObject(), price: finalPrice });
        }
      }
    } else {
      // Partial return
      for (const returnItem of products) {
        const { productId, quantity } = returnItem;
        const productInOrder = order.products.find(p => p.productId.toString() === productId);

        if (productInOrder && !productInOrder.isReturned) {
          const productDetails = await ProductModel.findById(productId).lean();
          const finalPrice     = productDetails?.price ? productDetails.price - (productDetails.discount || 0) : 0;

          if (quantity < productInOrder.quantity) {
            productInOrder.quantity -= quantity;
            productsToReturn.push({
              productId:          productInOrder.productId,
              name:               productInOrder.name,
              image:              productInOrder.image,
              quantity,
              price:              finalPrice,
              unit:               productInOrder.unit,
              isReturned:         true,
              returnReason:       returnReason || "No reason provided",
              returnRequestedAt:  new Date(),
              returnStatus:       "Return Requested",
            });
          } else {
            productInOrder.isReturned         = true;
            productInOrder.returnReason       = returnReason || "No reason provided";
            productInOrder.returnRequestedAt  = new Date();
            productInOrder.returnStatus       = "Return Requested";

            productsToReturn.push({
              productId:         productInOrder.productId,
              name:              productInOrder.name,
              image:             productInOrder.image,
              quantity:          productInOrder.quantity,
              price:             finalPrice,
              unit:              productInOrder.unit,
              isReturned:        true,
              returnReason:      returnReason || "No reason provided",
              returnRequestedAt: new Date(),
              returnStatus:      "Return Requested",
            });
          }
        }
      }
    }

    if (productsToReturn.length === 0) {
      return res.status(400).json({ success: false, message: "No valid products found to return or already returned." });
    }

    const totalAmount   = productsToReturn.reduce((acc, p) => acc + p.price * p.quantity, 0);
    const returnOrderId = `RET-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create return order
    const returnOrder = new OrderModel({
  userId:            order.userId,
  orderId:           returnOrderId,
  order_type:        "Return",
  linkedOrderId:     order.orderId,
  products:          productsToReturn,
  delivery_address:  order.delivery_address,

  payment_method:    order.payment_method,
  payment_status:    "REFUND INITIATED",
  paymentId:         order.paymentId, // ⭐ important for Stripe refund

  delivery_status:   "Return Requested",
  isReturnRequested: true,
  returnRequestedAt: new Date(),
  refundAmount:      totalAmount,
});

    await returnOrder.save();
    await order.save();

    // Send email
    const user = await UserModel.findById(order.userId);
    if (user?.email) {
      await sendEmail({
        sendTo:  user.email,
        subject: `Return Request - ${returnOrderId}`,
        html: returnRequestTemplate({
          name:    user.name,
          orderId: returnOrderId,
          items:   productsToReturn,
          reason:  returnReason,
          status:  "Return Requested"
        })
      });
    }

    // 🔔 In-app notification
    await triggerOrderNotification(returnOrder, "return_requested");

    return res.status(200).json({ success: true, message: "Return request created successfully", returnOrder });

  } catch (error) {
    console.error("Error in returnProductOrOrderController:", error);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

export const cancelReturnController = async (req, res) => {
  try {
    const { orderId, productIds } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "orderId is required" });
    }

    const order = await OrderModel.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const user = await UserModel.findById(order.userId);

    // CASE 1: Cancel full return order
    if (order.order_type === "Return" && (!productIds || productIds.length === 0)) {

      if (order.linkedOrderId) {
        const originalOrder = await OrderModel.findOne({ orderId: order.linkedOrderId });
        if (originalOrder) {
          order.products.forEach(returnedProduct => {
            const originalProduct = originalOrder.products.find(
              p => p.productId.toString() === returnedProduct.productId.toString()
            );
            if (originalProduct && originalProduct.isReturned) {
              originalProduct.isReturned        = false;
              originalProduct.returnStatus      = "Return Cancelled";
              originalProduct.returnReason      = "";
              originalProduct.returnRequestedAt = null;
              originalProduct.returnCancelledAt = new Date();
            }
          });
          await originalOrder.save();
        }
      }

      await OrderModel.deleteOne({ _id: order._id });

      if (user?.email) {
        await sendEmail({
          sendTo:  user.email,
          subject: `Return Cancelled - ${orderId}`,
          html: returnRequestTemplate({
            name:    user.name,
            orderId,
            items:   order.products,
            status:  "Return Cancelled"
          })
        });
      }

      return res.status(200).json({ success: true, message: "Return order cancelled and removed" });
    }

    // CASE 2: Cancel specific returned products (partial cancellation)
    if (Array.isArray(productIds) && productIds.length > 0) {
      let anyUpdated = false;

      order.products.forEach(p => {
        const pid = p.productId.toString();
        if (productIds.includes(pid) && p.isReturned) {
          p.isReturned        = false;
          p.returnStatus      = "Return Cancelled";
          p.returnReason      = "";
          p.returnRequestedAt = null;
          p.returnCancelledAt = new Date();
          anyUpdated          = true;
        }
      });

      if (anyUpdated) {
        await order.save();

        if (order.linkedOrderId) {
          const returnOrder = await OrderModel.findOne({
            orderId:    order.linkedOrderId,
            order_type: "Return",
          });
          if (returnOrder) {
            returnOrder.products = returnOrder.products.filter(
              p => !productIds.includes(p.productId.toString())
            );
            if (returnOrder.products.length === 0) {
              await OrderModel.deleteOne({ _id: returnOrder._id });
            } else {
              await returnOrder.save();
            }
          }
        }

        if (user?.email) {
          const cancelledProducts = order.products.filter(p => productIds.includes(p.productId.toString()));
          await sendEmail({
            sendTo:  user.email,
            subject: `Return Cancelled - ${orderId}`,
            html: returnRequestTemplate({
              name:    user.name,
              orderId,
              items:   cancelledProducts,
              status:  "Return Cancelled"
            })
          });
        }

        return res.status(200).json({ success: true, message: "Return cancelled for selected product(s)" });
      } else {
        return res.status(400).json({ success: false, message: "No matching returned products found to cancel" });
      }
    }

    return res.status(400).json({
      success: false,
      message: "Invalid request: provide either a return orderId or productIds to cancel"
    });

  } catch (error) {
    console.error("Cancel Return Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};


