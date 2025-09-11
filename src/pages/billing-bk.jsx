import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Save, ShoppingCart, Printer, Camera, X } from 'lucide-react';

const BillingComponent = () => {
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
  const [showScanner, setShowScanner] = useState(false);
  const [scannerSupported, setScannerSupported] = useState(false);
  
  const barcodeInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Check camera support on mount
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setScannerSupported(true);
    }
    
    // Focus on barcode input when component mounts
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  // Cleanup camera stream when scanner is closed
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Start camera for barcode scanning
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowScanner(true);
    } catch (err) {
      setError('Camera access denied or not available');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowScanner(false);
  };

  // Simulate barcode detection (you would integrate with a real barcode library like QuaggaJS or ZXing)
  const captureBarcode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // In a real implementation, you would use a barcode scanning library here
    // For demo purposes, we'll simulate scanning
    const simulatedBarcode = prompt('Enter barcode for demo (e.g., 10004XL):');
    if (simulatedBarcode) {
      setScannedBarcode(simulatedBarcode);
      stopCamera();
      handleBarcodeScan(simulatedBarcode);
    }
  };

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
    return new Promise((resolve) => {
      setTimeout(() => {
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
      }, 300);
    });
  };

  // Handle barcode scan
  const handleBarcodeScan = async (barcodeValue = null) => {
    const barcode = barcodeValue || scannedBarcode.trim();
    if (!barcode) return;

    setLoading(true);
    setError('');

    try {
      const { productId, sizeLabel } = decodeBarcode(barcode);
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
      
      // Vibrate on mobile devices for feedback
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
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

  // Generate receipt content for thermal printing
  const generateReceiptContent = () => {
    const { subtotal, gstAmount, total } = calculateTotals();
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN');
    const timeStr = now.toLocaleTimeString('en-IN');
    
    const lineWidth = 32;
    const centerText = (text) => {
      const padding = Math.max(0, Math.floor((lineWidth - text.length) / 2));
      return ' '.repeat(padding) + text;
    };
    
    const leftRightAlign = (left, right) => {
      const totalLen = left.length + right.length;
      const spaces = Math.max(1, lineWidth - totalLen);
      return left + ' '.repeat(spaces) + right;
    };

    let receipt = '';
    
    receipt += centerText('YOUR STORE NAME') + '\n';
    receipt += centerText('123 Store Address') + '\n';
    receipt += centerText('City, State - 123456') + '\n';
    receipt += centerText('GST: 12XXXXX1234X1XX') + '\n';
    receipt += '='.repeat(lineWidth) + '\n';
    receipt += leftRightAlign('Date: ' + dateStr, 'Time: ' + timeStr) + '\n';
    receipt += '='.repeat(lineWidth) + '\n';
    
    if (customerDetails.name) {
      receipt += 'Customer: ' + customerDetails.name + '\n';
      if (customerDetails.mobile) {
        receipt += 'Mobile: ' + customerDetails.mobile + '\n';
      }
      receipt += '-'.repeat(lineWidth) + '\n';
    }
    
    receipt += 'Item                Qty Rate  Amt\n';
    receipt += '-'.repeat(lineWidth) + '\n';
    
    billItems.forEach(item => {
      const itemName = (item.name + ' (' + item.size + ')').substring(0, 15);
      const qtyStr = item.quantity.toString();
      const rateStr = item.price.toString();
      const amtStr = item.total.toString();
      
      receipt += itemName + '\n';
      receipt += leftRightAlign('', qtyStr + ' x ' + rateStr + ' = ' + amtStr) + '\n';
    });
    
    receipt += '-'.repeat(lineWidth) + '\n';
    receipt += leftRightAlign('Subtotal:', '₹' + subtotal.toFixed(2)) + '\n';
    receipt += leftRightAlign('GST (18%):', '₹' + gstAmount.toFixed(2)) + '\n';
    receipt += '='.repeat(lineWidth) + '\n';
    receipt += leftRightAlign('TOTAL:', '₹' + total.toFixed(2)) + '\n';
    receipt += '='.repeat(lineWidth) + '\n';
    
    receipt += 'Amount in Words:\n';
    const words = numberToWords(Math.floor(total));
    receipt += words + '\n';
    
    receipt += '\n';
    receipt += centerText('Thank You for Shopping!') + '\n';
    receipt += centerText('Visit Again') + '\n';
    receipt += '\n\n\n';
    
    return receipt;
  };

  // Print receipt function
  const printReceipt = () => {
    const receiptContent = generateReceiptContent();
    const printWindow = window.open('', '_blank');
    
    const printHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.2;
            margin: 0;
            padding: 8px;
            width: 72mm;
            background: white;
          }
          .receipt {
            white-space: pre-line;
          }
          @media print {
            body {
              width: 72mm;
              font-size: 11px;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">${receiptContent}</div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 100);
          }
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(printHTML);
    printWindow.document.close();
  };

  // Save and print bill
  const saveBill = async (shouldPrint = false) => {
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
      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(billData)
      });

      if (response.ok) {
        alert('Bill saved successfully!');
        
        if (shouldPrint) {
          printReceipt();
        }
        
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
    <div className="min-h-screen bg-gray-100 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">POS Billing System</h1>
          </div>
        </div>

        <div className="p-3 sm:p-4 lg:p-6 space-y-4 lg:space-y-6">
          {/* Customer Details Section */}
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-700">Customer Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <input
                type="text"
                placeholder="Customer Name"
                value={customerDetails.name}
                onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
              <input
                type="text"
                placeholder="Mobile Number"
                value={customerDetails.mobile}
                onChange={(e) => setCustomerDetails({...customerDetails, mobile: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
              <input
                type="text"
                placeholder="Address"
                value={customerDetails.address}
                onChange={(e) => setCustomerDetails({...customerDetails, address: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
              <input
                type="text"
                placeholder="GST Number (Optional)"
                value={customerDetails.gstNo}
                onChange={(e) => setCustomerDetails({...customerDetails, gstNo: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Barcode Scanner Section */}
          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-700">Scan Product</h2>
            
            {/* Scanner Controls */}
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <input
                ref={barcodeInputRef}
                type="text"
                placeholder="Scan barcode or enter manually (e.g., 10004XL)"
                value={scannedBarcode}
                onChange={(e) => setScannedBarcode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleBarcodeScan()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                disabled={loading}
              />
              
              <div className="flex gap-2">
                {scannerSupported && (
                  <button
                    onClick={startCamera}
                    disabled={loading || showScanner}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 text-sm sm:text-base"
                  >
                    <Camera className="w-4 h-4" />
                    <span className="hidden sm:inline">Scan</span>
                  </button>
                )}
                
                <button
                  onClick={() => handleBarcodeScan()}
                  disabled={loading || !scannedBarcode.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add</span>
                </button>
              </div>
            </div>
            
            {error && <p className="text-red-600 text-sm whitespace-pre-line bg-red-50 p-2 rounded border">{error}</p>}
          </div>

          {/* Camera Scanner Modal */}
          {showScanner && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-4 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Scan Barcode</h3>
                  <button onClick={stopCamera} className="text-gray-500 hover:text-gray-700">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-24 border-2 border-red-500 bg-transparent"></div>
                  </div>
                </div>
                
                <button
                  onClick={captureBarcode}
                  className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Capture Barcode
                </button>
                
                <canvas ref={canvasRef} className="hidden" />
              </div>
            </div>
          )}

          {/* Bill Items Section */}
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-700">Bill Items</h2>
            {billItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm sm:text-base">No items added yet. Scan a barcode to get started.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 text-xs sm:text-sm lg:text-base">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">Product</th>
                      <th className="border border-gray-300 px-2 sm:px-4 py-2 text-center">Size</th>
                      <th className="border border-gray-300 px-2 sm:px-4 py-2 text-right">Price</th>
                      <th className="border border-gray-300 px-2 sm:px-4 py-2 text-center">Qty</th>
                      <th className="border border-gray-300 px-2 sm:px-4 py-2 text-right">Total</th>
                      <th className="border border-gray-300 px-2 sm:px-4 py-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-2 sm:px-4 py-2">{item.name}</td>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2 text-center">{item.size}</td>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2 text-right">₹{item.price}</td>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                            className="w-12 sm:w-16 px-1 sm:px-2 py-1 text-center border rounded text-xs sm:text-sm"
                          />
                        </td>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2 text-right">₹{item.total}</td>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2 text-center">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    
                    <tr className="bg-gray-50 font-semibold">
                      <td colSpan="4" className="border border-gray-300 px-2 sm:px-4 py-2 text-right">Subtotal:</td>
                      <td className="border border-gray-300 px-2 sm:px-4 py-2 text-right">₹{subtotal.toFixed(2)}</td>
                      <td className="border border-gray-300"></td>
                    </tr>
                    
                    <tr className="bg-gray-50">
                      <td colSpan="4" className="border border-gray-300 px-2 sm:px-4 py-2 text-right">GST (18%):</td>
                      <td className="border border-gray-300 px-2 sm:px-4 py-2 text-right">₹{gstAmount.toFixed(2)}</td>
                      <td className="border border-gray-300"></td>
                    </tr>
                    
                    <tr className="bg-blue-100 font-bold text-base sm:text-lg">
                      <td colSpan="4" className="border border-gray-300 px-2 sm:px-4 py-2 text-right">Total:</td>
                      <td className="border border-gray-300 px-2 sm:px-4 py-2 text-right">₹{total.toFixed(2)}</td>
                      <td className="border border-gray-300"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Total in Words */}
          {billItems.length > 0 && (
            <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">Amount in Words:</h3>
              <p className="text-base sm:text-lg font-medium text-green-800">{convertToWords(total)}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            <button
              onClick={() => printReceipt()}
              disabled={billItems.length === 0}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base font-semibold"
            >
              <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
              Print Receipt
            </button>
            <button
              onClick={() => saveBill(false)}
              disabled={loading || billItems.length === 0}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base font-semibold"
            >
              <Save className="w-4 h-4 sm:w-5 sm:h-5" />
              {loading ? 'Saving...' : 'Save Bill'}
            </button>
            <button
              onClick={() => saveBill(true)}
              disabled={loading || billItems.length === 0}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base font-semibold"
            >
              <Save className="w-4 h-4 sm:w-5 sm:h-5" />
              <Printer className="w-3 h-3 sm:w-4 sm:h-4" />
              {loading ? 'Processing...' : 'Save & Print'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingComponent;