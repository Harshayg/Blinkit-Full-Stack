import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Provide name"]
  },
  email: {
    type: String,
    required: [true, "Provide email"],
    unique: true
  },
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product',
    }
  ],
  // 🔔 Notify Me subscriptions
  notify_products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product',
    }
  ],
  password: {
    type: String,
    required: [true, "Provide password"]
  },
  avatar: {
    type: String,
    default: ""
  },

  // ✅ change Number -> String; keep leading zeros & country codes
  mobile: {
    type: String,
    unique: true,
    sparse: true,
    default: null
  },

  refresh_token: {
    type: String,
    default: ""
  },
  verify_email: {
    type: Boolean,
    default: false
  },
  last_login_date: {
    type: Date,
    default: null
  },
  last_login_agent: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ["Active", "Inactive", "Suspended"],
    default: "Active"
  },
  address_details: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'address'
    }
  ],
  shopping_cart: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'cartProduct'
    }
  ],
  orderHistory: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'order'
    }
  ],
  forgot_password_otp: {
    type: String,
    default: null
  },
  // ✅ use null (not empty string) for Date fields
  forgot_password_expiry: {
    type: Date,
    default: null
  },
  role: {
    type: String,
    enum: ['ADMIN', "USER"],
    default: "USER"
  },
  date_of_birth: {
    type: Date,
    default: null
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    default: "Other"
  },
  search_history: [
    {
      keyword: { type: String },
      searchedAt: { type: Date, default: Date.now }
    }
  ],

  // 🔄 NEW FIELDS
  wallet_balance: {
    type: Number,
    default: 0
  },
  language_preference: {
    type: String,
    default: "en"
  },
  login_history: [
    {
      ip: String,
      device: String,
      date: { type: Date, default: Date.now }
    }
  ],

  // ✅ OTP login fields (separate from forgot-password OTP)
  mobile_login_otp_hash: { type: String, default: null },
  mobile_login_otp_expiry: { type: Date, default: null },
  mobile_login_last_sent_at: { type: Date, default: null }

}, {
  timestamps: true
});

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
