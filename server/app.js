const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const cors = require('cors');
app.use(cors());

// Middleware to parse JSON data
app.use(express.json());

const dbFilePath = path.join(__dirname, 'inventory.json'); // Adjust path if needed

const readInventoryData = () => {
  try {
    const data = fs.readFileSync(dbFilePath);
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading inventory data:', error);
    return []; // Return an empty array in case of failure
  }
};

// Helper function to write inventory data
const writeInventoryData = (data) => {
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
};

app.get('/inventory', (req, res) => {
  const inventory = readInventoryData();
  console.log('Fetched inventory:', inventory); // Log data to see if it is being fetched correctly
  res.json(inventory);
});

// Route to add a new item
app.post('/inventory', (req, res) => {
  const newItem = { ...req.body, id: uuidv4(), dateAdded: new Date().toISOString() }; // Add ID and date
  const inventory = readInventoryData();
  inventory.push(newItem);
  writeInventoryData(inventory);
  res.status(201).json(newItem);
});

// Route to handle sales (includes price and quantitySold)
app.post('/sales', (req, res) => {
  const { id, quantitySold, price } = req.body;
  const inventory = readInventoryData();

  const index = inventory.findIndex(item => item.id === id);

  if (index !== -1) {
    const item = inventory[index];
    const saleRecord = {
      saleId: uuidv4(),
      saleDate: new Date().toISOString(),
      quantitySold,
      price,
    };

    // Add sales array if it doesn't exist
    if (!item.sales) {
      item.sales = [];
    }

    // Push the sale record to the item's sales array
    item.sales.push(saleRecord);

    // Update the stock quantity
    item.stockQuantity -= quantitySold;

    writeInventoryData(inventory);
    res.json(item);
  } else {
    res.status(404).send('Item not found');
  }
});

// Route to update an item (using PATCH to update specific fields)
app.patch('/inventory/:id', (req, res) => {
  const { id } = req.params;
  const updatedItem = req.body;
  const inventory = readInventoryData();

  const index = inventory.findIndex(item => item.id === id);

  if (index !== -1) {
    const existingItem = inventory[index];
    // Merge the existing item with the updated fields
    inventory[index] = { ...existingItem, ...updatedItem, dateUpdated: new Date().toISOString() };
    writeInventoryData(inventory);
    res.json(inventory[index]);
  } else {
    res.status(404).send('Item not found');
  }
});

// Route to delete an item (by ID)
app.delete('/inventory/:id', (req, res) => {
  const { id } = req.params;
  const inventory = readInventoryData();

  const index = inventory.findIndex(item => item.id === id);

  if (index !== -1) {
    const deletedItem = inventory.splice(index, 1);
    writeInventoryData(inventory);
    res.json(deletedItem);
  } else {
    res.status(404).send('Item not found');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
