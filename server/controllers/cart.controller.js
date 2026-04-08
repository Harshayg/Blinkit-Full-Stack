import CartProductModel from "../models/cartproduct.model.js";
import UserModel from "../models/user.model.js";

// ✅ Add to cart
export const addToCartItemController = async (request, response) => {
  try {
    const userId = request.userId;
    const { productId } = request.body;

    if (!productId) {
      return response.status(400).json({
        message: "Provide productId",
        error: true,
        success: false,
      });
    }

    // Check if product already in cart
    const existingItem = await CartProductModel.findOne({ userId, productId });

    if (existingItem) {
      return response.status(400).json({
        message: "Item already in cart",
        error: true,
        success: false,
      });
    }

    // Create new cart item
    const cartItem = new CartProductModel({
      quantity: 1,
      userId,
      productId,
    });

    const savedItem = await cartItem.save();

    // Optional: sync with user model if needed
    await UserModel.updateOne(
      { _id: userId },
      { $addToSet: { shopping_cart: productId } } // Prevents duplicates
    );

    return response.json({
      data: savedItem,
      message: "Item added successfully",
      error: false,
      success: true,
    });

  } catch (error) {
    return response.status(500).json({
      message: error.message || "Server error",
      error: true,
      success: false,
    });
  }
};

// ✅ Get all cart items
export const getCartItemController = async (request, response) => {
  try {
    const userId = request.userId;

    const cartItems = await CartProductModel.find({
      userId,
      isDeleted: false, // Only fetch active items if soft-delete is used
    }).populate("productId");

    return response.json({
      data: cartItems,
      error: false,
      success: true,
    });

  } catch (error) {
    return response.status(500).json({
      message: error.message || "Server error",
      error: true,
      success: false,
    });
  }
};

// ✅ Update quantity
export const updateCartItemQtyController = async (request, response) => {
  try {
    const userId = request.userId;
    const { _id, qty } = request.body;

    if (!_id || typeof qty !== "number" || qty < 1) {
      return response.status(400).json({
        message: "Provide valid _id and qty (min 1)",
        error: true,
        success: false,
      });
    }

    const updated = await CartProductModel.updateOne(
      { _id, userId },
      { quantity: qty }
    );

    return response.json({
      message: "Cart item updated",
      success: true,
      error: false,
      data: updated,
    });

  } catch (error) {
    return response.status(500).json({
      message: error.message || "Server error",
      error: true,
      success: false,
    });
  }
};

// ✅ Delete cart item (hard delete)
export const deleteCartItemQtyController = async (request, response) => {
  try {
    const userId = request.userId;
    const { _id } = request.body;

    if (!_id) {
      return response.status(400).json({
        message: "Provide _id",
        error: true,
        success: false,
      });
    }

    const deleted = await CartProductModel.deleteOne({ _id, userId });

    return response.json({
      message: "Item removed from cart",
      error: false,
      success: true,
      data: deleted,
    });

  } catch (error) {
    return response.status(500).json({
      message: error.message || "Server error",
      error: true,
      success: false,
    });
  }
};

// ✅ Delete entire product from cart (regardless of quantity)
export const deleteEntireProductFromCartController = async (request, response) => {
  try {
    const userId = request.userId;
    const { productId } = request.body;

    if (!productId) {
      return response.status(400).json({
        message: "Provide productId",
        error: true,
        success: false,
      });
    }

    // Remove product from user's cart
    const deleted = await CartProductModel.deleteOne({ userId, productId });

    // Also remove reference from user model if stored
    await UserModel.updateOne(
      { _id: userId },
      { $pull: { shopping_cart: productId } }
    );

    if (deleted.deletedCount === 0) {
      return response.status(404).json({
        message: "Product not found in cart",
        error: true,
        success: false,
      });
    }

    return response.json({
      message: "Entire product removed from cart",
      error: false,
      success: true,
      data: deleted,
    });

  } catch (error) {
    return response.status(500).json({
      message: error.message || "Server error",
      error: true,
      success: false,
    });
  }
};
