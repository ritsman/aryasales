// ===============================
// models/ItemBom.js
// ===============================
const BaseModel = require('./index');

class ItemBom extends BaseModel {
  constructor() {
    super('item_boms');
  }

  async getActive() {
    return await this.findAll({ is_active: true }, 'name ASC');
  }
}

module.exports = ItemBom;
