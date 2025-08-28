import React, { useState, useEffect } from 'react';
import { Package, Tag, Shirt } from 'lucide-react';

const Gallery = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Replace with your actual API endpoint
      const response = await fetch('http://192.168.29.132:3025/api/products');
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      console.log('Fetched products:', data);
      setProducts(data.products || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const formatSizeSet = (sizeSet) => {
    if (typeof sizeSet === 'string') {
      try {
        const parsed = JSON.parse(sizeSet);
        return Array.isArray(parsed) ? parsed.join(', ') : sizeSet;
      } catch {
        return sizeSet;
      }
    }
    if (Array.isArray(sizeSet)) {
      return sizeSet.join(', ');
    }
    return sizeSet || 'N/A';
  };
    const BASE_URL = "http://192.168.29.132:3025";
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Products</h2>
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Products Found</h2>
          <p className="text-gray-600">Start by adding some products to your inventory.</p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id || product.style_number}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
                <div className="relative h-64 bg-gray-200 overflow-hidden">
                {product.picture_url ? (
                  <img
                    src={product.picture_url.startsWith('/') ? `${BASE_URL}${product.picture_url}` : `${BASE_URL}/${product.picture_url}`}
                    alt={product.style_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      console.log('Image failed to load:', e.target.src);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="w-full h-full flex items-center justify-center text-gray-400" style={{ display: product.picture_url ? 'none' : 'flex' }}>
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
              <div className="p-5">
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
                    <span className="text-sm font-medium text-gray-700">Available Sizes:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {formatSizeSet(product.size_set).split(', ').map((size, idx) => (
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
                    <div>HSN: <span className="font-mono">{product.hsn_code}</span></div>
                  )}
                  {product.process_group && (
                    <div>Process Group: <span className="font-medium">{product.process_group}</span></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

};

export default Gallery
