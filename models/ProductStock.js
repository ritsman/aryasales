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

  /**
   * Bulk insert stock entries
   * @param {Array} entries - Array of stock objects
   */
  async bulkInsert(entries) {
    if (!entries || entries.length === 0) {
      throw new Error("No stock entries provided");
    }

    const query = `
      INSERT INTO products_stock
        (product_id, size_label, quantity, movement_type, reference_no, movement_date)
      VALUES 
        ${entries
          .map(
            (_, i) =>
              `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`
          )
          .join(",")}
      RETURNING *;
    `;

    const values = entries.flatMap((e) => [
      e.product_id,
      e.size_label,
      e.quantity,
      e.movement_type,
      e.reference_no,
      e.movement_date,
    ]);

    const result = await this.query(query, values);
    return result.rows;
  }
}

module.exports = ProductStock;
