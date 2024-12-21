const { getInventoryCollection } = require('../database');
const { ObjectId } = require('mongodb');
const WebSocket = require('ws'); // WebSocket for real-time updates

let wss; // WebSocket server instance

// Set WebSocket server
exports.setWebSocketServer = (server) => {
  wss = new WebSocket.Server({ server });
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    ws.on('close', () => console.log('WebSocket client disconnected'));
  });
};

// Record a sale
// Record a sale
exports.addSale = async (req, res) => {
  const { itemId, quantitySold, price } = req.body;

  if (!itemId || !quantitySold || !price) {
    return res.status(400).json({ error: "Item ID, quantity sold, and price are required." });
  }

  try {
    const inventoryCollection = getInventoryCollection();

    const item = await inventoryCollection.findOne({ _id: new ObjectId(itemId) });

    if (!item) {
      return res.status(404).json({ error: "Item not found in inventory." });
    }

    if (item.stockQuantity < quantitySold) {
      return res.status(400).json({ error: "Insufficient stock for this sale." });
    }

    const updatedItem = await inventoryCollection.findOneAndUpdate(
      { _id: new ObjectId(itemId) },
      {
        $inc: { stockQuantity: -quantitySold },
        $push: {
          sales: {
            quantitySold, // Updated field name for consistency
            price,
            saleDate: new Date().toISOString(),
          },
        },
      },
      { returnDocument: "after" }
    );

    if (wss) {
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'saleUpdate', data: updatedItem.value }));
        }
      });
    }

    res.status(200).json(updatedItem.value);
  } catch (error) {
    console.error("Error recording sale:", error);
    res.status(500).json({ error: "Failed to record sale." });
  }
};