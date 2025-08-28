// ===============================
// controllers/productController.js
// ===============================

const Product = require('../../models/Product');
const { deleteFile } = require('../../utils/fileHelper');

class ProductController {
  constructor() {
    this.productModel = new Product();
  }

  // Get all products
  getAllProducts = async (req, res) => {
    try {
      const products = await this.productModel.findAll({}, 'created_at DESC');
      
      res.json({
        success: true,
        count: products.length,
        products
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch products',
        details: error.message
      });
    }
  };

  // Get single product
  getProduct = async (req, res) => {
    try {
      const { id } = req.params;
      const product = await this.productModel.findById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      res.json({
        success: true,
        product
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product',
        details: error.message
      });
    }
  };

  // Create new product
  createProduct = async (req, res) => {
    try {
      const {
        style_number,
        style_name,
        season,
        hsn_code,
        cost,
        mrp,
        size_set,
        process_group,
        item_bom
      } = req.body;

      // Check if style number already exists
      const existingProduct = await this.productModel.findByStyleNumber(style_number);
      if (existingProduct) {
        // If file was uploaded, delete it
        if (req.file) {
          deleteFile(req.file.path);
        }
        return res.status(400).json({
          success: false,
          error: 'Style number already exists'
        });
      }

      const picture_url = req.file ? `uploads/products/${req.file.filename}` : null;

      const productData = {
        style_number,
        style_name,
        season,
        hsn_code,
        cost,
        mrp,
        size_set,
        process_group,
        item_bom,
        picture_url
      };

      const product = await this.productModel.createProduct(productData);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product
      });
    } catch (error) {
      console.error('Error creating product:', error);
      
      // Cleanup uploaded file on error
      if (req.file) {
        deleteFile(req.file.path);
      }

      res.status(500).json({
        success: false,
        error: 'Failed to create product',
        details: error.message
      });
    }
  };

  // Update product
  updateProduct = async (req, res) => {
    try {
      const { id } = req.params;
      
      const existingProduct = await this.productModel.findById(id);
      if (!existingProduct) {
        if (req.file) {
          deleteFile(req.file.path);
        }
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      const productData = { ...req.body };

      // Handle picture update
      if (req.file) {
        // Delete old picture
        if (existingProduct.picture_url) {
          deleteFile(`.public/uploads/products/${existingProduct.picture_url.split('/').pop()}`);
        }
        productData.picture_url = `/uploads/products/${req.file.filename}`;
      }

      const updatedProduct = await this.productModel.updateProduct(id, productData);

      res.json({
        success: true,
        message: 'Product updated successfully',
        product: updatedProduct
      });
    } catch (error) {
      console.error('Error updating product:', error);
      
      if (req.file) {
        deleteFile(req.file.path);
      }

      res.status(500).json({
        success: false,
        error: 'Failed to update product',
        details: error.message
      });
    }
  };

  // Delete product
  deleteProduct = async (req, res) => {
    try {
      const { id } = req.params;
      
      const existingProduct = await this.productModel.findById(id);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      // Delete associated picture file
      if (existingProduct.picture_url) {
        deleteFile(`.public/uploads/products/${existingProduct.picture_url.split('/').pop()}`);
      }

      await this.productModel.delete(id);

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete product',
        details: error.message
      });
    }
  };

  // Get product statistics
  getProductStats = async (req, res) => {
    try {
      const stats = await this.productModel.getProductStats();
      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Error fetching product stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch statistics',
        details: error.message
      });
    }
  };
}

module.exports = new ProductController();
