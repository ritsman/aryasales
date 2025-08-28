// ===============================
// models/index.js - Model Registry
// ===============================
const pool = require('../config/database');

class BaseModel {
  constructor(tableName) {
    this.pool = pool;
    this.tableName = tableName;
  }

  async query(text, params) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  async findAll(conditions = {}, orderBy = 'id ASC') {
    let query = `SELECT * FROM ${this.tableName}`;
    const values = [];
    let paramCount = 0;

    if (Object.keys(conditions).length > 0) {
      const whereConditions = [];
      for (const [key, value] of Object.entries(conditions)) {
        paramCount++;
        whereConditions.push(`${key} = $${paramCount}`);
        values.push(value);
      }
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    query += ` ORDER BY ${orderBy}`;

    const result = await this.query(query, values);
    return result.rows;
  }

  async findById(id) {
    const result = await this.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    
    const query = `
      INSERT INTO ${this.tableName} (${keys.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await this.query(query, values);
    return result.rows[0];
  }

  async update(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
    
    const query = `
      UPDATE ${this.tableName}
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.query(query, [id, ...values]);
    return result.rows[0];
  }

  async delete(id) {
    const result = await this.query(
      `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  }
}

module.exports = BaseModel;
