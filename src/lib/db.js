import { MongoClient, ObjectId } from 'mongodb';

// MongoDB connection URI from environment variables
const uri = process.env.MONGODB_URI;

// No options needed - they're deprecated
let client;
let clientPromise;

// Check if MongoDB URI is provided
if (!uri) {
  throw new Error('Please add MONGODB_URI to .env.local');
}

// In development, use a global variable to preserve connection across hot reloads
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create a new connection
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

/**
 * Connect to the MongoDB database and create indexes for better performance
 * @returns {Object} - Contains client, db, and ObjectId
 */
export async function connectToDatabase() {
  const client = await clientPromise;
  const db = client.db('eco_eire');

  // Create indexes for better query performance
  // 2dsphere index allows for geospatial queries (find reports near a location)
  try {
    await db.collection('reports').createIndex({ 'location.coordinates': '2dsphere' });
    await db.collection('reports').createIndex({ userId: 1 });
    await db.collection('reports').createIndex({ status: 1 });
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('events').createIndex({ date: 1 });
  } catch (error) {
    console.log('Indexes may already exist:', error.message);
  }

  return { client, db, ObjectId };
}