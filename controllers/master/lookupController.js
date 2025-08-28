// ===============================
// controllers/lookupController.js
// ===============================
const SizeSet = require('../../models/SizeSet');
const ProcessGroup = require('../../models/ProcessGroup');
const ItemBom = require('../../models/ItemBom');

class LookupController {
  constructor() {
    this.sizeSetModel = new SizeSet();
    this.processGroupModel = new ProcessGroup();
    this.itemBomModel = new ItemBom();
  }

  // Get all size sets
  getSizeSets = async (req, res) => {
    try {
      const sizeSets = await this.sizeSetModel.getActive();
      res.json(sizeSets);
    } catch (error) {
      console.error('Error fetching size sets:', error);
      res.status(500).json({ error: 'Failed to fetch size sets' });
    }
  };

  // Get all process groups
  getProcessGroups = async (req, res) => {
    try {
      const processGroups = await this.processGroupModel.getActive();
      res.json(processGroups);
    } catch (error) {
      console.error('Error fetching process groups:', error);
      res.status(500).json({ error: 'Failed to fetch process groups' });
    }
  };

  // Get all item BOMs
  getItemBoms = async (req, res) => {
    try {
      const itemBoms = await this.itemBomModel.getActive();
      res.json(itemBoms);
    } catch (error) {
      console.error('Error fetching item BOMs:', error);
      res.status(500).json({ error: 'Failed to fetch item BOMs' });
    }
  };

  // Get all lookup data at once
  getAllLookupData = async (req, res) => {
    try {
      const [sizeSets, processGroups, itemBoms] = await Promise.all([
        this.sizeSetModel.getActive(),
        this.processGroupModel.getActive(),
        this.itemBomModel.getActive()
      ]);

      res.json({
        success: true,
        data: {
          size_sets: sizeSets,
          process_groups: processGroups,
          item_boms: itemBoms
        }
      });
    } catch (error) {
      console.error('Error fetching lookup data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch lookup data',
        details: error.message
      });
    }
  };
}

module.exports = new LookupController();
