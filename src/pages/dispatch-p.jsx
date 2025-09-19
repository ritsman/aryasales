import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Eye, Edit, Trash2, ArrowLeft, Plus, Minus,Package} from 'lucide-react';

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
  const [bills, setBills] = useState(mockBillData);
  const [billDetails, setBillDetails] = useState(mockBillDetails);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const billsPerPage = 50;

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
      subtotal: acc.subtotal + bill.subtotal,
      gst_amount: acc.gst_amount + bill.gst_amount,
      total: acc.total + bill.total
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
                        {detail.product_id}
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