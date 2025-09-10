import React, { useState } from "react";
import { Save, Loader2 } from "lucide-react";

export default function ProductForm({ mode = "create", initialData = null, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    style_number: initialData?.style_number || "",
    style_name: initialData?.style_name || "",
    season: initialData?.season || "",
    hsn_code: initialData?.hsn_code || "",
    cost: initialData?.cost || "",
    mrp: initialData?.mrp || "",
    size_set: initialData?.size_set || "",
    process_group: initialData?.process_group || "",
    item_bom: initialData?.item_bom || "",
    picture: null
  });

  const [picturePreview, setPicturePreview] = useState(initialData?.picture_url || null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === "edit") {
      console.log("Edited product data:", formData);
      if (onSaved) onSaved();
      if (onClose) onClose();
      return;
    }

    console.log("Creating new product:", formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Example: Product Name */}
      <input
        type="text"
        value={formData.style_name}
        onChange={(e) => setFormData({ ...formData, style_name: e.target.value })}
        className="w-full border px-2 py-1 rounded"
        placeholder="Product Name"
      />

      {/* Example: Price */}
      <input
        type="number"
        value={formData.mrp}
        onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
        className="w-full border px-2 py-1 rounded"
        placeholder="MRP"
      />

      {/* Picture */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files[0];
          setFormData({ ...formData, picture: file });
          setPicturePreview(URL.createObjectURL(file));
        }}
      />
      {picturePreview && <img src={picturePreview} alt="Preview" className="w-32 h-32 object-cover" />}

      {/* Buttons */}
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4 mr-2 inline" />
              {mode === "edit" ? "Update" : "Save"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
