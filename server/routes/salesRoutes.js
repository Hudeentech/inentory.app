const express = require('express');
const { addSale } = require('../controllers/salesController');
const router = express.Router();

router.post('/', addSale);

module.exports = router;
