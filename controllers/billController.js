// controllers/BillController.js
const pool = require("../config/database");
const BillModel = require("../models/Bill");

class BillController {
  // Generate monthly bill number atomically using the provided client
  // billDate can be provided (so back-dated bills use its month) or omitted (use today)
  async generateMonthlyBillNo(client, billDate) {
    const date = billDate ? new Date(billDate) : new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const yearMonth = `${year}${month}`; // '202509'

    // Atomic upsert + return counter
    const q = `
      INSERT INTO bill_counters (year_month, counter)
      VALUES ($1, 1)
      ON CONFLICT (year_month)
      DO UPDATE SET counter = bill_counters.counter + 1
      RETURNING counter
    `;
    const r = await client.query(q, [yearMonth]);
    const counter = r.rows[0].counter;

    const counterStr = String(counter).padStart(4, "0"); // e.g. 0001
    const billNo = `BILL-${yearMonth}-${counterStr}`;
    return billNo;
  }

  // Save bill API (POST /api/bills)
  async saveBill(req, res) {
    const payload = req.body;
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // generate monthly bill no (based on payload.date if provided)
      const billNo = await this.generateMonthlyBillNo(client, payload.date);
      payload.billNo = billNo;

      // create main bill
      const main = await BillModel.createMainBill(client, payload);
      const billId = main.bill_id;

      // create details
      await BillModel.createBillDetails(client, billId, payload.items || []);

      await client.query("COMMIT");

      return res.json({
        success: true,
        message: "Bill saved",
        billId,
        billNo,
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("saveBill error:", err);
      return res.status(500).json({ success: false, error: err.message });
    } finally {
      client.release();
    }
  }

  // GET /api/bills/:billNo
  async getBill(req, res) {
    try {
      const { billNo } = req.params;
      const bill = await BillModel.getBillByNo(billNo);
      if (!bill) {
        return res.status(404).json({ success: false, message: "Bill not found" });
      }
      return res.json({ success: true, bill });
    } catch (err) {
      console.error("getBill error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = new BillController();
