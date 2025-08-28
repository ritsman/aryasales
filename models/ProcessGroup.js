// ===============================
// models/ProcessGroup.js
// ===============================
const BaseModel = require('./index');

class ProcessGroup extends BaseModel {
  constructor() {
    super('process_groups');
  }

  async getActive() {
    return await this.findAll({ is_active: true }, 'name ASC');
  }
}

module.exports = ProcessGroup;