import React, { useState, useEffect } from 'react';
import { ChevronDown, Package, Printer, Download } from 'lucide-react';
import config from "../config";
import JsBarcode from "jsbarcode";
import { jsPDF } from "jspdf";
import "svg2pdf.js";



// Mock data - Replace with actual API calls
const mockProducts = [
  {
    id: 1,
    style_number: '1234',
    style_name: 'Classic Cotton T-Shirt',
    season: 'Summer 2024',
    hsn_code: '61091000',
    cost: 250,
    mrp: 499,
    size_set: 'S,M,L,XL',
    process_group: 'Apparel',
    item_bom: 'Cotton 100%',
    picture_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center',
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    style_number: '5678',
    style_name: 'Premium Denim Jeans',
    season: 'All Season',
    hsn_code: '62034200',
    cost: 800,
    mrp: 1299,
    size_set: '28,30,32,34,36',
    process_group: 'Denim',
    item_bom: 'Cotton 98%, Elastane 2%',
    picture_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop&crop=center',
    created_at: '2024-01-20T14:45:00Z'
  }
];

const mockStock = {
  1: [
    { stock_id: 1, product_id: 1, size_label: 'S', quantity: 25, movement_type: 'IN', reference_no: 'PO001', movement_date: '2024-01-15', created_at: '2024-01-15T10:30:00Z' },
    { stock_id: 2, product_id: 1, size_label: 'M', quantity: 30, movement_type: 'IN', reference_no: 'PO001', movement_date: '2024-01-15', created_at: '2024-01-15T10:30:00Z' },
    { stock_id: 3, product_id: 1, size_label: 'L', quantity: 20, movement_type: 'IN', reference_no: 'PO001', movement_date: '2024-01-15', created_at: '2024-01-15T10:30:00Z' },
    { stock_id: 4, product_id: 1, size_label: 'XL', quantity: 15, movement_type: 'IN', reference_no: 'PO001', movement_date: '2024-01-15', created_at: '2024-01-15T10:30:00Z' }
  ],
  2: [
    { stock_id: 5, product_id: 2, size_label: '28', quantity: 12, movement_type: 'IN', reference_no: 'PO002', movement_date: '2024-01-20', created_at: '2024-01-20T14:45:00Z' },
    { stock_id: 6, product_id: 2, size_label: '30', quantity: 18, movement_type: 'IN', reference_no: 'PO002', movement_date: '2024-01-20', created_at: '2024-01-20T14:45:00Z' },
    { stock_id: 7, product_id: 2, size_label: '32', quantity: 22, movement_type: 'IN', reference_no: 'PO002', movement_date: '2024-01-20', created_at: '2024-01-20T14:45:00Z' },
    { stock_id: 8, product_id: 2, size_label: '34', quantity: 16, movement_type: 'IN', reference_no: 'PO002', movement_date: '2024-01-20', created_at: '2024-01-20T14:45:00Z' },
    { stock_id: 9, product_id: 2, size_label: '36', quantity: 8, movement_type: 'IN', reference_no: 'PO002', movement_date: '2024-01-20', created_at: '2024-01-20T14:45:00Z' }
  ]
};

// Barcode generation function (simplified - replace with proper barcode library)
const generateBarcode = (styleNumber, size, mrp) => {
  const paddedStyle = styleNumber.padStart(4, '0').substring(0, 4);
  const paddedSize = size.toString().padStart(2, '0').substring(0, 2);
  const paddedMrp = mrp.toString().padStart(3, '0').substring(0, 3);
  return `${paddedStyle}${paddedSize}${paddedMrp}`;
};

// Simple barcode bars generation for visual representation
const generateBarcodePattern = (code) => {
  const patterns = {
    '0': '0001101', '1': '0011001', '2': '0010011', '3': '0111101', '4': '0100011',
    '5': '0110001', '6': '0101111', '7': '0111011', '8': '0110111', '9': '0001011'
  };
  
  let result = '101'; // Start pattern
  for (let digit of code) {
    result += patterns[digit] || '0001101';
  }
  result += '101'; // End pattern
  
  return result.split('').map((bit, index) => (
    <div
      key={index}
      className={`inline-block ${bit === '1' ? 'bg-black' : 'bg-white'}`}
      style={{ width: '2px', height: '40px' }}
    />
  ));
};

