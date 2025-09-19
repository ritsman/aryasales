// models/BillModel.js
const pool = require("./index"); // change path if your pool is elsewhere

class BillModel {
  // create main bill, returns { bill_id, bill_no }
  async createMainBill(client, billData) {
    const {
      billNo,
      customerDetails,
      date,
      subtotal,
      gstAmount,
      total,
      totalInWords,
    } = billData;

    const q = `
      INSERT INTO billing_main
        (bill_no, customer_name, customer_mobile, customer_address, customer_gst_no,
         bill_date, subtotal, gst_amount, total, total_in_words)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING bill_id, bill_no;
    `;

    const values = [
      billNo,
      customerDetails?.name ?? null,
      customerDetails?.mobile ?? null,
      customerDetails?.address ?? null,
      customerDetails?.gstNo ?? null,
      date ?? new Date(), // use provided date or now
      subtotal ?? 0,
      gstAmount ?? 0,
      total ?? 0,
      totalInWords ?? null,
    ];

    const r = await client.query(q, values);
    return r.rows[0];
  }

  // insert each item (detail)
  async createBillDetails(client, billId, items = []) {
    if (!items || items.length === 0) return;

    const q = `
      INSERT INTO billing_detail
        (bill_id, product_id, size, quantity, price, line_total)
      VALUES ($1,$2,$3,$4,$5,$6)
    `;
    for (const it of items) {
      // item keys: productId, size, quantity, price, total (line total)
      await client.query(q, [
        billId,
        it.productId,
        it.size ?? null,
        it.quantity,
        it.price,
        it.total,
      ]);
    }
  }

  // fetch bill header + items with product_master join
  async getBillByNo(billNo) {
    // first fetch header
    const mainQ = `SELECT * FROM billing_main WHERE bill_no = $1`;
    const mainRes = await pool.query(mainQ, [billNo]);
    if (mainRes.rows.length === 0) return null;
    const main = mainRes.rows[0];

    // then fetch items joined with products_master
    const itemsQ = `
      SELECT bd.detail_id, bd.product_id, bd.size, bd.quantity, bd.price, bd.line_total,
             pm.style_number, pm.style_name, pm.mrp
      FROM billing_detail bd
      JOIN products_master pm ON bd.product_id = pm.id
      WHERE bd.bill_id = $1
      ORDER BY bd.detail_id
    `;
    const itemsRes = await pool.query(itemsQ, [main.bill_id]);

    return {
      main,
      items: itemsRes.rows,
    };
  }
}

module.exports = new BillModel();
