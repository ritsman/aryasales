import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Save, ShoppingCart,Printer } from 'lucide-react';

const Billing = () => {
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    address: '',
    mobile: '',
    gstNo: ''
  });

  const [billItems, setBillItems] = useState([]);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const barcodeInputRef = useRef(null);

  // Focus on barcode input when component mounts
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  // Decode barcode string
  const decodeBarcode = (barcode) => {
    if (!barcode || barcode.length < 5) {
      throw new Error('Invalid barcode format');
    }
    
    if (barcode.charAt(0) !== '1') {
      throw new Error('Barcode must start with 1');
    }

    const productId = parseInt(barcode.substring(1, 5));
    const sizeLabel = barcode.substring(5);
    
    return { productId, sizeLabel };
  };

  // Mock API call to fetch product data
  const fetchProductData = async (productId) => {
    // Replace this with your actual API endpoint
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock product data
        const mockProducts = {
          1: { name: 'T-Shirt Basic', price: 599, category: 'Apparel' },
          2: { name: 'Jeans Regular', price: 1299, category: 'Apparel' },
          3: { name: 'Sneakers Sport', price: 2999, category: 'Footwear' },
          4: { name: 'Hoodie Premium', price: 1899, category: 'Apparel' }
        };
        
        const product = mockProducts[productId] || {
          name: `Product ${productId}`,
          price: 999,
          category: 'General'
        };
        
        resolve(product);
      }, 500);
    });
  };

  // Handle barcode scan
  const handleBarcodeScan = async () => {
    if (!scannedBarcode.trim()) return;

    setLoading(true);
    setError('');

    try {
      const { productId, sizeLabel } = decodeBarcode(scannedBarcode.trim());
      const productData = await fetchProductData(productId);

      // Check if item already exists
      const existingItemIndex = billItems.findIndex(
        item => item.productId === productId && item.size === sizeLabel
      );

      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedItems = [...billItems];
        updatedItems[existingItemIndex].quantity += 1;
        updatedItems[existingItemIndex].total = 
          updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].price;
        setBillItems(updatedItems);
      } else {
        // Add new item
        const newItem = {
          id: Date.now(),
          productId,
          name: productData.name,
          size: sizeLabel,
          price: productData.price,
          quantity: 1,
          total: productData.price
        };
        setBillItems([...billItems, newItem]);
      }

      setScannedBarcode('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    const updatedItems = billItems.map(item => 
      item.id === itemId 
        ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
        : item
    );
    setBillItems(updatedItems);
  };

  // Remove item
  const removeItem = (itemId) => {
    setBillItems(billItems.filter(item => item.id !== itemId));
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = billItems.reduce((sum, item) => sum + item.total, 0);
    const gstAmount = subtotal * 0.18;
    const total = subtotal + gstAmount;
    
    return { subtotal, gstAmount, total };
  };

  // Convert number to words
  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num === 0) return 'Zero';
    
    const convertHundreds = (n) => {
      let result = '';
      
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      
      if (n >= 10 && n < 20) {
        result += teens[n - 10] + ' ';
      } else {
        if (n >= 20) {
          result += tens[Math.floor(n / 10)] + ' ';
        }
        if (n % 10 > 0) {
          result += ones[n % 10] + ' ';
        }
      }
      
      return result;
    };
    
    let result = '';
    const crores = Math.floor(num / 10000000);
    const lakhs = Math.floor((num % 10000000) / 100000);
    const thousands = Math.floor((num % 100000) / 1000);
    const remainder = num % 1000;
    
    if (crores > 0) {
      result += convertHundreds(crores) + 'Crore ';
    }
    if (lakhs > 0) {
      result += convertHundreds(lakhs) + 'Lakh ';
    }
    if (thousands > 0) {
      result += convertHundreds(thousands) + 'Thousand ';
    }
    if (remainder > 0) {
      result += convertHundreds(remainder);
    }
    
    return result.trim() + ' Rupees Only';
  };

  // Save bill to backend
  const saveBill = async () => {
    if (billItems.length === 0) {
      setError('Cannot save empty bill');
      return;
    }

    setLoading(true);
    const { subtotal, gstAmount, total } = calculateTotals();

    const billData = {
      customerDetails,
      items: billItems,
      subtotal,
      gstAmount,
      total,
      totalInWords: numberToWords(Math.floor(total)),
      date: new Date().toISOString()
    };

    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(billData)
      });

      if (response.ok) {
        alert('Bill saved successfully!');
        // Reset form
        setBillItems([]);
        setCustomerDetails({ name: '', address: '', mobile: '', gstNo: '' });
      } else {
        throw new Error('Failed to save bill');
      }
    } catch (err) {
      setError('Error saving bill: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, gstAmount, total } = calculateTotals();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div className="flex items-center gap-2 mb-6">
        <ShoppingCart className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-800">Billing System</h1>
      </div>

      {/* Customer Details Section */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Customer Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Customer Name"
            value={customerDetails.name}
            onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Mobile Number"
            value={customerDetails.mobile}
            onChange={(e) => setCustomerDetails({...customerDetails, mobile: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Address"
            value={customerDetails.address}
            onChange={(e) => setCustomerDetails({...customerDetails, address: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="GST Number (Optional)"
            value={customerDetails.gstNo}
            onChange={(e) => setCustomerDetails({...customerDetails, gstNo: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Barcode Scanner Section */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Scan Product</h2>
        <div className="flex gap-2">
          <input
            ref={barcodeInputRef}
            type="text"
            placeholder="Scan barcode or enter manually (e.g., 10004XL)"
            value={scannedBarcode}
            onChange={(e) => setScannedBarcode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleBarcodeScan()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={handleBarcodeScan}
            disabled={loading || !scannedBarcode.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>

      {/* Bill Items Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Bill Items</h2>
        {billItems.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No items added yet. Scan a barcode to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Product</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Size</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Price</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Qty</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {billItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{item.name}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{item.size}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">₹{item.price}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 text-center border rounded"
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">₹{item.total}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {/* Subtotal Row */}
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan="4" className="border border-gray-300 px-4 py-2 text-right">Subtotal:</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">₹{subtotal.toFixed(2)}</td>
                  <td className="border border-gray-300"></td>
                </tr>
                
                {/* GST Row */}
                <tr className="bg-gray-50">
                  <td colSpan="4" className="border border-gray-300 px-4 py-2 text-right">GST (18%):</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">₹{gstAmount.toFixed(2)}</td>
                  <td className="border border-gray-300"></td>
                </tr>
                
                {/* Total Row */}
                <tr className="bg-blue-100 font-bold text-lg">
                  <td colSpan="4" className="border border-gray-300 px-4 py-2 text-right">Total:</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">₹{total.toFixed(2)}</td>
                  <td className="border border-gray-300"></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Total in Words */}
      {billItems.length > 0 && (
        <div className="bg-green-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">Amount in Words:</h3>
          <p className="text-lg font-medium text-green-800">{numberToWords(Math.floor(total))}</p>
        </div>
      )}

      {/* Save and Print Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => printReceipt()}
          disabled={billItems.length === 0}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 text-lg font-semibold"
        >
          <Printer className="w-5 h-5" />
          Print Receipt
        </button>
        <button
          onClick={() => saveBill(false)}
          disabled={loading || billItems.length === 0}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 text-lg font-semibold"
        >
          <Save className="w-5 h-5" />
          {loading ? 'Saving...' : 'Save Bill'}
        </button>
        <button
          onClick={() => saveBill(true)}
          disabled={loading || billItems.length === 0}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 text-lg font-semibold"
        >
          <Save className="w-5 h-5" />
          <Printer className="w-4 h-4" />
          {loading ? 'Processing...' : 'Save & Print'}
        </button>
      </div>
    </div>
  );
};

export default Billing;