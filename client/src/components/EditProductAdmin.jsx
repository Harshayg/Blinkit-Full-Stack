import React, { useState, useEffect } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { IoClose } from 'react-icons/io5';
import { useSelector } from 'react-redux';
import uploadImage from '../utils/UploadImage';
import Loading from '../components/Loading';
import ViewImage from '../components/ViewImage';
import AddFieldComponent from '../components/AddFieldComponent';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import successAlert from '../utils/SuccessAlert';

const EditProductAdmin = ({ close, data: propsData, fetchProductData }) => {
  const [data, setData] = useState({
    _id: propsData._id,
    name: propsData.name,
    image: propsData.image,
    category: propsData.category,
    subCategory: propsData.subCategory,
    unit: propsData.unit,
    stock: propsData.stock,
    price: propsData.price,
    discount: propsData.discount,
    description: propsData.description,
    more_details: propsData.more_details || {},
    ai_keywords: propsData.ai_keywords || [], // <-- AI keywords included in state
  });
  const [imageLoading, setImageLoading] = useState(false);
  const [ViewImageURL, setViewImageURL] = useState('');
  const allCategory = useSelector((state) => state.product.allCategory);
  const allSubCategory = useSelector((state) => state.product.allSubCategory);
  const [selectCategory, setSelectCategory] = useState('');
  const [selectSubCategory, setSelectSubCategory] = useState('');
  const [openAddField, setOpenAddField] = useState(false);
  const [fieldName, setFieldName] = useState('');

  // AI keywords input/edit state
  const [keywordInput, setKeywordInput] = useState('');
  const [editingIndex, setEditingIndex] = useState(-1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageLoading(true);
    try {
      const response = await uploadImage(file);
      const imageUrl = response.data.data.url;
      setData((prev) => ({ ...prev, image: [...prev.image, imageUrl] }));
    } catch (err) {
      console.error(err);
    } finally {
      setImageLoading(false);
    }
  };

  const handleDeleteImage = (index) => {
    const newImages = [...data.image];
    newImages.splice(index, 1);
    setData((prev) => ({ ...prev, image: newImages }));
  };

  const handleRemoveCategory = (index) => {
    const newCategory = [...data.category];
    newCategory.splice(index, 1);
    setData((prev) => ({ ...prev, category: newCategory }));
  };

  const handleRemoveSubCategory = (index) => {
    const newSubCategory = [...data.subCategory];
    newSubCategory.splice(index, 1);
    setData((prev) => ({ ...prev, subCategory: newSubCategory }));
  };

  const handleAddField = () => {
    if (!fieldName.trim()) return;
    setData((prev) => ({
      ...prev,
      more_details: { ...prev.more_details, [fieldName]: '' },
    }));
    setFieldName('');
    setOpenAddField(false);
  };

  // AI keywords handlers
  const handleAddKeyword = () => {
    const kw = keywordInput.trim();
    if (!kw) return;
    // prevent duplicates
    if (data.ai_keywords.includes(kw)) {
      setKeywordInput('');
      return;
    }

    if (editingIndex >= 0) {
      const newKeywords = [...data.ai_keywords];
      newKeywords[editingIndex] = kw;
      setData((prev) => ({ ...prev, ai_keywords: newKeywords }));
      setEditingIndex(-1);
      setKeywordInput('');
      return;
    }

    setData((prev) => ({ ...prev, ai_keywords: [...prev.ai_keywords, kw] }));
    setKeywordInput('');
  };

  const handleEditKeyword = (index) => {
    setEditingIndex(index);
    setKeywordInput(data.ai_keywords[index]);
  };

  const handleRemoveKeyword = (index) => {
    const newKeywords = [...data.ai_keywords];
    newKeywords.splice(index, 1);
    setData((prev) => ({ ...prev, ai_keywords: newKeywords }));
    // if we were editing that index, cancel editing
    if (editingIndex === index) {
      setEditingIndex(-1);
      setKeywordInput('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await Axios({ ...SummaryApi.updateProductDetails, data });
      if (response.data.success) {
        successAlert(response.data.message);
        fetchProductData();
        close();
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  return (
    <section className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center animate-fade-in">
      <div className="bg-white w-full max-w-3xl p-6 rounded-2xl shadow-xl overflow-y-auto max-h-[95vh] transition-all">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-neutral-800">Edit Product</h2>
          <button onClick={close} className="text-neutral-600 hover:text-red-600">
            <IoClose size={24} />
          </button>
        </div>

        <form className="grid gap-5" onSubmit={handleSubmit}>
          <InputField label="Name" name="name" value={data.name} onChange={handleChange} />

          <div>
            <label className="font-medium">Description</label>
            <textarea
              name="description"
              value={data.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 p-3 bg-gray-100 border rounded-xl w-full outline-none focus:border-green-500 resize-none"
            ></textarea>
          </div>

          <ImageUpload
            images={data.image}
            onUpload={handleUploadImage}
            onDelete={handleDeleteImage}
            loading={imageLoading}
            setViewImageURL={setViewImageURL}
          />

          <CategorySelector
            label="Category"
            items={allCategory}
            selected={data.category}
            value={selectCategory}
            setValue={setSelectCategory}
            onAdd={(cat) => setData((prev) => ({ ...prev, category: [...prev.category, cat] }))}
            onRemove={handleRemoveCategory}
          />

          <CategorySelector
            label="Sub Category"
            items={allSubCategory}
            selected={data.subCategory}
            value={selectSubCategory}
            setValue={setSelectSubCategory}
            onAdd={(sub) => setData((prev) => ({ ...prev, subCategory: [...prev.subCategory, sub] }))}
            onRemove={handleRemoveSubCategory}
          />

          <InputField label="Unit" name="unit" value={data.unit} onChange={handleChange} />
          <InputField label="Stock" name="stock" type="number" value={data.stock} onChange={handleChange} />
          <InputField label="Price" name="price" type="number" value={data.price} onChange={handleChange} />
          <InputField label="Discount" name="discount" type="number" value={data.discount} onChange={handleChange} />

          {Object.keys(data.more_details).map((key, index) => (
            <InputField
              key={key + index}
              label={key}
              name={key}
              value={data.more_details[key]}
              onChange={(e) => {
                const value = e.target.value;
                setData((prev) => ({
                  ...prev,
                  more_details: { ...prev.more_details, [key]: value },
                }));
              }}
            />
          ))}

          {/* AI Keywords UI */}
          <div>
            <label className="font-medium">AI Keywords</label>
            <p className="text-sm text-neutral-500">Display and edit keywords used for AI search/autocomplete.</p>

            <div className="flex flex-wrap gap-2 mt-2">
              {data.ai_keywords.map((kw, idx) => (
                <span key={kw + idx} className="flex items-center gap-2 px-3 py-1 bg-gray-200 rounded-full text-sm">
                  <button
                    type="button"
                    onClick={() => handleEditKeyword(idx)}
                    className="text-left"
                  >
                    {kw}
                  </button>
                  <IoClose size={14} className="cursor-pointer hover:text-red-600" onClick={() => handleRemoveKeyword(idx)} />
                </span>
              ))}
            </div>

            <div className="flex gap-2 items-center mt-3">
              <input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder={editingIndex >= 0 ? 'Edit keyword' : 'Add keyword and press Add'}
                className="p-2 bg-gray-100 border rounded-xl w-full outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddKeyword();
                  }
                }}
              />

              <button
                type="button"
                onClick={handleAddKeyword}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl"
              >
                {editingIndex >= 0 ? 'Save' : 'Add'}
              </button>

              {editingIndex >= 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingIndex(-1);
                    setKeywordInput('');
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-neutral-800 py-2 px-3 rounded-xl"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div
            onClick={() => setOpenAddField(true)}
            className="bg-white hover:bg-green-100 border border-green-600 text-green-700 py-2 px-4 w-max rounded-xl cursor-pointer"
          >
            + Add Field
          </div>

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-transform active:scale-95"
          >
            Update Product
          </button>
        </form>

        {ViewImageURL && <ViewImage url={ViewImageURL} close={() => setViewImageURL('')} />}

        {openAddField && (
          <AddFieldComponent
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
            submit={handleAddField}
            close={() => setOpenAddField(false)}
          />
        )}
      </div>
    </section>
  );
};

const InputField = ({ label, name, value, onChange, type = 'text' }) => (
  <div>
    <label htmlFor={name} className="font-medium">
      {label}
    </label>
    <input
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      type={type}
      required
      className="mt-1 p-3 bg-gray-100 border rounded-xl w-full outline-none focus:border-green-500"
    />
  </div>
);

const ImageUpload = ({ images, onUpload, onDelete, loading, setViewImageURL }) => (
  <div>
    <p className="font-medium mb-2">Images</p>
    <label className="bg-gray-100 border rounded-xl h-24 flex flex-col items-center justify-center cursor-pointer">
      {loading ? <Loading /> : <><FaCloudUploadAlt size={32} /><span>Upload Image</span></>}
      <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
    </label>
    <div className="flex flex-wrap gap-3 mt-3">
      {images.map((img, index) => (
        <div key={img + index} className="relative h-20 w-20 border bg-gray-100 rounded-xl overflow-hidden group">
          <img
            src={img}
            alt="Uploaded"
            className="w-full h-full object-contain cursor-pointer"
            onClick={() => setViewImageURL(img)}
          />
          <button
            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
            onClick={() => onDelete(index)}
          >
            <MdDelete size={16} />
          </button>
        </div>
      ))}
    </div>
  </div>
);

const CategorySelector = ({ label, items, selected, value, setValue, onAdd, onRemove }) => (
  <div>
    <label className="font-medium">{label}</label>
    <select
      className="w-full bg-gray-100 p-2 mt-1 border rounded-xl outline-none"
      value={value}
      onChange={(e) => {
        const id = e.target.value;
        const item = items.find((el) => el._id === id);
        if (item) onAdd(item);
        setValue('');
      }}
    >
      <option value="">Select {label}</option>
      {items.map((item) => (
        <option key={item._id} value={item._id}>
          {item.name}
        </option>
      ))}
    </select>
    <div className="flex flex-wrap gap-2 mt-2">
      {selected.map((item, index) => (
        <span
          key={item._id + index}
          className="flex items-center gap-1 px-2 py-1 bg-gray-200 rounded-full text-sm"
        >
          {item.name}
          <IoClose
            size={16}
            className="cursor-pointer hover:text-red-600"
            onClick={() => onRemove(index)}
          />
        </span>
      ))}
    </div>
  </div>
);

export default EditProductAdmin;
