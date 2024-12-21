const express = require('express');
const cors = require('cors');
const { connectToDatabase } = require('./database');
const inventoryRoutes = require('./routes/inventoryRoutes');
const salesRoutes = require('./routes/salesRoutes');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const PORT = 3000;

const cors = require("cors");
var whitelist = ["http://localhost:5173", "https://hudeeninventory.netlify.app"];
var corsOptions = { origin: whitelist, credentials: true };
app.use(cors(corsOptions));

// Set up the HTTP server
const server = http.createServer(app);

// WebSocket server setup
const wss = new WebSocket.Server({ server });

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('Client connected');

  // Optionally send a message to the client on connection
  ws.send(JSON.stringify({ message: 'Connected to WebSocket server' }));

  // Listen for messages from the client
  ws.on('message', (message) => {
    console.log('Received message:', message);
    // Handle incoming messages if needed
  });

  // Clean up when the connection is closed
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Use middlewares
app.use(cors());
app.use(express.json());

// Connect to the database
connectToDatabase().then(() => {
  // Routes
  app.use('/inventory', inventoryRoutes);
  app.use('/sales', salesRoutes);

  // Notify clients whenever there is an inventory or sales update (You can trigger this in response to your API requests)
  app.post('/inventory/update', (req, res) => {
    // Assume req.body contains the updated inventory data
    const updatedData = req.body;

    // Broadcast updated data to all connected WebSocket clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'inventoryUpdate', data: updatedData }));
      }
    });

    res.status(200).send('Inventory updated');
  });

  // Start the server
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch(error => {
  console.error("Failed to connect to the database:", error);
});
