const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { config } = require('dotenv');

const app = express();
const PORT = process.env.PORT || 3000; // Allow for dynamic ports (e.g., in deployment)
const dbFilePath = path.join(__dirname, 'inventory.json');

// Enable CORS for all origins
var whitelist = ["http://localhost:5173", "https://hudeeninventory.netlify.app"];
var corsOptions = { origin: whitelist, credentials: true };
app.use(cors(corsOptions));

// Middleware to parse JSON data
app.use(express.json());

/**
 * Helper function to read inventory data from file.
 * @returns {Array} Parsed inventory data or an empty array in case of error.
 */
const readInventoryData = () => {
  try {
    const data = fs.readFileSync(dbFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading inventory data:', error);
    return [];
  }
};

/**
 * Helper function to write inventory data to file.
 * @param {Array} data - The updated inventory data to save.
 */
const writeInventoryData = (data) => {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing inventory data:', error);
  }
};

// Route to fetch all inventory items
app.get('/inventory', (req, res) => {
  const inventory = readInventoryData();
  res.json(inventory);
});

// Route to add a new item to inventory
app.post('/inventory', (req, res) => {
  const { name, stockQuantity, price } = req.body;

  if (!name || stockQuantity == null || price == null) {
    return res.status(400).json({ error: 'Name, stockQuantity, and price are required.' });
  }

  const newItem = {
    id: uuidv4(),
    name,
    stockQuantity,
    price,
    dateAdded: new Date().toISOString(),
    sales: [] // Initialize with an empty sales array
  };

  const inventory = readInventoryData();
  inventory.push(newItem);
  writeInventoryData(inventory);

  res.status(201).json(newItem);
});

// Route to record a sale for an inventory item
app.post('/sales', (req, res) => {
  const { id, quantitySold, price } = req.body;

  if (!id || quantitySold == null || price == null) {
    return res.status(400).json({ error: 'ID, quantitySold, and price are required.' });
  }

  const inventory = readInventoryData();
  const index = inventory.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Item not found.' });
  }

  const item = inventory[index];

  if (item.stockQuantity < quantitySold) {
    return res.status(400).json({ error: 'Insufficient stock for the sale.' });
  }

  const saleRecord = {
    saleId: uuidv4(),
    saleDate: new Date().toISOString(),
    quantitySold,
    price
  };

  item.sales.push(saleRecord);
  item.stockQuantity -= quantitySold;

  writeInventoryData(inventory);
  res.json(item);
});

// Route to update specific fields of an inventory item
app.patch('/inventory/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const inventory = readInventoryData();
  const index = inventory.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Item not found.' });
  }

  const existingItem = inventory[index];
  inventory[index] = { ...existingItem, ...updates, dateUpdated: new Date().toISOString() };

  writeInventoryData(inventory);
  res.json(inventory[index]);
});

// Route to delete an inventory item by ID
app.delete('/inventory/:id', (req, res) => {
  const { id } = req.params;

  const inventory = readInventoryData();
  const index = inventory.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Item not found.' });
  }

  const [deletedItem] = inventory.splice(index, 1);
  writeInventoryData(inventory);

  res.json(deletedItem);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
