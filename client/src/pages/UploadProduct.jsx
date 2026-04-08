/* FULLY UPDATED FILE - All backend fields + DRAG & DROP image reordering + BIGGER category/subcategory images */

import React, { useState } from "react";
import { FaCloudUploadAlt, FaGripVertical } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { useSelector } from "react-redux";

import Loading from "../components/Loading";
import ViewImage from "../components/ViewImage";
import AddFieldComponent from "../components/AddFieldComponent";

import uploadImage from "../utils/UploadImage";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import successAlert from "../utils/SuccessAlert";

const UploadProduct = () => {
  const [data, setData] = useState({
    name: "",
    image: [],
    category: [],
    subCategory: [],
    unit: "",
    stock: "",
    price: "",
    discount: "",
    description: "",
    more_details: {},
    ai_keywords: [],
    synonyms: [],
  });

  const [newKeyword, setNewKeyword] = useState("");
  const [newSynonym, setNewSynonym] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [ViewImageURL, setViewImageURL] = useState("");
  const [selectCategory, setSelectCategory] = useState("");
  const [selectSubCategory, setSelectSubCategory] = useState("");
  const [openAddField, setOpenAddField] = useState(false);
  const [fieldName, setFieldName] = useState("");

  const [errors, setErrors] = useState({});

  const allCategory = useSelector((state) => state.product.allCategory || []);
  const allSubCategory = useSelector(
    (state) => state.product.allSubCategory || []
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
    setData((prev) => ({ ...prev, [name]: value }));
  };

  /* ======================================================
     AI KEYWORDS HANDLERS
  ====================================================== */
  const addKeyword = () => {
    if (!newKeyword.trim()) {
      setErrors((prev) => ({ ...prev, ai_keywords: "Enter a keyword to add" }));
      return;
    }
    setData((prev) => ({
      ...prev,
      ai_keywords: [...prev.ai_keywords, newKeyword.trim()],
    }));
    setNewKeyword("");
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.ai_keywords;
      return copy;
    });
  };

  const removeKeyword = (index) => {
    setData((prev) => ({
      ...prev,
      ai_keywords: prev.ai_keywords.filter((_, i) => i !== index),
    }));
  };

  /* ======================================================
     SYNONYMS HANDLERS
  ====================================================== */
  const addSynonym = () => {
    if (!newSynonym.trim()) {
      setErrors((prev) => ({ ...prev, synonyms: "Enter a synonym to add" }));
      return;
    }
    setData((prev) => ({
      ...prev,
      synonyms: [...prev.synonyms, newSynonym.trim()],
    }));
    setNewSynonym("");
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.synonyms;
      return copy;
    });
  };

  const removeSynonym = (index) => {
    setData((prev) => ({
      ...prev,
      synonyms: prev.synonyms.filter((_, i) => i !== index),
    }));
  };

  /* ======================================================
     IMAGE REORDERING (DRAG & DROP)
  ====================================================== */
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData("text/plain"));
    if (dragIndex === dropIndex) return;

    const newImages = [...data.image];
    const [movedImage] = newImages.splice(dragIndex, 1);
    newImages.splice(dropIndex, 0, movedImage);

    setData((prev) => ({ ...prev, image: newImages }));
  };

  /* ======================================================
     IMAGE UPLOAD
  ====================================================== */
  const handleUploadImage = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setImageLoading(true);
    try {
      const uploadedImages = [];
      for (const file of files) {
        const response = await uploadImage(file);
        const imageUrl = response.data.data.url;
        uploadedImages.push(imageUrl);
      }

      setData((prev) => ({
        ...prev,
        image: [...prev.image, ...uploadedImages],
      }));

      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.image;
        return copy;
      });
    } catch (error) {
      AxiosToastError(error);
    }
    setImageLoading(false);
  };

  const handleDeleteImage = (index) => {
    setData((prev) => {
      const updated = prev.image.filter((_, i) => i !== index);
      return { ...prev, image: updated };
    });
  };

  /* ======================================================
     MORE DETAILS HANDLER
  ====================================================== */
  const handleMoreDetailsChange = (key, value) => {
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[`more_details.${key}`];
      return copy;
    });

    setData((prev) => ({
      ...prev,
      more_details: { ...prev.more_details, [key]: value },
    }));
  };

  /* ======================================================
     VALIDATION
  ====================================================== */
  const validate = () => {
    const newErrors = {};

    if (!data.name.trim()) newErrors.name = "Product name is required.";
    if (!data.unit.trim()) newErrors.unit = "Unit is required.";
    if (!data.description.trim())
      newErrors.description = "Description is required.";

    if (!data.image || data.image.length === 0)
      newErrors.image = "Upload at least one product image.";

    if (!data.category || data.category.length === 0)
      newErrors.category = "Select at least one category.";

    if (!data.subCategory || data.subCategory.length === 0)
      newErrors.subCategory = "Select at least one sub category.";

    if (data.stock === "" || data.stock === null)
      newErrors.stock = "Stock is required.";
    else if (Number.isNaN(Number(data.stock)) || Number(data.stock) < 0)
      newErrors.stock = "Stock must be a non-negative number.";

    if (data.price === "" || data.price === null)
      newErrors.price = "Price is required.";
    else if (Number.isNaN(Number(data.price)) || Number(data.price) <= 0)
      newErrors.price = "Price must be a positive number.";

    if (data.discount === "" || data.discount === null)
      newErrors.discount = "Discount is required.";
    else if (Number.isNaN(Number(data.discount)) || Number(data.discount) < 0)
      newErrors.discount = "Discount must be a non-negative number.";

    if (!data.ai_keywords || data.ai_keywords.length === 0)
      newErrors.ai_keywords = "Add at least one AI keyword.";

    if (!data.synonyms || data.synonyms.length === 0)
      newErrors.synonyms = "Add at least one synonym.";

    Object.entries(data.more_details).forEach(([k, v]) => {
      if (!String(v ?? "").trim()) {
        newErrors[`more_details.${k}`] = `${k} is required.`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const scrollToFirstError = () => {
    const keys = Object.keys(errors);
    if (!keys.length) return;
    const key = keys[0];

    if (key.startsWith("more_details.")) {
      const fieldName = key.split(".")[1];
      const input = document.querySelector(
        `input[data-more-detail="${fieldName}"]`
      );
      if (input) input.focus();
      return;
    }

    switch (key) {
      case "name":
      case "unit":
      case "description":
      case "stock":
      case "price":
      case "discount": {
        const el = document.querySelector(`[name="${key}"]`);
        if (el) el.focus();
        break;
      }
      case "image": {
        const el = document.querySelector('input[type="file"]');
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        break;
      }
      case "category": {
        const el = document.querySelector("select");
        if (el) el.focus();
        break;
      }
      case "subCategory": {
        const els = document.querySelectorAll("select");
        if (els && els[1]) els[1].focus();
        break;
      }
      case "ai_keywords": {
        const el = document.querySelector('input[placeholder*="keyword"]');
        if (el) el.focus();
        break;
      }
      case "synonyms": {
        const el = document.querySelector('input[placeholder*="synonym"]');
        if (el) el.focus();
        break;
      }
      default:
        break;
    }
  };

  /* ======================================================
     SUBMIT
  ====================================================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const ok = validate();
    if (!ok) {
      setTimeout(scrollToFirstError, 50);
      return;
    }

    try {
      const response = await Axios({ ...SummaryApi.createProduct, data });
      if (response.data.success) {
        successAlert(response.data.message);

        setData({
          name: "",
          image: [],
          category: [],
          subCategory: [],
          unit: "",
          stock: "",
          price: "",
          discount: "",
          description: "",
          more_details: {},
          ai_keywords: [],
          synonyms: [],
        });
        setErrors({});
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  return (
    <section className="min-h-screen bg-gray-100 text-gray-800 p-4 sm:p-8 font-inter">
      <div className="bg-white shadow-lg p-4 rounded-xl mb-6 flex items-center justify-between border border-gray-200">
        <h2 className="text-2xl font-bold text-green-600">Upload New Product</h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow-xl border border-gray-200"
        noValidate
      >
        {/* PRODUCT NAME */}
        <div className="col-span-1">
          <label className="block font-semibold mb-1 text-gray-700">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={data.name}
            onChange={handleChange}
            required
            placeholder="Enter product name"
            className={`w-full p-3 border rounded-lg ${
              errors.name ? "border-red-500" : ""
            }`}
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name}</p>
          )}
        </div>

        {/* UNIT */}
        <div className="col-span-1">
          <label className="block font-semibold mb-1 text-gray-700">
            Unit <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="unit"
            value={data.unit}
            onChange={handleChange}
            required
            placeholder="eg: kg, pcs, litre"
            className={`w-full p-3 border rounded-lg ${
              errors.unit ? "border-red-500" : ""
            }`}
          />
          {errors.unit && (
            <p className="text-sm text-red-600 mt-1">{errors.unit}</p>
          )}
        </div>

        {/* DESCRIPTION */}
        <div className="col-span-1 md:col-span-2">
          <label className="block font-semibold mb-1 text-gray-700">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={data.description}
            onChange={handleChange}
            required
            rows="4"
            placeholder="Enter full description"
            className={`w-full p-3 border rounded-lg resize-none ${
              errors.description ? "border-red-500" : ""
            }`}
          />
          {errors.description && (
            <p className="text-sm text-red-600 mt-1">{errors.description}</p>
          )}
        </div>

        {/* AI KEYWORDS */}
        <div className="col-span-1 md:col-span-2">
          <label className="block font-semibold mb-2 text-gray-700">
            AI Keywords (Helps AI Search) <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => {
                setNewKeyword(e.target.value);
                setErrors((prev) => {
                  const copy = { ...prev };
                  delete copy.ai_keywords;
                  return copy;
                });
              }}
              placeholder="Add keyword (ex: onion, pyaaz, fresh onion)"
              className={`flex-1 p-3 border rounded-lg ${
                errors.ai_keywords ? "border-red-500" : ""
              }`}
            />
            <button
              type="button"
              onClick={addKeyword}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {data.ai_keywords.map((k, i) => (
              <span
                key={i}
                className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center gap-1"
              >
                {k}
                <IoClose
                  className="cursor-pointer"
                  onClick={() => removeKeyword(i)}
                />
              </span>
            ))}
          </div>
          {errors.ai_keywords && (
            <p className="text-sm text-red-600 mt-1">{errors.ai_keywords}</p>
          )}
        </div>

        {/* SYNONYMS */}
        <div className="col-span-1 md:col-span-2">
          <label className="block font-semibold mb-2 text-gray-700">
            Synonyms (Very Important for Voice Search) <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSynonym}
              onChange={(e) => {
                setNewSynonym(e.target.value);
                setErrors((prev) => {
                  const copy = { ...prev };
                  delete copy.synonyms;
                  return copy;
                });
              }}
              placeholder="Add synonym (ex: pyaaz, onion, fresh onion)"
              className={`flex-1 p-3 border rounded-lg ${
                errors.synonyms ? "border-red-500" : ""
              }`}
            />
            <button
              type="button"
              onClick={addSynonym}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {data.synonyms.map((k, i) => (
              <span
                key={i}
                className="bg-violet-100 text-violet-800 px-3 py-1 rounded-full flex items-center gap-1"
              >
                {k}
                <IoClose
                  className="cursor-pointer"
                  onClick={() => removeSynonym(i)}
                />
              </span>
            ))}
          </div>
          {errors.synonyms && (
            <p className="text-sm text-red-600 mt-1">{errors.synonyms}</p>
          )}
        </div>

        {/* PRODUCT IMAGES - WITH DRAG & DROP REORDERING */}
        <div className="col-span-1 md:col-span-2">
          <label className="block font-semibold mb-2 text-gray-700">
            Product Images <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Drag images to reorder • First image becomes the main thumbnail
          </p>

          <label
            className={`border-2 border-dashed p-6 rounded-lg flex flex-col items-center justify-center cursor-pointer ${
              errors.image ? "border-red-500" : ""
            }`}
          >
            {imageLoading ? (
              <Loading />
            ) : (
              <div className="text-center text-gray-500">
                <FaCloudUploadAlt
                  size={40}
                  className="mx-auto text-green-500"
                />
                <p className="text-sm mt-2">Click to upload images</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleUploadImage}
            />
          </label>

          {errors.image && (
            <p className="text-sm text-red-600 mt-1">{errors.image}</p>
          )}

          {/* Reorderable image previews */}
          <div className="flex flex-wrap gap-4 mt-4">
            {data.image.map((img, index) => (
              <div
                key={img}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className="relative group cursor-grab active:cursor-grabbing w-28 h-28 border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                {/* Drag handle */}
                <div className="absolute top-2 left-2 bg-white/90 text-gray-500 rounded p-1 shadow z-20 opacity-70 group-hover:opacity-100 transition">
                  <FaGripVertical size={18} />
                </div>

                <img
                  src={img}
                  onClick={() => setViewImageURL(img)}
                  className="w-full h-full object-cover"
                  alt={`Product preview ${index + 1}`}
                />

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleDeleteImage(index)}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full shadow opacity-70 hover:opacity-100 transition"
                >
                  <MdDelete size={18} />
                </button>

                {/* Image number indicator */}
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-mono px-1.5 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CATEGORY - BIGGER IMAGE */}
        <div className="col-span-1">
          <label className="block font-semibold mb-1 text-gray-700">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={selectCategory}
            onChange={(e) => {
              const value = e.target.value;
              const cat = allCategory.find((c) => c._id === value);

              if (cat && !data.category.find((c) => c._id === value)) {
                setData((prev) => ({
                  ...prev,
                  category: [...prev.category, cat],
                }));
                setErrors((prev) => {
                  const copy = { ...prev };
                  delete copy.category;
                  return copy;
                });
              }
              setSelectCategory("");
            }}
            className={`w-full p-3 border rounded-lg ${
              errors.category ? "border-red-500" : ""
            }`}
          >
            <option value="">Select Category</option>
            {allCategory.map((c) => (
              <option value={c._id} key={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap mt-2 gap-3">
            {data.category.map((c, index) => (
              <span
                key={c._id}
                className="bg-green-100 text-green-800 px-4 py-2 rounded-2xl flex items-center gap-3 text-sm font-medium shadow-sm"
              >
                {/* BIGGER category image */}
                {c.image && (
                  <img
                    src={c.image}
                    alt={c.name}
                    className="w-10 h-10 object-cover rounded-xl flex-shrink-0 border border-green-200 shadow-inner"
                  />
                )}
                <span className="truncate max-w-[160px]">{c.name}</span>
                <IoClose
                  className="cursor-pointer flex-shrink-0 text-green-700 hover:text-red-500"
                  onClick={() =>
                    setData((prev) => {
                      const updated = prev.category.filter((_, i) => i !== index);
                      if (updated.length === 0) {
                        setErrors((prevErr) => ({
                          ...prevErr,
                          category: "Select at least one category.",
                        }));
                      }
                      return { ...prev, category: updated };
                    })
                  }
                />
              </span>
            ))}
          </div>

          {errors.category && (
            <p className="text-sm text-red-600 mt-1">{errors.category}</p>
          )}
        </div>

        {/* SUB CATEGORY - BIGGER IMAGE */}
        <div className="col-span-1">
          <label className="block font-semibold mb-1 text-gray-700">
            Sub Category <span className="text-red-500">*</span>
          </label>

          <select
            value={selectSubCategory}
            onChange={(e) => {
              const value = e.target.value;
              const sub = allSubCategory.find((s) => s._id === value);

              if (sub && !data.subCategory.find((s) => s._id === value)) {
                setData((prev) => ({
                  ...prev,
                  subCategory: [...prev.subCategory, sub],
                }));
                setErrors((prev) => {
                  const copy = { ...prev };
                  delete copy.subCategory;
                  return copy;
                });
              }
              setSelectSubCategory("");
            }}
            className={`w-full p-3 border rounded-lg ${
              errors.subCategory ? "border-red-500" : ""
            }`}
          >
            <option value="">Select Sub Category</option>
            {allSubCategory.map((s) => (
              <option value={s._id} key={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap mt-2 gap-3">
            {data.subCategory.map((s, index) => (
              <span
                key={s._id}
                className="bg-blue-100 text-blue-800 px-4 py-2 rounded-2xl flex items-center gap-3 text-sm font-medium shadow-sm"
              >
                {/* BIGGER subcategory image */}
                {s.image && (
                  <img
                    src={s.image}
                    alt={s.name}
                    className="w-10 h-10 object-cover rounded-xl flex-shrink-0 border border-blue-200 shadow-inner"
                  />
                )}
                <span className="truncate max-w-[160px]">{s.name}</span>
                <IoClose
                  className="cursor-pointer flex-shrink-0 text-blue-700 hover:text-red-500"
                  onClick={() =>
                    setData((prev) => {
                      const updated = prev.subCategory.filter((_, i) => i !== index);
                      if (updated.length === 0) {
                        setErrors((prevErr) => ({
                          ...prevErr,
                          subCategory: "Select at least one sub category.",
                        }));
                      }
                      return { ...prev, subCategory: updated };
                    })
                  }
                />
              </span>
            ))}
          </div>

          {errors.subCategory && (
            <p className="text-sm text-red-600 mt-1">{errors.subCategory}</p>
          )}
        </div>

        {/* STOCK - PRICE - DISCOUNT */}
        {["stock", "price", "discount"].map((field) => (
          <div key={field} className="col-span-1">
            <label className="block font-semibold mb-1 text-gray-700 capitalize">
              {field} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name={field}
              value={data[field]}
              onChange={handleChange}
              required
              placeholder={`Enter ${field}`}
              className={`w-full p-3 border rounded-lg ${
                errors[field] ? "border-red-500" : ""
              }`}
            />
            {errors[field] && (
              <p className="text-sm text-red-600 mt-1">{errors[field]}</p>
            )}
          </div>
        ))}

        {/* MORE DETAILS */}
        <div className="col-span-1 md:col-span-2">
          <label className="block font-semibold mb-2 text-gray-700">
            More Details <span className="text-red-500">*</span>
            <div className="text-xs text-gray-500 mt-1">
              (If you add custom fields, they are required)
            </div>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(data.more_details).map(([key, value]) => (
              <div key={key} className="relative">
                <label className="text-sm text-gray-600">{key}</label>
                <input
                  type="text"
                  data-more-detail={key}
                  value={value}
                  onChange={(e) =>
                    handleMoreDetailsChange(key, e.target.value)
                  }
                  className={`w-full p-3 border rounded-lg pr-10 ${
                    errors[`more_details.${key}`] ? "border-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newDetails = { ...data.more_details };
                    delete newDetails[key];
                    setData((prev) => ({
                      ...prev,
                      more_details: newDetails,
                    }));

                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy[`more_details.${key}`];
                      return copy;
                    });
                  }}
                  className="absolute right-0 top-7 p-2 text-red-500"
                >
                  <IoClose />
                </button>

                {errors[`more_details.${key}`] && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors[`more_details.${key}`]}
                  </p>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setOpenAddField(true)}
            className="w-full mt-4 py-3 bg-white border border-green-600 text-green-600 rounded-lg"
          >
            + Add Custom Field
          </button>
        </div>

        {/* SUBMIT */}
        <div className="col-span-1 md:col-span-2">
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-4 rounded-lg text-xl font-bold"
          >
            Upload Product
          </button>
        </div>
      </form>

      {ViewImageURL && (
        <ViewImage url={ViewImageURL} close={() => setViewImageURL("")} />
      )}

      {openAddField && (
        <AddFieldComponent
          value={fieldName}
          onChange={(e) => {
            setFieldName(e.target.value);
          }}
          submit={() => {
            if (!fieldName.trim()) {
              setErrors((prev) => ({
                ...prev,
                add_field: "Enter a field name before adding.",
              }));
              return;
            }
            setData((prev) => ({
              ...prev,
              more_details: { ...prev.more_details, [fieldName.trim()]: "" },
            }));
            setFieldName("");
            setOpenAddField(false);
            setErrors((prev) => {
              const copy = { ...prev };
              delete copy.add_field;
              return copy;
            });
          }}
          close={() => {
            setOpenAddField(false);
            setErrors((prev) => {
              const copy = { ...prev };
              delete copy.add_field;
              return copy;
            });
          }}
        />
      )}
    </section>
  );
};

export default UploadProduct;