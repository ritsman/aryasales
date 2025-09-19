const express = require("express");
const router = express.Router();
const BillController = require("../controllers/billController");

// Save new bill
router.post("/", (req, res) => BillController.saveBill(req, res));
//get all bills main
router.get("/bills-main", (req, res) => BillController.getAllBillsMain(req, res));
//get all bills detail
router.get("/bills-detail", (req, res) => BillController.getAllBillsDetail(req, res));

// Get bill by ID
router.get("/:billNo", (req, res) => BillController.getBill(req, res));


module.exports = router;
