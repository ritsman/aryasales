const express = require("express");
const router = express.Router();
const BillController = require("../controllers/billController");

// Save new bill
router.post("/", (req, res) => BillController.saveBill(req, res));

// Get bill by ID
router.get("/:id", (req, res) => BillController.getBill(req, res));

module.exports = router;
