const { MongoClient } = require('mongodb');

const DB_NAME = "inventoryDB"; // Replace with your database name
const COLLECTION_NAME = "inventory";
const MONGO_URI = "mongodb+srv://hudeen09:PbMQbgAO4IHuB8ls@cluster0.e9pup.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

let inventoryCollection;

// Connect to MongoDB and initialize the collection
async function connectToDatabase() {
  try {
    const client = await MongoClient.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
    const db = client.db(DB_NAME);
    inventoryCollection = db.collection(COLLECTION_NAME);
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

// Function to get the inventory collection
function getInventoryCollection() {
  if (!inventoryCollection) {
    throw new Error("Database not initialized. Call connectToDatabase first.");
  }
  return inventoryCollection;
}

module.exports = { connectToDatabase, getInventoryCollection };
