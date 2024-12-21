const { getInventoryCollection } = require('../database');
const { ObjectId } = require('mongodb');
const WebSocket = require('ws'); // WebSocket for real-time updates

let wss; // WebSocket server instance

// Set WebSocket server after app initialization
exports.setWebSocketServer = (server) => {
  wss = new WebSocket.Server({ server });
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    ws.on('close', () => console.log('WebSocket client disconnected'));
  });
};

// Fetch all inventory items
exports.getInventory = async (req, res) => {
  try {
    const inventoryCollection = getInventoryCollection();
    const inventory = await inventoryCollection.find().toArray();
    res.json(inventory);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
};

// Add or update an inventory item
exports.addOrUpdateInventory = async (req, res) => {
  const { name, stockQuantity, price, priceTag } = req.body;

  if (!name || stockQuantity == null || price == null || priceTag == null) {
    return res.status(400).json({ error: 'Name, stockQuantity, price, and priceTag are required.' });
  }

  try {
    const inventoryCollection = getInventoryCollection();
    const existingItem = await inventoryCollection.findOne({ name });

    if (existingItem) {
      const updatedItem = await inventoryCollection.findOneAndUpdate(
        { name },
        {
          $inc: { stockQuantity },
          $set: { price, priceTag, dateUpdated: new Date().toISOString() },
        },
        { returnDocument: "after" }
      );
      if (wss) {
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'inventoryUpdate', data: updatedItem.value }));
          }
        });
      }
      return res.status(200).json({ message: "Item updated successfully.", updatedItem: updatedItem.value });
    }

    const newItem = {
      name,
      stockQuantity,
      price,
      priceTag,
      dateAdded: new Date().toISOString(),
      sales: [], // Initialize with an empty sales array
    };
    const result = await inventoryCollection.insertOne(newItem);
    if (wss) {
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'inventoryUpdate', data: newItem }));
        }
      });
    }
    return res.status(201).json({ message: "New item added to inventory.", newItem: { ...newItem, _id: result.insertedId } });
  } catch (error) {
    console.error("Error adding or updating inventory item:", error);
    res.status(500).json({ error: "Failed to add or update item in inventory." });
  }
};

// Update specific fields of an inventory item
exports.updateInventory = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (!Object.keys(updates).length) {
    return res.status(400).json({ error: "No updates provided." });
  }

  try {
    const inventoryCollection = getInventoryCollection();

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid item ID format." });
    }

    const query = { _id: new ObjectId(id) };

    const updatedItem = await inventoryCollection.findOneAndUpdate(
      query,
      { $set: { ...updates, dateUpdated: new Date().toISOString() } },
      { returnDocument: "after" }
    );

    if (!updatedItem.value) {
      return res.status(200).json({
        message: "No matching item found, but the request was processed successfully.",
      });
    }

    // Broadcast the update to WebSocket clients
    if (wss) {
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'inventoryUpdate', data: updatedItem.value }));
        }
      });
    }

    res.status(200).json({
      message: "Item updated successfully",
      updatedItem: updatedItem.value,
    });
  } catch (error) {
    console.error("Error updating inventory item:", error);
    res.status(500).json({ error: "Failed to update item." });
  }
};

// Delete an inventory item
exports.deleteInventory = async (req, res) => {
  const { id } = req.params;

  try {
    const inventoryCollection = getInventoryCollection();

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid item ID format." });
    }

    const query = { _id: new ObjectId(id) };

    const deletedItem = await inventoryCollection.findOneAndDelete(query);

    if (!deletedItem.value) {
      return res.status(200).json({
        message: "No matching item found, but the request was processed successfully.",
      });
    }

    // Broadcast the deletion to WebSocket clients
    if (wss) {
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'inventoryDelete', data: deletedItem.value }));
        }
      });
    }

    res.status(200).json({
      message: "Item deleted successfully",
      deletedItem: deletedItem.value,
    });
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    res.status(500).json({ error: "Failed to delete item." });
  }
};
