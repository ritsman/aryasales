import React, { useState, useEffect } from "react";
import { Package, Tag, Shirt, Edit, Trash2, AlertCircle } from "lucide-react";
import config from "../config";
import ProductForm from "../components/ProductForm";

const Gallery = () => {
  const BASE_URL = config.APIPOST_URL;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  //for product update
  const [showEditModal, setShowEditModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/products`);

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      setProducts(data.products || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    // You can implement this based on your routing setup
    // For example, navigate to edit page or open edit modal
    console.log("Edit product:", product);
    // Example: navigate('/products/edit/' + product.id);
    // Or open an edit modal
    //alert(`Edit functionality for ${product.style_name} - implement navigation or modal here`);
    setProductToEdit(product);
    setShowEditModal(true);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      setDeleteLoading(productToDelete.id);

      const response = await fetch(
        `${BASE_URL}/api/products/${productToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete product");
      }

      // Remove product from local state
      setProducts((prevProducts) =>
        prevProducts.filter((p) => p.id !== productToDelete.id)
      );

      setShowDeleteModal(false);
      setProductToDelete(null);

      // Optional: Show success message
      alert("Product deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert(`Failed to delete product: ${err.message}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  const formatSizeSet = (sizeSet) => {
    if (typeof sizeSet === "string") {
      try {
        const parsed = JSON.parse(sizeSet);
        return Array.isArray(parsed) ? parsed.join(", ") : sizeSet;
      } catch {
        return sizeSet;
      }
    }
    if (Array.isArray(sizeSet)) {
      return sizeSet.join(", ");
    }
    return sizeSet || "N/A";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error Loading Products
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchProducts}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Products Found
          </h2>
          <p className="text-gray-600">
            Start by adding some products to your inventory.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <span className="ml-4 bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {products.length} items
            </span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {products.map((product) => (
            <div
              key={product.id || product.style_number}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group max-w-sm mx-auto"
            >
              {/* Product Image */}
              <div className="relative h-48 sm:h-56 md:h-64 bg-gray-200 overflow-hidden rounded-t-xl">
                {product.picture_url ? (
                  <img
                    src={
                      product.picture_url.startsWith("/")
                        ? `${BASE_URL}${product.picture_url}`
                        : `${BASE_URL}/${product.picture_url}`
                    }
                    alt={product.style_name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    loading="lazy"
                    onError={(e) => {
                      console.log("Image failed to load:", e.target.src);
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className="w-full h-full flex items-center justify-center text-gray-400"
                  style={{ display: product.picture_url ? "none" : "flex" }}
                >
                  <Shirt className="w-16 h-16" />
                </div>

                {/* Season Badge */}
                {product.season && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      {product.season}
                    </span>
                  </div>
                )}

                {/* Style Number Badge */}
                <div className="absolute top-3 right-3">
                  <span className="bg-black bg-opacity-75 text-white text-xs font-mono px-2 py-1 rounded">
                    {product.style_number}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-3 sm:p-4 md:p-5">
                {/* Product Name */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {product.style_name}
                </h3>

                {/* Price Section */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Tag className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-2xl font-bold text-green-600">
                      {formatPrice(product.mrp)}
                    </span>
                  </div>
                  {product.cost && product.cost < product.mrp && (
                    <div className="text-right">
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.cost)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Size Information */}
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Available Sizes:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {formatSizeSet(product.size_set)
                      .split(", ")
                      .map((size, idx) => (
                        <span
                          key={idx}
                          className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded border"
                        >
                          {size.trim()}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="border-t pt-3 text-xs text-gray-500 space-y-1">
                  {product.hsn_code && (
                    <div>
                      HSN: <span className="font-mono">{product.hsn_code}</span>
                    </div>
                  )}
                  {product.process_group && (
                    <div>
                      Process Group:{" "}
                      <span className="font-medium">
                        {product.process_group}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Action Buttons (Alternative placement) */}
                <div className="flex justify-between items-center mt-4 pt-3 border-t">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(product)}
                    disabled={deleteLoading === product.id}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {deleteLoading === product.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Edit Product Modal */}
      {showEditModal && productToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit Product – {productToEdit.style_name}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <ProductForm
                mode="edit"
                initialData={productToEdit}
                onClose={() => setShowEditModal(false)}
                onSaved={fetchProducts} // refresh list after save
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirm Delete
                </h3>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete{" "}
                <strong>"{productToDelete.style_name}"</strong>? This action
                cannot be undone and will also delete the associated image file.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {deleteLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
