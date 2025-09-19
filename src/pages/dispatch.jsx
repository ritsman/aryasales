import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Eye, Edit, Trash2, ArrowLeft, Plus, Minus,Package,Printer} from 'lucide-react';
import config from "../config";
import { toWords } from 'number-to-words';
import { logoBase64 } from '../assets/logobase64';
// Mock data for demonstration
const mockBillData = Array.from({ length: 100 }, (_, i) => ({
  bill_id: i + 1,
  bill_no: `INV-${(i + 1).toString().padStart(4, '0')}`,
  customer_name: `Customer ${i + 1}`,
  customer_mobile: `9${Math.floor(Math.random() * 900000000 + 100000000)}`,
  customer_address: `Address ${i + 1}, City, State`,
  customer_gst_no: `GST${(i + 1).toString().padStart(6, '0')}`,
  bill_date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
  subtotal: Math.floor(Math.random() * 10000) + 1000,
  gst_amount: Math.floor(Math.random() * 1000) + 100,
  total: 0,
  total_in_words: ''
})).map(bill => ({
  ...bill,
  total: bill.subtotal + bill.gst_amount,
  total_in_words: `${bill.subtotal + bill.gst_amount} Rupees Only`
}));

const mockBillDetails = Array.from({ length: 300 }, (_, i) => ({
  detail_id: i + 1,
  bill_id: Math.floor(i / 3) + 1,
  product_id: Math.floor(Math.random() * 50) + 1,
  size: ['S', 'M', 'L', 'XL'][Math.floor(Math.random() * 4)],
  quantity: Math.floor(Math.random() * 10) + 1,
  price: Math.floor(Math.random() * 500) + 50,
  line_total: 0
})).map(detail => ({
  ...detail,
  line_total: detail.quantity * detail.price
}));

