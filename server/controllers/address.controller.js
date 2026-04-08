import AddressModel from "../models/address.model.js";
import UserModel from "../models/user.model.js";

// ✅ Add Address
export const addAddressController = async (request, response) => {
  try {
    const userId = request.userId;
    const {
      address_line,
      landmark,
      city,
      state,
      pincode,
      country,
      mobile,
      type,
      is_default
    } = request.body;

    // 🧹 If setting this as default, unset others
    if (is_default) {
      await AddressModel.updateMany({ userId }, { is_default: false });
    }

    const newAddress = new AddressModel({
      address_line,
      landmark,
      city,
      state,
      pincode,
      country,
      mobile,
      type,
      is_default,
      userId,
    });

    const savedAddress = await newAddress.save();

    // Push address ID into user's address_details (if applicable)
    await UserModel.findByIdAndUpdate(userId, {
      $push: {
        address_details: savedAddress._id,
      },
    });

    return response.json({
      message: "Address created successfully",
      error: false,
      success: true,
      data: savedAddress,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// ✅ Get All Addresses
export const getAddressController = async (request, response) => {
  try {
    const userId = request.userId;

    const addresses = await AddressModel.find({ userId }).sort({ createdAt: -1 });

    return response.json({
      message: "List of addresses",
      error: false,
      success: true,
      data: addresses,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// ✅ Update Address
export const updateAddressController = async (request, response) => {
  try {
    const userId = request.userId;
    const {
      _id,
      address_line,
      landmark,
      city,
      state,
      pincode,
      country,
      mobile,
      type,
      is_default
    } = request.body;

    // 🧹 If setting this as default, unset others
    if (is_default) {
      await AddressModel.updateMany({ userId }, { is_default: false });
    }

    const updated = await AddressModel.updateOne(
      { _id, userId },
      {
        address_line,
        landmark,
        city,
        state,
        pincode,
        country,
        mobile,
        type,
        is_default,
      }
    );

    return response.json({
      message: "Address updated successfully",
      error: false,
      success: true,
      data: updated,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// ✅ Hard Delete Address
export const deleteAddresscontroller = async (request, response) => {
  try {
    const userId = request.userId;
    const { _id } = request.body;

    // 🔥 Delete address permanently from Address collection
    const deletedAddress = await AddressModel.findOneAndDelete({ _id, userId });

    if (!deletedAddress) {
      return response.status(404).json({
        message: "Address not found or already deleted",
        error: true,
        success: false,
      });
    }

    // 🔥 Remove reference from user's address_details
    await UserModel.findByIdAndUpdate(userId, {
      $pull: { address_details: _id },
    });

    return response.json({
      message: "Address permanently deleted",
      error: false,
      success: true,
      data: deletedAddress,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

