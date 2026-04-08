import mongoose from "mongoose";

// Schema for individual product in an order
const productItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.ObjectId,
    ref: "product",
  },
  name: String,
  image: [String],
  quantity: {
    type: Number,
    default: 1,
  },
  price: {
    type: Number,
    default: 0,
  },

  // ✅ Return info per product
  isReturned: {
    type: Boolean,
    default: false,
  },
  returnReason: {
    type: String,
    default: "",
  },
  returnRequestedAt: {
    type: Date,
    default: null,
  },
  returnStatus: {
    type: String,
    enum: [
      "",                   // default
      "Return Requested",   // user requested return
      "Return Accepted",    // delivery partner accepted
      "Return Picked",      // picked from customer
      "Return Completed",   // returned to warehouse
      "Return Cancelled"    // user cancelled return
    ],
    default: "",
  },
  // ✅ New: track when a product return is cancelled
  returnCancelledAt: {
    type: Date,
    default: null,
  }

}, { _id: false });

// Schema for entire order
const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  orderId: {
    type: String,
    required: true,
    unique: true,
  },

  // ✅ Return flow support
  order_type: {
    type: String,
    enum: ['Original', 'Return'],
    default: 'Original'
  },
  linkedOrderId: {
    type: String,
    default: null // If it's a return, link to original orderId
  },

  products: [productItemSchema],

  paymentId: {
    type: String,
    default: "",
  },
  payment_status: {
    type: String,
    default: "",
  },
payment_method: {
  type: String,
  enum: [
    "CashOnDelivery",
    "UPI",           // ← existing
    "Card",          // ← if you have this
    "Stripe",        // ← ADD THIS LINE
    // Add others if you have them (e.g. "Razorpay", "Paytm", etc.)
  ],
  required: true,
},

  delivery_address: {
    type: mongoose.Schema.ObjectId,
    ref: 'address',
  },
  subTotalAmt: {
    type: Number,
    default: 0,
  },
  totalAmt: {
    type: Number,
    default: 0,
  },

  deliveryPartner: {
    type: mongoose.Schema.ObjectId,
    ref: 'DeliveryPartner',
    default: null,
  },

  delivery_status: {
    type: String,
    enum: [
      "Pending",             // Order placed
      "Accepted",            // ✅ Admin accepted
      "Ready to Dispatch",   // ✅ Admin packed
      "Out for Delivery",    // Delivery partner accepted
      "Delivered",           // Completed
      "Cancelled",
      "Return Requested",
      "Return Accepted",
      "Return Picked",
      "Return Completed",
      "Return Cancelled"
    ],
    default: "Pending",
  },

  delivery_time: {
    type: Date,
    default: null,
  },
  delivery_otp: {
    type: String,
    default: null,
  },
  isDelivered: {
    type: Boolean,
    default: false,
  },

  // ✅ Overall return flags for the order
  isReturnRequested: {
    type: Boolean,
    default: false,
  },
  returnRequestedAt: {
    type: Date,
    default: null,
  },
  // ✅ New: timestamp for full return order cancellation
  returnCancelledAt: {
    type: Date,
    default: null,
  },
  // ✅ NEW: Store and Employee tracking
  store: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Store',
  required: false, // change this
  },
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null,
  },
  acceptedByDetails: {
    employeeId: String,
    name: String,
    role: String
  },
   // ── Pickup Barcode ──────────────────────────────────────────
  pickupBarcode: {
    type: String,
    default: null,
    sparse: true,
  },
  pickupBarcodeGeneratedAt: {
    type: Date,
    default: null,
  },
  pickupConfirmed: {
    type: Boolean,
    default: false,
  },
  pickupConfirmedAt: {
    type: Date,
    default: null,
  },
  status_history: [
  {
    status: {
      type: String,
      required: true
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee"
    },
    updated_at: {
      type: Date,
      default: Date.now
    },
    note: String
  }
],

}, {
  timestamps: true
});

const OrderModel = mongoose.model('order', orderSchema);
export default OrderModel;
