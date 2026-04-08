import mongoose from "mongoose";

const cartProductSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.ObjectId,
    ref: 'product',
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: [1, "Quantity can't be less than 1"]
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Prevent same product added multiple times by same user
cartProductSchema.index({ userId: 1, productId: 1 }, { unique: true });

const CartProductModel = mongoose.model('cartProduct', cartProductSchema);

export default CartProductModel;
