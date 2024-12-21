const express = require('express');
const { getInventory, addOrUpdateInventory, updateInventory, deleteInventory } = require('../controllers/inventoryController');
const router = express.Router();

router.get('/', getInventory);
router.post('/', addOrUpdateInventory);
router.delete('/:id', deleteInventory);
router.patch('/:id', updateInventory);

module.exports = router;
