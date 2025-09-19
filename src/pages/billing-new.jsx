import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Save, ShoppingCart, Printer, Camera, X } from 'lucide-react';
import { toWords } from 'number-to-words';
import config from "../config";
import { logoBase64 } from '../assets/logobase64';

const Billing = () => {
  const BASE_URL = config.APIPOST_URL;
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    address: '',
    mobile: '',
    gstNo: ''
  });
   const [billnofinal, setBillnofinal] = useState('DRAFT');
  const [billItems, setBillItems] = useState([]);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
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
    console.log('Fetching product data for ID:', productId);
    const response = await fetch(`${BASE_URL}/api/products/${productId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      console.log('Product data received:', data);
      return data.product;
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
          name: productData.style_number,
          size: sizeLabel,
          price: parseFloat(productData.mrp),
          quantity: 1,
          total: parseFloat(productData.mrp)
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

  // Calculate totals with discount logic
  const calculateTotals = () => {
    const subtotal = billItems.reduce((sum, item) => sum + item.total, 0);
    
    // Calculate discount based on subtotal
    let discountPercentage = 0;
    let discountAmount = 0;
    
    if (subtotal >= 5000) {
      discountPercentage = 15;
    } else if (subtotal >= 2501) {
      discountPercentage = 10;
    } else if (subtotal >= 2000) {
      discountPercentage = 5;
    }
    
    discountAmount = (subtotal * discountPercentage) / 100;
    const discountedSubtotal = subtotal - discountAmount;
    const gstAmount = (discountedSubtotal / 105).toFixed(2); // 5% GST included in total
    const total = Math.round(discountedSubtotal);
    
    return { 
      subtotal, 
      discountPercentage, 
      discountAmount, 
      discountedSubtotal, 
      gstAmount, 
      total 
    };
  };

  // Convert number to words using library
  const convertToWords = (amount) => {
    try {
      const words = numberToWords(Math.floor(amount));
      return words.charAt(0).toUpperCase() + words.slice(1) + ' Rupees Only';
    } catch (error) {
      return 'Amount conversion error';
    }
  };

  // Generate receipt content for thermal printing
  const generateReceiptContent = () => {
    const { subtotal, discountPercentage, discountAmount, discountedSubtotal, gstAmount, total } = calculateTotals();
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
    
    receipt += centerText('N.D.Gems') + '\n';
    receipt += centerText('Tejasvini Fashion Mall') + '\n';
    receipt += centerText('Wing A, First Floor') + '\n';
    receipt += centerText('Mahalaxmi Jagdamba Devi Market') + '\n';
    receipt += centerText('Koradi,Nagpur-441111') + '\n';
    receipt += centerText('GST: 27ADXPG3286C1ZA') + '\n';
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
    receipt += `Invoice No ${billnofinal}\n`;
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
    
    // Add discount if applicable
    if (discountAmount > 0) {
      receipt += leftRightAlign(`Discount (${discountPercentage}%):`, '-₹' + discountAmount.toFixed(2)) + '\n';
      receipt += leftRightAlign('After Discount:', '₹' + discountedSubtotal.toFixed(2)) + '\n';
    }
    
    //receipt += leftRightAlign('GST (18%):', '₹' + gstAmount.toFixed(2)) + '\n';
    receipt += '='.repeat(lineWidth) + '\n';
    receipt += leftRightAlign('TOTAL:', '₹' + total.toFixed(2)) + '\n';
    receipt += leftRightAlign('Payment:', paymentMode.toUpperCase()) + '\n';
    receipt += leftRightAlign(`Inclusive of 5% GST:`, '₹' + gstAmount) + '\n';
    // Add savings message if discount applied
    if (discountAmount > 0) {
      receipt += leftRightAlign('You Saved:', '₹' + discountAmount.toFixed(2)) + '\n';
    }
    
    receipt += '='.repeat(lineWidth) + '\n';
    
    receipt += 'Amount in Words:\n';
    const words = toWords(total);
    receipt += words + '\n';
    
    receipt += '\n';
    receipt += centerText('Thank You for Shopping!') + '\n';
    receipt += centerText('Visit Again') + '\n';
    receipt += '\n\n\n';
    
    return receipt;
  };
  const printA4Receipt = () => {
    const { subtotal, discountPercentage, discountAmount, discountedSubtotal, gstAmount, total } = calculateTotals();
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
    const timeStr = now.toLocaleTimeString('en-IN');
    
    // Generate bill number (you can make this more sophisticated)
    const billNumber = 'INV' + Date.now().toString().slice(-6);
    
    // Replace with your actual logo base64
    // const logoBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAyADIDAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD5/oA//9k=";
    
    const printWindow = window.open('', '_blank');
    
    const printHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${billNumber}</title>
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            background: white;
          }
          
          .invoice-container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 10mm;
          }
          
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
          }
          
          .logo-section {
            flex: 1;
          }
          
          .logo-section img {
            max-width: 120px;
            max-height: 60px;
            margin-bottom: 10px;
          }
          
          .company-info {
            text-align: left;
          }
          
          .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 5px;
          }
          
          .company-details {
            font-size: 11px;
            color: #666;
            line-height: 1.3;
          }
          
          .invoice-info {
            text-align: right;
            flex: 1;
          }
          
          .invoice-title {
            font-size: 28px;
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 10px;
          }
          
          .invoice-details {
            font-size: 11px;
            color: #666;
          }
          
          .customer-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 25px;
            background: #f8fafc;
            padding: 15px;
            border-radius: 5px;
          }
          
          .customer-info, .payment-info {
            flex: 1;
          }
          
          .section-title {
            font-weight: bold;
            font-size: 13px;
            color: #374151;
            margin-bottom: 8px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 3px;
          }
          
          .info-line {
            margin-bottom: 4px;
            font-size: 11px;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          
          .items-table th {
            background: #374151;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
            font-size: 12px;
          }
          
          .items-table th:nth-child(1) { width: 40%; }
          .items-table th:nth-child(2) { width: 15%; text-align: center; }
          .items-table th:nth-child(3) { width: 15%; text-align: right; }
          .items-table th:nth-child(4) { width: 15%; text-align: center; }
          .items-table th:nth-child(5) { width: 15%; text-align: right; }
          
          .items-table td {
            padding: 10px 8px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 11px;
          }
          
          .items-table tbody tr:hover {
            background: #f9fafb;
          }
          
          .item-name {
            font-weight: 500;
            color: #374151;
          }
          
          .item-size {
            color: #6b7280;
            font-size: 10px;
          }
          
          .totals-section {
            margin-top: 20px;
            display: flex;
            justify-content: flex-end;
          }
          
          .totals-table {
            width: 300px;
            border-collapse: collapse;
            font-size: 12px;
          }
          
          .totals-table td {
            padding: 8px 12px;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .totals-table .label {
            text-align: right;
            font-weight: 500;
            color: #374151;
          }
          
          .totals-table .amount {
            text-align: right;
            width: 120px;
          }
          
          .discount-row {
            color: #16a34a;
            font-weight: 600;
          }
          
          .total-row {
            border-top: 2px solid #374151;
            border-bottom: 2px solid #374151;
            background: #f3f4f6;
            font-weight: bold;
            font-size: 14px;
          }
          
          .amount-words {
            margin-top: 15px;
            padding: 15px;
            background: #ecfdf5;
            border-left: 4px solid #16a34a;
            border-radius: 0 5px 5px 0;
          }
          
          .amount-words-title {
            font-weight: bold;
            color: #166534;
            margin-bottom: 5px;
          }
          
          .amount-words-text {
            color: #166534;
            font-style: italic;
          }
          
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 10px;
          }
          
          .thank-you {
            font-size: 16px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          
          @media print {
            .invoice-container {
              max-width: none;
              padding: 0;
            }
            
            body {
              font-size: 11px;
            }
            
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <!-- Header Section -->
          <div class="header">
            <div class="logo-section">
              <img src="${logoBase64}" alt="Company Logo" />
              <div class="company-info">
                <div class="company-name">YOUR STORE NAME</div>
                <div class="company-details">
                  123 Store Address<br>
                  City, State - 123456<br>
                  GST No: 12XXXXX1234X1XX<br>
                  Phone: +91 98765 43210<br>
                  Email: info@yourstore.com
                </div>
              </div>
            </div>
            
            <div class="invoice-info">
              <div class="invoice-title">INVOICE</div>
              <div class="invoice-details">
                <strong>Invoice No:</strong> ${billnofinal}<br>
                <strong>Date:</strong> ${dateStr}<br>
                <strong>Time:</strong> ${timeStr}
              </div>
            </div>
          </div>
          
          <!-- Customer & Payment Info -->
          <div class="customer-section">
            <div class="customer-info">
              <div class="section-title">Bill To:</div>
              <div class="info-line"><strong>Name:</strong> ${customerDetails.name || 'Walk-in Customer'}</div>
              ${customerDetails.mobile ? `<div class="info-line"><strong>Mobile:</strong> ${customerDetails.mobile}</div>` : ''}
              ${customerDetails.address ? `<div class="info-line"><strong>Address:</strong> ${customerDetails.address}</div>` : ''}
              ${customerDetails.gstNo ? `<div class="info-line"><strong>GST No:</strong> ${customerDetails.gstNo}</div>` : ''}
            </div>
            
            <div class="payment-info">
              <div class="section-title">Payment Details:</div>
              <div class="info-line"><strong>Payment Mode:</strong> ${paymentMode.toUpperCase()}</div>
              <div class="info-line"><strong>Status:</strong> Paid</div>
              ${discountAmount > 0 ? `<div class="info-line" style="color: #16a34a;"><strong>Discount Applied:</strong> ${discountPercentage}%</div>` : ''}
            </div>
          </div>
          
          <!-- Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: center;">Size</th>
                <th style="text-align: right;">Rate (₹)</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${billItems.map((item, index) => `
                <tr>
                  <td>
                    <div class="item-name">${item.name}</div>
                    <div class="item-size">Product ID: ${item.productId}</div>
                  </td>
                  <td style="text-align: center;">${item.size}</td>
                  <td style="text-align: right;">₹${item.price.toFixed(2)}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">₹${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <!-- Totals Section -->
          <div class="totals-section">
            <table class="totals-table">
              <tr>
                <td class="label">Subtotal:</td>
                <td class="amount">₹${subtotal.toFixed(2)}</td>
              </tr>
              ${discountAmount > 0 ? `
              <tr class="discount-row">
                <td class="label">Discount (${discountPercentage}%):</td>
                <td class="amount">-₹${discountAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td class="label">After Discount:</td>
                <td class="amount">₹${discountedSubtotal.toFixed(2)}</td>
              </tr>
              ` : ''}
              <tr>
                <td class="label">GST (18%):</td>
                <td class="amount">₹${gstAmount}</td>
              </tr>
              <tr class="total-row">
                <td class="label">Total Amount:</td>
                <td class="amount">₹${total.toFixed(2)}</td>
              </tr>
            </table>
          </div>
          
          <!-- Amount in Words -->
          <div class="amount-words">
            <div class="amount-words-title">Amount in Words:</div>
            <div class="amount-words-text">${convertToWords(total)}</div>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <div class="thank-you">Thank You for Your Business!</div>
            <div>
              This is a computer generated invoice and does not require signature.<br>
              For any queries, please contact us at info@yourstore.com or +91 98765 43210
            </div>
            ${discountAmount > 0 ? `<div style="color: #16a34a; font-weight: bold; margin-top: 10px;">You saved ₹${discountAmount.toFixed(2)} on this purchase!</div>` : ''}
          </div>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 1000);
          }
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(printHTML);
    printWindow.document.close();
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
            .logo {
            text-align: center;
            margin-bottom: 8px;
          }
          .logo img {
            max-width: 60mm;
            max-height: 20mm;
            height: auto;
            width: auto;
          }
          .receipt {
            white-space: pre-line;
          }
          @media print {
            body {
              width: 72mm;
              font-size: 11px;
            }
            .logo img {
              max-width: 55mm;
              max-height: 18mm;
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
      <div class="logo">
          <img src="${logoBase64}" alt="Store Logo" />
        </div>
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

  // Validate customer data
  const validateCustomerData = () => {
    const errors = [];
    
    if (!customerDetails.name.trim()) {
      errors.push('Customer name is required');
    }
    
    if (!customerDetails.mobile.trim()) {
      errors.push('Customer mobile number is required');
    } else if (!/^\d{10}$/.test(customerDetails.mobile.trim())) {
      errors.push('Mobile number must be 10 digits');
    }
    
    // Address is optional but if provided, should not be just spaces
    if (customerDetails.address.trim() === '' && customerDetails.address.length > 0) {
      errors.push('Address cannot be empty spaces');
    }
    
    // GST validation if provided
    if (customerDetails.gstNo.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(customerDetails.gstNo.trim())) {
      errors.push('Invalid GST number format');
    }
    
    return errors;
  };

  // Save and print bill
  const saveBill = async (shouldPrint = false) => {
    if (billItems.length === 0) {
      setError('Cannot save empty bill');
      return;
    }

    // Validate customer data
    const validationErrors = validateCustomerData();
    if (validationErrors.length > 0) {
      setError('Please fix the following errors:\n' + validationErrors.join('\n'));
      return;
    }

    setLoading(true);
    setError('');
    const { subtotal, discountPercentage, discountAmount, discountedSubtotal, gstAmount, total } = calculateTotals();

    const billData = {
      customerDetails,
      items: billItems,
      paymentMode,
      subtotal,
      discountPercentage,
      discountAmount,
      discountedSubtotal,
      gstAmount,
      total,
      totalInWords: toWords(total),
      date: new Date().toISOString()
    };
    console.log('Saving bill data:', billData);

    try {
      const response = await fetch(`${BASE_URL}/api/bills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(billData)
      });

      if (response.ok) {
        alert('Bill saved successfully!');
        console.log('Bill saved successfully:', response);
        const responseData = await response.json();
        console.log('Response data:', responseData);
        setBillnofinal(responseData.bill.main.bill_no);
        shouldPrint=true
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
function toSentenceCase(str) {
  // Return an empty string if the input is not a string or is empty
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  // Capitalize the first letter and concatenate it with the rest of the string in lowercase
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
 const { subtotal, discountPercentage, discountAmount, discountedSubtotal, gstAmount, total } = calculateTotals();

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
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-700">INV:{billnofinal}</h2>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-700">Customer Details *</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Customer Name *"
                  value={customerDetails.name}
                  onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Mobile Number *"
                  value={customerDetails.mobile}
                  onChange={(e) => setCustomerDetails({...customerDetails, mobile: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  pattern="[0-9]{10}"
                  maxLength="10"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Address (Optional)"
                  value={customerDetails.address}
                  onChange={(e) => setCustomerDetails({...customerDetails, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="GST Number (Optional)"
                  value={customerDetails.gstNo}
                  onChange={(e) => setCustomerDetails({...customerDetails, gstNo: e.target.value.toUpperCase()})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  maxLength="15"
                />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-2">* Required fields</p>
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
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-24 border-2 border-red-500 bg-transparent relative">
                      {/* Scanning line animation */}
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-500 opacity-75 animate-pulse"></div>
                      {/* Corner indicators */}
                      <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-red-500"></div>
                      <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-red-500"></div>
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-red-500"></div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-red-500"></div>
                    </div>
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
                    {discountAmount > 0 && (
                    <tr className="bg-gray-50">
                      <td colSpan="4" className="border border-gray-300 px-2 sm:px-4 py-2 text-right">Discount ({discountPercentage}%):</td>
                      <td className="border border-gray-300 px-2 sm:px-4 py-2 text-right">
                        -₹{discountAmount.toFixed(2)}
                        </td>
                      <td className="border border-gray-300"></td>
                    </tr>
                    )}
                    <tr className="bg-blue-100 font-bold text-base sm:text-lg">
                      <td colSpan="4" className="border border-gray-300 px-2 sm:px-4 py-2 text-right">Total (Inclusive of 5% GST ₹ {gstAmount}):</td>
                      <td className="border border-gray-300 px-2 sm:px-4 py-2 text-right">₹{total.toFixed(2)}</td>
                      <td className="border border-gray-300"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payment Mode Section */}
          <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Payment Details</h3>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <label className="text-sm font-medium text-gray-600 min-w-max">Payment Mode:</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base bg-white min-w-32"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="credit">Credit</option>
                </select>
              </div>
              {billItems.length > 0 && (
                <div className="text-right">
                  <div className="space-y-1">
                    {discountAmount > 0 && (
                      <div className="text-sm text-green-600 font-medium">
                        🎉 {discountPercentage}% Discount Applied!
                      </div>
                    )}
                    <div className="text-2xl sm:text-3xl font-bold text-green-700">
                      ₹{total.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Total Amount
                    </div>
                    {discountAmount > 0 && (
                      <div className="text-xs text-gray-500">
                        You saved ₹{discountAmount.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Total in Words */}
          {billItems.length > 0 && (
            <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">Amount in Words:</h3>
              <p className="text-base sm:text-lg font-medium text-green-800">{toSentenceCase(toWords(total))}</p>
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
              onClick={() => printA4Receipt()}
              disabled={billItems.length === 0}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base font-semibold"
            >
              <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
              Print A4
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

export default Billing;