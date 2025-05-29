// Rotas de produtos (mock Mercado Livre, Elasticsearch)
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.searchProducts);

module.exports = router;
