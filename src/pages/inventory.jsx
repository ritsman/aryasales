import React, { useState, useEffect } from "react";
import { Package, Plus, Save, AlertCircle, CheckCircle } from "lucide-react";
import config from "../config";

const Inventory = () => {
  const BASE_URL = config.APIPOST_URL;
  const [products, setProducts] = useState([]);
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate fetching products from database
    const fetchProducts = async () => {
      try {
        // This would be your actual API call
        const response = await fetch(`${BASE_URL}/api/products`);
        const data = await response.json();
        console.log("Fetched products:", data);
        // Mock data for demonstration
        const mockProducts = [
          {
            id: 1,
            style_number: "ST001",
            style_name: "Classic T-Shirt",
            season: "Summer 2024",
            hsn_code: "61091000",
            cost: 250.0,
            mrp: 499.0,
            size_set: "XS,S,M,L,XL",
            process_group: "Garments",
            picture_url: "/uploads/products/st001.jpg",
          },
          {
            id: 2,
            style_number: "ST002",
            style_name: "Polo Shirt",
            season: "Summer 2024",
            hsn_code: "61051000",
            cost: 350.0,
            mrp: 699.0,
            size_set: "S,M,L,XL,XXL",
            process_group: "Garments",
            picture_url: "/uploads/products/st002.jpg",
          },
          {
            id: 3,
            style_number: "ST003",
            style_name: "Casual Jeans",
            season: "All Season",
            hsn_code: "62034200",
            cost: 800.0,
            mrp: 1299.0,
            size_set: "30,32,34,36,38,40",
            process_group: "Garments",
            picture_url: "/uploads/products/st003.jpg",
          },
        ];

        //setProducts(mockProducts);
        setProducts(data.products);

        // Initialize stock data structure
        const initialStockData = {};
        products.forEach((product) => {
          
          initialStockData[product.id] = {};
          product.stocks.forEach((size) => {
            initialStockData[product.id][size.size_label.trim()] = "";
          });
        });
        setStockData(initialStockData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setMessage({ type: "error", text: "Failed to load products" });
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleQuantityChange = (productId, size, quantity) => {
    setStockData((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [size]: quantity,
      },
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const stockEntries = [];

      // Prepare stock entries for submission
      Object.keys(stockData).forEach((productId) => {
        Object.keys(stockData[productId]).forEach((size) => {
          const quantity = parseInt(stockData[productId][size]);
          if (quantity > 0) {
            stockEntries.push({
              product_id: parseInt(productId),
              size_label: size,
              quantity: quantity,
              movement_type: "CREDIT",
              reference_no: "OPENING STOCK",
              movement_date: new Date().toISOString(),
            });
          }
        });
      });

      if (stockEntries.length === 0) {
        setMessage({
          type: "error",
          text: "Please enter at least one quantity",
        });
        setSubmitting(false);
        return;
      }

      // This would be your actual API call to save stock entries
      const response = await fetch(`${BASE_URL}/api/products/products_stock/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stockEntries),
      });

      // Mock success response
      console.log("Stock entries to be saved:", stockEntries);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMessage({
        type: "success",
        text: `Successfully added stock for ${stockEntries.length} product-size combinations`,
      });

      // Reset form
      const resetStockData = {};
      products.forEach((product) => {
        const sizes = product.size_set.split(",");
        resetStockData[product.id] = {};
        sizes.forEach((size) => {
          resetStockData[product.id][size.trim()] = "";
        });
      });
      setStockData(resetStockData);
    } catch (error) {
      console.error("Error saving stock:", error);
      setMessage({ type: "error", text: "Failed to save stock data" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading products...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Stock Management
                </h1>
                <p className="text-gray-600">
                  Add opening stock quantities for products
                </p>
              </div>
            </div>
          </div>

          {message.text && (
            <div
              className={`p-4 border-b border-gray-200 ${
                message.type === "success"
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center space-x-2">
                {message.type === "success" ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <span
                  className={
                    message.type === "success"
                      ? "text-green-800"
                      : "text-red-800"
                  }
                >
                  {message.text}
                </span>
              </div>
            </div>
          )}

          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Image
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Style Details
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Pricing
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Size & Quantity
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4 px-4">
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                          <img
                            src={`${BASE_URL}/${product.picture_url}`}
                            alt={product.style_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs hidden">
                            No Image
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-900">
                            {product.style_name}
                          </div>
                          <div className="text-sm text-gray-600">
                            Style: {product.style_number}
                          </div>
                          <div className="text-sm text-gray-600">
                            Season: {product.season}
                          </div>
                          <div className="text-sm text-gray-600">
                            HSN: {product.hsn_code}
                          </div>
                          <div className="text-sm text-gray-600">
                            Group: {product.process_group}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-600">
                            Cost: ₹{parseFloat(product.cost).toFixed(2)}
                          </div>
                          <div className="font-semibold text-gray-900">
                            MRP: ₹{parseFloat(product.mrp).toFixed(2)}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {product.stocks.map((size) => {
                            const trimmedSize = size.size_label.trim();
                            const qty = size.available_qty;
                            return (
                              <div key={trimmedSize} className="flex flex-col">
                                <label className="text-xs font-medium text-gray-700 mb-1">
                                  {trimmedSize}
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  value={
                                    stockData?.[product.id]?.[trimmedSize] ??
                                    size.available_qty ??
                                    0
                                  }
                                  onChange={(e) =>
                                    handleQuantityChange(
                                      product.id,
                                      trimmedSize,
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="0"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Stock</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
