const { MongoClient } = require('mongodb');
const WebSocket = require('ws');

const DB_NAME = "inventoryDB";
const COLLECTION_NAME = "inventory";
const MONGO_URI = "mongodb+srv://hudeen09:PbMQbgAO4IHuB8ls@cluster0.e9pup.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

let inventoryCollection;
let changeStream;

async function connectToDatabase(wss) {
  try {
    const client = await MongoClient.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
    
    const db = client.db(DB_NAME);
    inventoryCollection = db.collection(COLLECTION_NAME);

    // Set up change stream
    changeStream = inventoryCollection.watch();
    
    // Listen for database changes
    changeStream.on('change', (change) => {
      if (!wss || !wss.clients) return;

      const message = createChangeMessage(change);
      broadcastChange(wss, message);
    });

    return client;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

function createChangeMessage(change) {
  let message = { type: '', item: null };

  switch(change.operationType) {
    case 'insert':
      message.type = 'inventory_add';
      message.item = change.fullDocument;
      break;
    case 'update':
      message.type = 'inventory_update';
      message.item = { 
        _id: change.documentKey._id, 
        ...change.updateDescription.updatedFields 
      };
      break;
    case 'delete':
      message.type = 'inventory_delete';
      message.item = { _id: change.documentKey._id };
      break;
  }

  return message;
}

function broadcastChange(wss, message) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

function getInventoryCollection() {
  if (!inventoryCollection) {
    throw new Error("Database not initialized. Call connectToDatabase first.");
  }
  return inventoryCollection;
}

function closeChangeStream() {
  if (changeStream) {
    changeStream.close();
    changeStream = null;
  }
}

module.exports = { 
  connectToDatabase, 
  getInventoryCollection,
  closeChangeStream
};