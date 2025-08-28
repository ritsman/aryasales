const express = require('express');
const router = express.Router();
const productController = require('../controllers/master/productController'); 
//const upload = require('../middlewares/uploadMiddleware');
const upload = require('../middlewares/upload');
// Adjust the path as per your structure

// Routes
// router.get('/', (req, res) => {
//   res.send('Products list working!');
// });
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProduct);
//router.post('/', productController.createProduct);
//router.post('/', upload.single('picture'), productController.createProduct);
router.post('/', upload.upload, productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

// Extra route for stats
router.get('/stats', productController.getProductStats);

module.exports = router;
