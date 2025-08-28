// ===============================
// models/Product.js
// ===============================
const BaseModel = require('./index');

class Product extends BaseModel {
  constructor() {
    super('products_master');
  }

  async findByStyleNumber(styleNumber) {
    const result = await this.query(
      'SELECT * FROM products_master WHERE style_number = $1',
      [styleNumber]
    );
    return result.rows[0] || null;
  }

  async findBySeason(season) {
    const result = await this.query(
      'SELECT * FROM products_master WHERE season = $1 ORDER BY created_at DESC',
      [season]
    );
    return result.rows;
  }

  async createProduct(productData) {
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
      picture_url
    } = productData;

    const data = {
      style_number,
      style_name,
      season,
      hsn_code,
      cost: parseFloat(cost),
      mrp: parseFloat(mrp),
      size_set,
      process_group,
      item_bom,
      picture_url,
      created_at: new Date(),
      updated_at: new Date()
    };

    return await this.create(data);
  }

  async updateProduct(id, productData) {
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
      picture_url
    } = productData;

    const data = {
      style_number,
      style_name,
      season,
      hsn_code,
      cost: parseFloat(cost),
      mrp: parseFloat(mrp),
      size_set,
      process_group,
      item_bom
    };

    if (picture_url !== undefined) {
      data.picture_url = picture_url;
    }

    return await this.update(id, data);
  }

  async getProductStats() {
    const result = await this.query(`
      SELECT 
        COUNT(*) as total_products,
        COUNT(DISTINCT season) as total_seasons,
        AVG(cost) as avg_cost,
        AVG(mrp) as avg_mrp
      FROM products_master
    `);
    return result.rows[0];
  }
}

module.exports = Product;
