// ===============================
// models/ProductStock.js
// ===============================
const BaseModel = require("./index");

class ProductStock extends BaseModel {
  constructor() {
    super("products_stock", "stock_id"); // assuming PK = stock_id
  }

  async createStock(productId, sizeLabel, movementType = "INIT", quantity = 0) {
    const result = await this.query(
      `
      INSERT INTO products_stock (product_id, size_label, quantity, movement_type, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *;
      `,
      [productId, sizeLabel, quantity, movementType]
    );
    return result.rows[0];
  }

  async findByProduct(productId) {
    const result = await this.query(
      `SELECT * FROM products_stock WHERE product_id = $1 ORDER BY size_label`,
      [productId]
    );
    return result.rows;
  }
}

module.exports = ProductStock;
