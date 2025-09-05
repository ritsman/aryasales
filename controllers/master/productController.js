const { Pool } = require("pg");
const mongoose = require("mongoose");
const Product = require("../../models/Product"); // your BaseModel wrapper
const ProductStock = require("../../models/ProductStock");
const { deleteFile } = require("../../utils/fileHelper");

// Mongoose model for size sets
const sizeSchema = new mongoose.Schema({
  sizeName: { type: String, required: true },
  sizes: { type: [String], required: true },
});
const SizeSet = mongoose.model("sizes", sizeSchema);

// PG client (reuse connection pool ideally)
const pool = new Pool({
  user: "rits",
  host: "localhost",
  database: "gems",
  password: "tipra",
  port: 5432,
});

class ProductController {
  constructor() {
    this.productModel = new Product();
    this.productStockModel = new ProductStock();
  }
  // Get all products with stock and sizes
getAllProducts = async (req, res) => {
  try {
    const products = await this.productModel.findAll({}, "created_at DESC");

    for (const product of products) {
      // Fetch INIT-defined sizes and compute available qty
      const stockRes = await pool.query(
        `
        SELECT s.size_label,
               COALESCE(SUM(
                 CASE WHEN s.movement_type = 'CREDIT' THEN s.quantity
                      WHEN s.movement_type = 'DEBIT' THEN -s.quantity
                      ELSE 0
                 END
               ),0) AS available_qty
        FROM products_stock s
        WHERE s.product_id = $1
        GROUP BY s.size_label
        ORDER BY s.size_label
        `,
        [product.id]
      );

      // Build combined size string like "L,XL,M"
      const sizeLabels = stockRes.rows.map(r => r.size_label).join(",");

      product.sizes = sizeLabels;      // frontend can split this
      product.stocks = stockRes.rows;  // array with {size_label, available_qty}
    }

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch products",
      details: error.message,
    });
  }
};

  // Get all products with stock-earlier method
  getAllProducts2 = async (req, res) => {
    try {
      const products = await this.productModel.findAll({}, "created_at DESC");

      // fetch stocks per product
      for (const product of products) {
        const stockRes = await pool.query(
          `SELECT size_label, 
                  SUM(CASE WHEN movement_type = 'CREDIT' THEN quantity ELSE 0 END) -
                  SUM(CASE WHEN movement_type = 'DEBIT' THEN quantity ELSE 0 END) AS available_qty
           FROM products_stock
           WHERE product_id = $1
           GROUP BY size_label
           ORDER BY size_label`,
          [product.product_id]
        );
        product.stocks = stockRes.rows;
      }

      res.json({
        success: true,
        count: products.length,
        products,
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch products",
        details: error.message,
      });
    }
  };

  // Get single product with stock
  getProduct = async (req, res) => {
    try {
      const { id } = req.params;
      const product = await this.productModel.findById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: "Product not found",
        });
      }

      const stockRes = await pool.query(
        `SELECT size_label, 
                SUM(CASE WHEN movement_type = 'CREDIT' THEN quantity ELSE 0 END) -
                SUM(CASE WHEN movement_type = 'DEBIT' THEN quantity ELSE 0 END) AS available_qty
         FROM products_stock
         WHERE product_id = $1
         GROUP BY size_label
         ORDER BY size_label`,
        [id]
      );
      product.stocks = stockRes.rows;

      res.json({
        success: true,
        product,
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch product",
        details: error.message,
      });
    }
  };

  // Create new product
  createProduct = async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const {
        style_number,
        style_name,
        season,
        hsn_code,
        cost,
        mrp,
        size_set,
        process_group,
        item_bom,
      } = req.body;

      // Check if style number already exists
      const existingProduct = await this.productModel.findByStyleNumber(
        style_number
      );
      if (existingProduct) {
        if (req.file) deleteFile(req.file.path);
        return res.status(400).json({
          success: false,
          error: "Style number already exists",
        });
      }

      const picture_url = req.file
        ? `uploads/products/${req.file.filename}`
        : null;

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
        picture_url,
      };

      const product = await this.productModel.createProduct(productData);
      console.log("Created product:", product);

      // Fetch size set from Mongo
      const sizeDoc = await SizeSet.findOne({ sizeName: size_set });
      if (sizeDoc) {
        for (const size of sizeDoc.sizes) {
          await this.productStockModel.createStock(
            product.id, // ✅ comes from RETURNING *
            size,
            "INIT",
            0
          );
        }
      }

      await client.query("COMMIT");

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        product,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error creating product:", error);
      if (req.file) deleteFile(req.file.path);

      res.status(500).json({
        success: false,
        error: "Failed to create product",
        details: error.message,
      });
    } finally {
      client.release();
    }
  };

  updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existingProduct = await this.productModel.findById(id);
    if (!existingProduct) {
      if (req.file) deleteFile(req.file.path);
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    const productData = { ...req.body };

    // Handle picture
    if (req.file) {
      if (existingProduct.picture_url) {
        deleteFile(
          `public/uploads/products/${existingProduct.picture_url.split("/").pop()}`
        );
      }
      productData.picture_url = `uploads/products/${req.file.filename}`;
    }

    // Update master
    const updatedProduct = await this.productModel.updateProduct(id, productData);

    // If size_set changed, sync stock
    if (productData.size_set && productData.size_set !== existingProduct.size_set) {
      const sizeDoc = await SizeSet.findOne({ sizeName: productData.size_set });
      if (sizeDoc) {
        for (const size of sizeDoc.sizes) {
          const exists = await pool.query(
            "SELECT 1 FROM products_stock WHERE product_id=$1 AND size_label=$2",
            [id, size]
          );
          if (exists.rowCount === 0) {
            await pool.query(
              `INSERT INTO products_stock (product_id, size_label, quantity, movement_type)
               VALUES ($1, $2, $3, $4)`,
              [id, size, 0, "INIT"]
            );
          }
        }
      }
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    if (req.file) deleteFile(req.file.path);

    res.status(500).json({
      success: false,
      error: "Failed to update product",
      details: error.message,
    });
  }
};


  // Delete product (stock rows deleted via cascade)
  deleteProduct = async (req, res) => {
    try {
      const { id } = req.params;

      const existingProduct = await this.productModel.findById(id);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          error: "Product not found",
        });
      }

      if (existingProduct.picture_url) {
        deleteFile(
          `.public/uploads/products/${existingProduct.picture_url
            .split("/")
            .pop()}`
        );
      }

      await this.productModel.delete(id);

      res.json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete product",
        details: error.message,
      });
    }
  };
  // Get product statistics
  getProductStats = async (req, res) => {
    try {
      const stats = await this.productModel.getProductStats();
      res.json({
        success: true,
        stats,
      });
    } catch (error) {
      console.error("Error fetching product stats:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch statistics",
        details: error.message,
      });
    }
  };
  //bulk insert stock opeining
  // bulk insert stock
bulkInsertStock = async (req, res) => {
  
  try {
      const entries = req.body; // array from frontend
      const inserted = await this.productStockModel.bulkInsert(entries);  
    res.json({ success: true,counted:inserted.length, inserted });
  } catch (err) {
    console.error("Error inserting stock:", err);
    res.status(500).json({ success: false, error: err.message });
  } 
};

}

module.exports = new ProductController();
