const express = require('express');

const router = express.Router();

const masterProductRoutes = require('./masterRoutes');
router.use('/products', masterProductRoutes);
router.use('/', (req, res) => {
  res.send('Index function of router2!');
});

module.exports = router;