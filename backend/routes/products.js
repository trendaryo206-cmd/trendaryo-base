const express = require('express');
const {
  getProducts,
  getProduct,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  getTrendingProducts,
  getRelatedProducts,
  getProductsByCategory,
  getProductsOnSale,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../utils/upload');

const router = express.Router();

router.route('/').get(getProducts).post(protect, authorize('admin'), createProduct);

router.route('/trending').get(getTrendingProducts);
router.route('/sale').get(getProductsOnSale);
router.route('/slug/:slug').get(getProductBySlug);

router
  .route('/:id')
  .get(getProduct)
  .put(protect, authorize('admin'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

router
  .route('/:id/image')
  .post(protect, authorize('admin'), upload.single('file'), uploadProductImage);

router.route('/:id/related').get(getRelatedProducts);
router.route('/category/:categoryId').get(getProductsByCategory);

module.exports = router;
