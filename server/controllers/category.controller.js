import CategoryModel from "../models/category.model.js";
import SubCategoryModel from "../models/subCategory.model.js";
import ProductModel from "../models/product.model.js";

export const AddCategoryController = async (request, response) => {
  try {
    const { name } = request.body;
    const file = request.file;

    if (!name || !file) {
      return response.status(400).json({
        message: "Name and image file are required",
        error: true,
        success: false,
      });
    }

    // Upload image to Cloudinary
    const uploadResult = await uploadImageClodinary(file);

    if (!uploadResult || !uploadResult.secure_url) {
      return response.status(500).json({
        message: "Image upload failed",
        error: true,
        success: false,
      });
    }

    const newCategory = new CategoryModel({
      name,
      image: uploadResult.secure_url,
    });

    const savedCategory = await newCategory.save();

    if (!savedCategory) {
      return response.status(500).json({
        message: "Category creation failed",
        error: true,
        success: false,
      });
    }

    return response.json({
      message: "Category created successfully",
      data: savedCategory,
      success: true,
      error: false,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const getCategoryController = async(request,response)=>{
    try {
        
        const data = await CategoryModel.find().sort({ createdAt : -1 })

        return response.json({
            data : data,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.messsage || error,
            error : true,
            success : false
        })
    }
}

export const updateCategoryController = async (request, response) => {
  try {
    const { _id, name } = request.body;
    const file = request.file;

    let imageUrl;

    if (file) {
      const uploadResult = await uploadImageClodinary(file);
      if (!uploadResult || !uploadResult.secure_url) {
        return response.status(500).json({
          message: "Image upload failed",
          error: true,
          success: false,
        });
      }
      imageUrl = uploadResult.secure_url;
    }

    const updateData = { name };
    if (imageUrl) {
      updateData.image = imageUrl;
    }

    const update = await CategoryModel.updateOne({ _id }, updateData);

    return response.json({
      message: "Updated Category",
      success: true,
      error: false,
      data: update,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};


export const deleteCategoryController = async(request,response)=>{
    try {
        const { _id } = request.body 

        const checkSubCategory = await SubCategoryModel.find({
            category : {
                "$in" : [ _id ]
            }
        }).countDocuments()

        const checkProduct = await ProductModel.find({
            category : {
                "$in" : [ _id ]
            }
        }).countDocuments()

        if(checkSubCategory >  0 || checkProduct > 0 ){
            return response.status(400).json({
                message : "Category is already use can't delete",
                error : true,
                success : false
            })
        }

        const deleteCategory = await CategoryModel.deleteOne({ _id : _id})

        return response.json({
            message : "Delete category successfully",
            data : deleteCategory,
            error : false,
            success : true
        })

    } catch (error) {
       return response.status(500).json({
            message : error.message || error,
            success : false,
            error : true
       }) 
    }
}