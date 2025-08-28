// ===============================
// models/SizeSet.js
// ===============================
const BaseModel = require('./index');

class SizeSet extends BaseModel {
  constructor() {
    super('size_sets');
  }

  async getActive() {
    return await this.findAll({ is_active: true }, 'name ASC');
  }

  async findByValue(value) {
    const result = await this.query(
      'SELECT * FROM size_sets WHERE value = $1',
      [value]
    );
    return result.rows[0] || null;
  }
}

module.exports = SizeSet;