const Dispatch = () => {
  const BASE_URL = config.APIPOST_URL;
  const [bills, setBills] = useState(mockBillData);
  const [billDetails, setBillDetails] = useState(mockBillDetails);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const billsPerPage = 50;
  // Load products on component mount
  useEffect(() => {
    const fetchBillsMain = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/bills/bills-main`);
        const data = await response.json();
        console.log('Fetched main:', data);
        setBills(data.bills || [] );
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    const fetchBillsDetail = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/bills/bills-detail`);
        const data = await response.json();
        console.log('Fetched detail bills:', data);
        setBillDetails(data.details || [] );
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchBillsMain();
    fetchBillsDetail();
  }, []);

  // Filter bills based on search term
  const filteredBills = useMemo(() => {
    if (!searchTerm) return bills;
    
    return bills.filter(bill => {
      const searchLower = searchTerm.toLowerCase();
      const billDate = new Date(bill.bill_date).toLocaleDateString();
      
      return (
        bill.customer_mobile.includes(searchTerm) ||
        billDate.includes(searchTerm) ||
        bill.bill_no.toLowerCase().includes(searchLower) ||
        bill.customer_name.toLowerCase().includes(searchLower)
      );
    });
  }, [bills, searchTerm]);

  // Sort bills
  const sortedBills = useMemo(() => {
    if (!sortConfig.key) return filteredBills;

    return [...filteredBills].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'bill_date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredBills, sortConfig]);

  // Paginate bills
  const paginatedBills = useMemo(() => {
    const startIndex = (currentPage - 1) * billsPerPage;
    return sortedBills.slice(startIndex, startIndex + billsPerPage);
  }, [sortedBills, currentPage]);

  // Calculate totals
  const totals = useMemo(() => {
    return paginatedBills.reduce((acc, bill) => ({
      subtotal: parseFloat(acc.subtotal) + parseFloat(bill.subtotal),
      gst_amount: parseFloat(acc.gst_amount) + parseFloat(bill.gst_amount),
      total: parseFloat(acc.total) + parseFloat(bill.total)
    }), { subtotal: 0, gst_amount: 0, total: 0 });
  }, [paginatedBills]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleViewBill = (bill) => {
    setSelectedBill(bill);
    setIsEditing(false);
  };

  const handleEditBill = (bill) => {
    setSelectedBill(bill);
    setIsEditing(true);
  };

  const handleDeleteBill = (billId) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      setBills(prev => prev.filter(bill => bill.bill_id !== billId));
      setBillDetails(prev => prev.filter(detail => detail.bill_id !== billId));
    }
  };

  //printer :thermal printer
   const generateReceiptContent2 = (bill) => {
      const { main,items } = bill;
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
      receipt += leftRightAlign('Date: ' + main.bill_date, 'Time: ' + timeStr) + '\n';
      receipt += '='.repeat(lineWidth) + '\n';
      
      if (main.customer_name) {
        receipt += 'Customer: ' + main.customer_name + '\n';
        if (main.customer_mobile) {
          receipt += 'Mobile: ' + main.customer_mobile + '\n';
        }
        receipt += '-'.repeat(lineWidth) + '\n';
      }
      receipt += `Invoice No ${main.bill_no}\n`;
      receipt += 'Item                Qty Rate  Amt\n';
      receipt += '-'.repeat(lineWidth) + '\n';
      
      items.forEach(item => {
        const itemName = (item.style_number + ' (' + item.size + ')').substring(0, 15);
        const qtyStr = item.quantity.toString();
        const rateStr = item.price.toString();
        const amtStr = item.line_total.toString();
        
        receipt += itemName + '\n';
        receipt += leftRightAlign('', qtyStr + ' x ' + rateStr + ' = ' + amtStr) + '\n';
      });
      
      receipt += '-'.repeat(lineWidth) + '\n';
      receipt += leftRightAlign('Subtotal:', '₹' + main.subtotal) + '\n';
      
      // Add discount if applicable
      if (main.discount_amount > 0) {
        receipt += leftRightAlign(`Discount (${main.discount_percentage}%):`, '-₹' + main.discount_amount.toFixed(2)) + '\n';
        receipt += leftRightAlign('After Discount:', '₹' + main.discounted_subtotal.toFixed(2)) + '\n';
      }
      
      //receipt += leftRightAlign('GST (18%):', '₹' + gstAmount.toFixed(2)) + '\n';
      receipt += '='.repeat(lineWidth) + '\n';
      receipt += leftRightAlign('TOTAL:', '₹' + main.total) + '\n';
      receipt += leftRightAlign('Payment:', main.payment_mode.toUpperCase()) + '\n';
      receipt += leftRightAlign(`Inclusive of 5% GST:`, '₹' + main.gst_amount) + '\n';
      // Add savings message if discount applied
      if (main.discount_amount > 0) {
        receipt += leftRightAlign('You Saved:', '₹' + main.discount_amount) + '\n';
      }
      
      receipt += '='.repeat(lineWidth) + '\n';
      
      receipt += 'Amount in Words:\n';
      const words = toWords(main.total);
      receipt += words + '\n';
      
      receipt += '\n';
      receipt += centerText('Thank You for Shopping!') + '\n';
      receipt += centerText('Visit Again') + '\n';
      receipt += '\n\n\n';
      
      return receipt;
    };

    //printer :A4 printer
const handlePrintA4 = async (billNo) => {
    try {
    const res = await fetch(`${BASE_URL}/api/bills/${billNo}`);
    const data = await res.json();
        console.log('Print data:', data);
        if (!data.success) {
            alert("Bill not found!");
            return;
        }
        const{main,items}=data.bill;
        const printWindow = window.open('', '_blank');
            
            const printHTML = `
              <!DOCTYPE html>
              <html>
              <head>
                <title>Invoice - ${main.bill_no}</title>
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
                        <div class="company-name">N.D.Gems</div>
                        <div class="company-details">
                          Tejasvini Fashion Mall<br>
                          Wing A,First Floor<br>
                          Mahalaxmi Jagdamba Devi Market<br>
                          Koradi, Nagpur - 441111<br>
                          GSTIN: 27ADXPG3286C1ZA<br>
                          
                          Phone: +91 98765 43210<br>
                          Email: info@ndgems.com
                        </div>
                      </div>
                    </div>
                    
                    <div class="invoice-info">
                      <div class="invoice-title">INVOICE</div>
                      <div class="invoice-details">
                        <strong>Invoice No:</strong> ${main.bill_no}<br>
                        <strong>Date:</strong> ${main.bill_date}<br>
                        
                      </div>
                    </div>
                  </div>
                  
                  <!-- Customer & Payment Info -->
                  <div class="customer-section">
                    <div class="customer-info">
                      <div class="section-title">Bill To:</div>
                      <div class="info-line"><strong>Name:</strong> ${main.customer_name || 'Walk-in Customer'}</div>
                      ${main.customer_mobile ? `<div class="info-line"><strong>Mobile:</strong> ${main.customer_mobile}</div>` : ''}
                      ${main.customer_address ? `<div class="info-line"><strong>Address:</strong> ${main.customer_address}</div>` : ''}
                      ${main.customer_gst_no ? `<div class="info-line"><strong>GST No:</strong> ${main.customer_gst_o}</div>` : ''}
                    </div>
                    
                    <div class="payment-info">
                      <div class="section-title">Payment Details:</div>
                      <div class="info-line"><strong>Payment Mode:</strong> ${main.payment_mode.toUpperCase()}</div>
                      <div class="info-line"><strong>Status:</strong> Paid</div>
                      ${main.discount_amount > 0 ? `<div class="info-line" style="color: #16a34a;"><strong>Discount Applied:</strong> ${main.discount_percentage}%</div>` : ''}
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
                      ${items.map((item, index) => `
                        <tr>
                          <td>
                            <div class="item-name">${item.style_number}</div>
                            <div class="item-size">Product ID: ${item.name}</div>
                          </td>
                          <td style="text-align: center;">${item.size}</td>
                          <td style="text-align: right;">₹${item.price}</td>
                          <td style="text-align: center;">${item.quantity}</td>
                          <td style="text-align: right;">₹${item.line_total}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                  
                  <!-- Totals Section -->
                  <div class="totals-section">
                    <table class="totals-table">
                      <tr>
                        <td class="label">Subtotal:</td>
                        <td class="amount">₹${main.subtotal}</td>
                      </tr>
                      ${main.discount_amount > 0 ? `
                      <tr class="discount-row">
                        <td class="label">Discount (${main.discount_percentage}%):</td>
                        <td class="amount">-₹${main.discount_amount}</td>
                      </tr>
                      <tr>
                        <td class="label">After Discount:</td>
                        <td class="amount">₹${main.discounted_subtotal}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td class="label">GST (18%):</td>
                        <td class="amount">₹${main.gst_amount}</td>
                      </tr>
                      <tr class="total-row">
                        <td class="label">Total Amount:</td>
                        <td class="amount">₹${main.total}</td>
                      </tr>
                    </table>
                  </div>
                  
                  <!-- Amount in Words -->
                  <div class="amount-words">
                    <div class="amount-words-title">Amount in Words:</div>
                    <div class="amount-words-text">${toWords(main.total)}</div>
                  </div>
                  
                  <!-- Footer -->
                  <div class="footer">
                    <div class="thank-you">Thank You for Your Business!</div>
                    <div>
                      This is a computer generated invoice and does not require signature.<br>
                      For any queries, please contact us at info@yourstore.com or +91 98765 43210
                    </div>
                    ${main.discount_mount > 0 ? `<div style="color: #16a34a; font-weight: bold; margin-top: 10px;">You saved ₹${main.discount_amount} on this purchase!</div>` : ''}
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
            printWindow.print();

    }catch (err) {
        console.error("Print error:", err);
        alert("Error printing bill");
  }
}    

const handlePrint = async (billNo) => {
  try {
    const res = await fetch(`${BASE_URL}/api/bills/${billNo}`);
    const data = await res.json();
        console.log('Print data:', data);
    if (!data.success) {
      alert("Bill not found!");
      return;
    }

    const receiptContent = generateReceiptContent2(data.bill);
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
    //printWindow.document.close();
    printWindow.document.close();
    printWindow.print();
  } catch (err) {
    console.error("Print error:", err);
    alert("Error printing bill");
  }
};

  const handleSaveBill = (updatedBill) => {
    setBills(prev => prev.map(bill => 
      bill.bill_id === updatedBill.bill_id ? updatedBill : bill
    ));
    setIsEditing(false);
  };

  const toggleRowExpansion = (billId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(billId)) {
        newSet.delete(billId);
      } else {
        newSet.add(billId);
      }
      return newSet;
    });
  };

  const getBillDetails = (billId) => {
    return billDetails.filter(detail => detail.bill_id === billId);
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronDown className="w-4 h-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-blue-600" />
      : <ChevronDown className="w-4 h-4 text-blue-600" />;
  };

  if (selectedBill) {
    return (
      <BillDetailView 
        bill={selectedBill}
        billDetails={getBillDetails(selectedBill.bill_id)}
        isEditing={isEditing}
        onSave={handleSaveBill}
        onBack={() => setSelectedBill(null)}
        onEdit={() => setIsEditing(true)}
        onDelete={() => handleDeleteBill(selectedBill.bill_id)}
      />
    );
  }

  const totalPages = Math.ceil(sortedBills.length / billsPerPage);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Package className="mr-3" size={24} />
            Billing Management
          </h1>
        </div>
        
        {/* Search Bar */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by mobile number, date (MM/DD/YYYY), bill number, or customer name..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* Bills Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expand
                  </th>
                  {[
                    { key: 'bill_no', label: 'Bill No' },
                    { key: 'customer_name', label: 'Customer Name' },
                    { key: 'customer_mobile', label: 'Mobile' },
                    { key: 'bill_date', label: 'Bill Date' },
                    { key: 'subtotal', label: 'Subtotal' },
                    { key: 'gst_amount', label: 'GST Amount' },
                    { key: 'total', label: 'Total' }
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort(key)}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{label}</span>
                        <SortIcon columnKey={key} />
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedBills.map((bill) => (
                  <React.Fragment key={bill.bill_id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleRowExpansion(bill.bill_id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {expandedRows.has(bill.bill_id) ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {bill.bill_no}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {bill.customer_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {bill.customer_mobile}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(bill.bill_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{bill.subtotal.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{bill.gst_amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{bill.total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewBill(bill)}
                            className="text-blue-600 hover:text-blue-800"
                            title="View Bill"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditBill(bill)}
                            className="text-green-600 hover:text-green-800"
                            title="Edit Bill"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBill(bill.bill_id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete Bill"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePrint(bill.bill_no)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Print Bill"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePrintA4(bill.bill_no)}
                            className="text-cyan-600 hover:text-cyan-900"
                            title="Print BillA4"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRows.has(bill.bill_id) && (
                      <tr>
                        <td colSpan="9" className="px-6 py-4 bg-gray-50">
                          <div className="text-sm">
                            <h4 className="font-medium text-gray-900 mb-2">Bill Details:</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div><strong>Address:</strong> {bill.customer_address}</div>
                              <div><strong>GST No:</strong> {bill.customer_gst_no}</div>
                              <div><strong>Total in Words:</strong> {bill.total_in_words}</div>
                            </div>
                            <div className="mt-3">
                              <h5 className="font-medium text-gray-900 mb-2">Line Items:</h5>
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product ID</th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Line Total</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {getBillDetails(bill.bill_id).map((detail) => (
                                      <tr key={detail.detail_id}>
                                        <td className="px-3 py-2">{detail.product_id}</td>
                                        <td className="px-3 py-2">{detail.size}</td>
                                        <td className="px-3 py-2">{detail.quantity}</td>
                                        <td className="px-3 py-2">₹{detail.price}</td>
                                        <td className="px-3 py-2">₹{detail.line_total}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                
                {/* Totals Row */}
                <tr className="bg-blue-50 font-medium">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" colSpan="5">
                    <strong>Page Totals:</strong>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <strong>₹{totals.subtotal.toLocaleString()}</strong>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <strong>₹{totals.gst_amount.toLocaleString()}</strong>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <strong>₹{totals.total.toLocaleString()}</strong>
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * billsPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * billsPerPage, sortedBills.length)}
                  </span> of{' '}
                  <span className="font-medium">{sortedBills.length}</span> results
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BillDetailView = ({ bill, billDetails, isEditing, onSave, onBack, onEdit, onDelete }) => {
  const [editedBill, setEditedBill] = useState({ ...bill });

  const handleSave = () => {
    onSave(editedBill);
  };

  const handleInputChange = (field, value) => {
    setEditedBill(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Bills</span>
            </button>
            <div className="flex space-x-2">
              {!isEditing ? (
                <>
                  <button
                    onClick={onEdit}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={onDelete}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {isEditing ? 'Edit Bill' : 'Bill Details'}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bill No</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedBill.bill_no}
                  onChange={(e) => handleInputChange('bill_no', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{bill.bill_no}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bill Date</label>
              {isEditing ? (
                <input
                  type="date"
                  value={editedBill.bill_date.split('T')[0]}
                  onChange={(e) => handleInputChange('bill_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{new Date(bill.bill_date).toLocaleDateString()}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedBill.customer_name}
                  onChange={(e) => handleInputChange('customer_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{bill.customer_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedBill.customer_mobile}
                  onChange={(e) => handleInputChange('customer_mobile', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{bill.customer_mobile}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              {isEditing ? (
                <textarea
                  value={editedBill.customer_address}
                  onChange={(e) => handleInputChange('customer_address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                />
              ) : (
                <p className="text-gray-900">{bill.customer_address}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST No</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedBill.customer_gst_no}
                  onChange={(e) => handleInputChange('customer_gst_no', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{bill.customer_gst_no}</p>
              )}
            </div>
          </div>

          {/* Bill Details Table */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill Items</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {billDetails.map((detail) => (
                    <tr key={detail.detail_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {detail.style_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {detail.size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {detail.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{detail.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{detail.line_total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bill Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtotal</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editedBill.subtotal}
                    onChange={(e) => handleInputChange('subtotal', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-900">₹{bill.subtotal.toLocaleString()}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST Amount</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editedBill.gst_amount}
                    onChange={(e) => handleInputChange('gst_amount', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-900">₹{bill.gst_amount.toLocaleString()}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                <p className="text-xl font-bold text-blue-600">
                  ₹{isEditing ? (editedBill.subtotal + editedBill.gst_amount).toLocaleString() : bill.total.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Total in Words</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedBill.total_in_words}
                  onChange={(e) => handleInputChange('total_in_words', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 italic">{bill.total_in_words}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dispatch;