import UserModel from '../models/user.model.js';
import ProductModel from '../models/product.model.js';

// ✅ Add product to favorites
export async function addToFavoritesController(request, response) {
  try {
    const userId = request.userId;
    const { productId } = request.params;

    const user = await UserModel.findById(userId);

    if (!user) {
      return response.status(404).json({
        message: "User not found",
        error: true,
        success: false
      });
    }

    if (user.favorites.includes(productId)) {
      return response.status(400).json({
        message: "Product already in favorites",
        error: true,
        success: false
      });
    }

    user.favorites.push(productId);
    await user.save();

    return response.json({
      message: "Product added to favorites",
      error: false,
      success: true
    });

  } catch (error) {
    return response.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false
    });
  }
}

// ✅ Remove product from favorites
export async function removeFromFavoritesController(request, response) {
  try {
    const userId = request.userId;
    const { productId } = request.params;

    const user = await UserModel.findById(userId);

    if (!user) {
      return response.status(404).json({
        message: "User not found",
        error: true,
        success: false
      });
    }

    user.favorites = user.favorites.filter(
      (id) => id.toString() !== productId
    );
    await user.save();

    return response.json({
      message: "Product removed from favorites",
      error: false,
      success: true
    });

  } catch (error) {
    return response.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false
    });
  }
}

// ✅ Get all favorite products
export async function getFavoritesController(request, response) {
  try {
    const userId = request.userId;

    const user = await UserModel.findById(userId).populate("favorites");

    if (!user) {
      return response.status(404).json({
        message: "User not found",
        error: true,
        success: false
      });
    }

    return response.json({
      message: "Fetched favorite products",
      data: user.favorites,
      error: false,
      success: true
    });

  } catch (error) {
    return response.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false
    });
  }
}