const Barcode = () => {
    const BASE_URL = config.APIPOST_URL;
    const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockData, setStockData] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
    // Load products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/products`);
        const data = await response.json();
        console.log('Fetched products:', data);
        setProducts(data.products || [] );
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  // Load stock when product is selected
  const fetchStockData = async (productId) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/products/${productId}`);
      const data = await response.json();
      console.log('Fetched stock data:', data);
      setStockData(data.product||[]);
    } catch (error) {
      console.error('Error fetching stock:', error);
    }
    setLoading(false);
  };
  // Simulate API call to fetch stock data
  const fetchStockData2 = async (productId) => {
    setLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setStockData(mockStock[productId] || []);
    setLoading(false);
  };

  useEffect(() => {
    if (selectedProduct) {
      fetchStockData(selectedProduct.id);
    }
  }, [selectedProduct]);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setDropdownOpen(false);
  };

function generateBarcodeSVG(barcodeValue, height = 40) {
  // Must use createElementNS
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

  JsBarcode(svg, barcodeValue, {
    format: "CODE128",
    displayValue: true,
    fontSize: 10,
    margin: 0,
    width: 2,
    height: height,
  });

  // ✅ Ensure only one xmlns attribute exists
  if (svg.hasAttribute("xmlns")) {
    svg.removeAttribute("xmlns");
  }

  return svg;
}

const generatePDFBarcode = async (product, sizeLabel, quantity) => {
  //LATEST, HOPE THIS IS THE ONE
  // Page size: 105mm wide (3 labels) x 22mm tall (label height)
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [105, 22] });

  const labelWidth = 35;   // each label width
  const labelHeight = 22;  // each label height
  let col = 0, x = 0;

  for (let i = 0; i < quantity; i++) {
    const paddedId = product.id.toString().padStart(4, "0");
    const barcodeValue = `1${paddedId}${sizeLabel}`;
    const svg = generateBarcodeSVG(barcodeValue);

    // draw barcode inside its label box
    await pdf.svg(svg, {
      x: x + 2,
      y: 2,
      width: labelWidth - 4,
      height: 10,
    });

    // add text under barcode
    pdf.setFontSize(6);
    pdf.text(`Style: ${product.style_number}`, x + 2, 14);
    pdf.text(`Size: ${sizeLabel}`, x + 2, 16);
    pdf.text(`MRP: ₹${product.mrp}`, x + 9, 16);

    // move to next column
    col++;
    x += labelWidth;

    // if 3 columns filled OR last barcode → new page
    if (col >= 3 || i === quantity - 1) {
      if (i < quantity - 1) pdf.addPage();
      col = 0;
      x = 0;
    }
  }

  pdf.save("barcode.pdf");
};

// Function to generate PDF with barcodes
const generatePDFBarcodePage = async (product, sizeLabel, quantity) => {
  const barcodeValue = `${product.style_number}${sizeLabel}-${product.mrp}`;
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [105, 297], // Half A4 page size
  });

  // Label grid settings
  const labelWidth = 105 / 3;  // 3 columns
  const labelHeight = 28;      // Enough space for barcode + text
  let x = 0;
  let y = 0;
  let col = 0;

  for (let i = 0; i < quantity; i++) {
    // Generate barcode SVG
     const paddedId = product.id.toString().padStart(4, "0"); 
    const barcodeValue = `1${paddedId}${sizeLabel}`;
    const svg = generateBarcodeSVG(barcodeValue);

    // Add barcode
    await pdf.svg(svg, {
      x: x + 2,
      y: y + 2,
      width: labelWidth - 4,
      height: 12,
    });

    // Add product details
    pdf.setFontSize(6);
    pdf.text(`Style: ${product.style_number}`, x + 2, y + 16);
    pdf.text(`Size: ${sizeLabel}`, x + 2, y + 20);
    pdf.text(`MRP: ₹${product.mrp}`, x + 10, y + 20);

    // Move to next column
    col++;
    x += labelWidth;

    // If row is filled (3 cols), reset X and move down
    if (col >= 3) {
      col = 0;
      x = 0;
      y += labelHeight;
    }

    // If page is filled, add new page
    if (y + labelHeight > 290) {
      pdf.addPage();
      x = 0;
      y = 0;
      col = 0;
    }
  }

  // Save file
  pdf.save(`${product.style_number}_barcodes.pdf`);
};

const generatePDFBarcodeGood= async(product, sizeLabel, quantity)=>{
  
  //alert('hi');
  const pdf = await new jsPDF({ orientation: "landscape", unit: "mm", format: [105, 297] });
  //const pdf = await new jsPDF({ orientation: "landscape", unit: "mm", format: [62, 146] });
  //const svg = generateBarcodeSVG(barcodeValue)
  //const svg = generateBarcodeSVG("test123");
  const labelWidth = 105/3;  
  const labelHeight = 28; 
  let x = 0, y =0, col = 0;

  for (let i = 0; i < quantity; i++) {
    const paddedId = product.id.toString().padStart(4, "0"); 
  const barcodeValue = `1${paddedId}${sizeLabel}`;
  console.log(barcodeValue,product,quantity,sizeLabel);
    const paddingX = 2;
    const paddingY = 2;
    console.log(i,x,y);
    const svg = generateBarcodeSVG(barcodeValue)
    await pdf.svg(svg, {
  x: x + paddingX,
  y: y + paddingY,
  width: labelWidth - 4,
  height: 12,
  
});

    pdf.setFontSize(6);
    pdf.text(`Style: ${product.style_number}`, x + 2, y + 14);
    pdf.text(`Size: ${sizeLabel}`, x + 2, y + 17);
    pdf.text(`MRP: ₹${product.mrp}`, x + 10, y + 17);

    col++;
    x += labelWidth;

    if (col >= 3) {
      col = 0;
      x = 0;
      y += labelHeight;
    }

    if (y + labelHeight > 290) {
      pdf.addPage();
      x = 0;
      y = 0;
      col = 0;
    }
  }
//await pdf.svg(svg, { x: 5, y: -10, width:60, height: 100 });
pdf.save("barcode.pdf"); 

}
const generatePDFBarcode2w3 = async (product, sizeLabel, quantity) => {
  const pdf = await new jsPDF({ orientation: "portrait", unit: "mm", format: [105, 297] });

  const labelWidth = 35;  
  const labelHeight = 22; 

  const barcodeValue = `${product.style_number}-${sizeLabel}-${product.mrp}`;
  const barcodeSVG = generateBarcodeSVG(barcodeValue);

  let x = 0, y = 0, col = 0;

  for (let i = 0; i < quantity; i++) {
    const paddingX = 2;
    const paddingY = 2;

    // D/raw vector SVG directly into PDF
    await pdf.addSvgAsImage(
      barcodeSVG,
      x + paddingX,
      y + paddingY,
      labelWidth - 4,
      12
    );

    pdf.setFontSize(6);
    pdf.text(`Style: ${product.style_number}`, x + 2, y + 17);
    pdf.text(`Size: ${sizeLabel}`, x + 2, y + 20);
    pdf.text(`MRP: ₹${product.mrp}`, x + 20, y + 20);

    col++;
    x += labelWidth;

    if (col >= 3) {
      col = 0;
      x = 0;
      y += labelHeight;
    }

    if (y + labelHeight > 290) {
      pdf.addPage();
      x = 0;
      y = 0;
      col = 0;
    }
  }

  await pdf.save(`${product.style_number}_${sizeLabel}.pdf`);
};
// Convert JsBarcode to SVG string
function generateBarcodeSVG2(value) {
  const svgNode = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  JsBarcode(svgNode, value, {
    format: "CODE128",
    displayValue: true,
    fontSize: 8,
    margin: 0,
    height: 40,
  });
  return new XMLSerializer().serializeToString(svgNode);
}

const generatePDFBarcode33=(product, sizeLabel, quantity)=> {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [105, 297] });

  const labelWidth = 35;  // 10.5 cm / 3
  const labelHeight = 22; // 2.2 cm

  const barcodeValue = `${product.style_number}-${sizeLabel}-${product.mrp}`;
  const barcodeSVG = generateBarcodeSVG(barcodeValue);

  let x = 0;
  let y = 0;
  let col = 0;

  for (let i = 0; i < quantity; i++) {
    pdf.addSvgAsImage(barcodeSVG, x + 2, y + 2, labelWidth - 4, 12);

    pdf.setFontSize(6);
    pdf.text(`Style22: ${product.style_number}`, x + 2, y + 17);
    pdf.text(`Size: ${sizeLabel}`, x + 2, y + 20);
    pdf.text(`MRP: ₹${product.mrp}`, x + 20, y + 20);

    col++;
    x += labelWidth;

    if (col >= 3) {
      col = 0;
      x = 0;
      y += labelHeight;
    }

    if (y + labelHeight > 290) {
      pdf.addPage();
      x = 0;
      y = 0;
      col = 0;
    }
  }

  pdf.save(`${product.style_number}_${sizeLabel}_labels.pdf`);
}

function generateBarcodeImage(barcodeValue, width = 120, height = 40) {
  const canvas = document.createElement("canvas");
  const scale = 8; // increase this if still blurry
  canvas.width = 300 * scale;
  canvas.height = 100 * scale;
  JsBarcode(canvas, barcodeValue, {
    format: "CODE128",
    displayValue: true,
    fontSize: 8,
    margin: 0,
    width: 2, // thickness of bars
    height: height,
  });
  return canvas.toDataURL("image/png");
}


// Generate and print PDF with barcodes
const generatePDFBarcodeLL=(product, sizeLabel, quantity)=> {
  // PDF in millimeters
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [105, 297] });
  // 105mm ~ A6 width, matches roll (10.5cm)

  const labelWidth = 35;  // 105 / 3 = 35mm
  const labelHeight = 22; // given = 2.2cm = 22mm

  const barcodeValue = `${product.style_number}-${sizeLabel}-${product.mrp}`;
  const barcodeImage = generateBarcodeImage(barcodeValue);

  let x = 0;
  let y = 0;
  let col = 0;

  for (let i = 0; i < quantity; i++) {
    // Positioning inside the label
    const paddingX = 2;
    const paddingY = 2;

    pdf.addImage(
      barcodeImage,
      "PNG",
      x + paddingX,
      y + paddingY,
      labelWidth - 4,
      12 // barcode height inside sticker
    );

    // Text below barcode
    pdf.setFontSize(6);
    pdf.text(`Style: ${product.style_number}`, x + 2, y + 17);
    pdf.text(`Size: ${sizeLabel}`, x + 2, y + 20);
    pdf.text(`MRP: ₹${product.mrp}`, x + 20, y + 20);

    // Move to next column
    col++;
    x += labelWidth;

    // Wrap to next row
    if (col >= 3) {
      col = 0;
      x = 0;
      y += labelHeight;
    }

    // If page full, add new page
    if (y + labelHeight > 290) {
      pdf.addPage();
      x = 0;
      y = 0;
      col = 0;
    }
  }
  console.log('Generating PDF for:', product, "size:",sizeLabel, "qty:",quantity);
  

  // Save the PDF file
  pdf.save(`${product.style_number}_${sizeLabel}.pdf`);

  // Optionally: Open print dialog directly
  const blobUrl = URL.createObjectURL(pdf.output("blob"));
  const printWindow = window.open(blobUrl);
  if (printWindow) {
    printWindow.onload = function () {
      printWindow.focus();
      printWindow.print();
    };
  }
}

  const generatePDFBarcode2cancelater = (product, size, quantity) => {
    const barcodeValue = generateBarcode(product.style_number, size, product.mrp);
    
    // Create a simple PDF content (in real implementation, use jsPDF or similar)
    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Barcode - ${product.style_name} - Size ${size}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
          .barcode-container { margin: 20px 0; }
          .barcode-number { font-size: 16px; font-weight: bold; margin-top: 10px; }
          .product-info { margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="product-info">
          <h2>${product.style_name}</h2>
          <p>Style: ${product.style_number} | Size: ${size} | MRP: ₹${product.mrp}</p>
          <p>Quantity: ${quantity} | HSN: ${product.hsn_code}</p>
        </div>
        <div class="barcode-container">
          <div style="display: inline-block; border: 1px solid #ccc; padding: 10px;">
            ${generateBarcodePattern(barcodeValue).map(bar => 
              `<div style="display: inline-block; width: 2px; height: 40px; background: ${bar.props.className.includes('bg-black') ? 'black' : 'white'};"></div>`
            ).join('')}
          </div>
          <div class="barcode-number">${barcodeValue}</div>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `;

    const blob = new Blob([pdfContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank');
    
    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(url);
      if (newWindow) newWindow.close();
    }, 3000);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Package className="mr-3" size={24} />
            Product Stock & Barcode Management
          </h1>
        </div>

        <div className="p-6">
          {/* Product Dropdown */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Product
            </label>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full sm:w-80 bg-white border border-gray-300 rounded-md px-4 py-3 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between hover:bg-gray-50"
              >
                <span className="truncate">
                  {selectedProduct ? `${selectedProduct.style_number} - ${selectedProduct.style_name}` : 'Choose a product...'}
                </span>
                <ChevronDown className={`transform transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} size={20} />
              </button>

              {dropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 focus:outline-none focus:bg-blue-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{product.style_number} - {product.style_name}</div>
                      <div className="text-sm text-gray-500">Season: {product.season} | MRP: ₹{product.mrp}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {selectedProduct && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Product Information */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-center mb-4">
                      <img
                        src={selectedProduct.picture_url}
                        alt={selectedProduct.style_name}
                        className="w-32 h-32 object-cover rounded-lg shadow-md"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=200&h=200&fit=crop&crop=center';
                        }}
                      />
                    </div>
                    <div><span className="font-medium">Style:</span> {selectedProduct.style_number}</div>
                    <div><span className="font-medium">Name:</span> {selectedProduct.style_name}</div>
                    <div><span className="font-medium">Season:</span> {selectedProduct.season}</div>
                    <div><span className="font-medium">HSN Code:</span> {selectedProduct.hsn_code}</div>
                    <div><span className="font-medium">Cost:</span> ₹{selectedProduct.cost}</div>
                    <div><span className="font-medium">MRP:</span> ₹{selectedProduct.mrp}</div>
                    <div><span className="font-medium">Process Group:</span> {selectedProduct.process_group}</div>
                    <div><span className="font-medium">BOM:</span> {selectedProduct.item_bom}</div>
                  </div>
                </div>
              </div>

              {/* Stock Information */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Details by Size</h3>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading stock data...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stockData?.stocks?.map((stock) => (
                      <div key={stock.stock_id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="text-lg font-bold text-gray-900">Size {stock.size_label}</div>
                            <div className="text-sm text-gray-600">Qty: {stock.available_qty}</div>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            stock.quantity > 20 ? 'bg-green-100 text-green-800' :
                            stock.quantity > 10 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {stock.available_qty > 20 ? 'High Stock' : stock.available_qty > 10 ? 'Medium Stock' : 'Low Stock'}
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-500 mb-3">
                          <div>Ref: {stock.reference_no}</div>
                          <div>Date: {new Date(stock.movement_date).toLocaleDateString()}</div>
                        </div>

                        {/* Barcode Preview */}
                        <div className="mb-3 p-2 bg-gray-50 rounded text-center">
                          <div className="text-xs text-gray-600 mb-1">Barcode Preview</div>
                          <div className="flex justify-center mb-1">
                            {generateBarcodePattern(generateBarcode(selectedProduct.style_number, stock.size_label, selectedProduct.mrp))}
                          </div>
                          <div className="text-xs font-mono text-gray-800">
                            {generateBarcode(selectedProduct.style_number, stock.size_label, selectedProduct.mrp)}
                          </div>
                        </div>

                        <button
                          onClick={() => generatePDFBarcode(selectedProduct, stock.size_label, stock.available_qty)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                        >
                          <Printer className="mr-2" size={16} />
                          Print Barcode
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {!loading && stockData.length === 0 && selectedProduct && (
                  <div className="text-center py-8 text-gray-500">
                    <Package size={48} className="mx-auto mb-2 opacity-50" />
                    <p>No stock data available for this product</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {!selectedProduct && (
            <div className="text-center py-12 text-gray-500">
              <Package size={64} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">Please select a product to view stock details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Barcode;