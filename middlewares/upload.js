const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product'); // Adjust path as needed

// Ensure uploads directory exists
const uploadsDir = 'public/uploads/products';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory:', uploadsDir);
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('Multer destination called');
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        console.log('Multer filename called with file:', file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
        console.log('Generated filename:', filename);
        cb(null, filename);
    }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
    console.log('File filter called with:', file.mimetype);
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Debug middleware to log request details
const debugUpload = (req, res, next) => {
    console.log('=== UPLOAD DEBUG START ===');
    console.log('Request method:', req.method);
    console.log('Request headers:', req.headers);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request files:', req.files);
    console.log('Request file:', req.file);
    console.log('=== UPLOAD DEBUG END ===');
    next();
};

// Product creation controller
const createProduct = async (req, res) => {
    try {
        console.log('Creating product...');
        console.log('Request body:', req.body);
        console.log('Uploaded file:', req.file);

        const { name, description, price, category } = req.body;

        // Check if file was uploaded
        let imagePath = null;
        if (req.file) {
            imagePath = req.file.path;
            console.log('Image saved at:', imagePath);
        } else {
            console.log('No file uploaded');
        }

        // Save to database
        const product = new Product({
            name,
            description,
            price: parseFloat(price),
            category,
            image: imagePath
        });

        const savedProduct = await product.save();
        console.log('Product saved:', savedProduct);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product: savedProduct
        });

    } catch (error) {
        console.error('Error creating product:', error);
        
        // Delete uploaded file if database save fails
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
            console.log('Cleaned up uploaded file due to error');
        }

        res.status(500).json({
            success: false,
            message: 'Error creating product',
            error: error.message
        });
    }
};

// Export the upload middleware and controller
module.exports = {
    upload: upload.single('picture'), // 'image' should match your form field name
    debugUpload,
    createProduct
};

// Alternative: If you want to handle multiple files
// module.exports = {
//     upload: upload.array('images', 5), // for multiple images
//     debugUpload,
//     createProduct
// };