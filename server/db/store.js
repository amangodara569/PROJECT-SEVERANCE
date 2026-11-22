const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

// Memory store holding all collections including votes
let data = {
  users: [],
  floors: [],
  posts: [],
  comments: [],
  layoffs: [],
  jobs: [],
  reports: [],
  votes: []
};

let isAtlasConnected = false;
let connectPromise = null;

// Helper to safely get the MongoDB database handle from Mongoose
const getDb = () => {
  if (mongoose.connection && mongoose.connection.db) {
    return mongoose.connection.db;
  }
  if (mongoose.connection && typeof mongoose.connection.getClient === 'function') {
    try {
      const client = mongoose.connection.getClient();
      if (client && typeof client.db === 'function') {
        return client.db();
      }
    } catch {
      return null;
    }
  }
  return null;
};

// Writes the in-memory store to db.json synchronously
const saveLocal = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving local JSON store:', err.message);
  }
};

// Asynchronously persists an operation to MongoDB Atlas when connected
const syncToAtlas = async (action, collectionName, itemOrId, changes = null) => {
  const db = getDb();
  if (!isAtlasConnected || !db) return;
  try {
    const col = db.collection(collectionName);
    if (action === 'insert') {
      await col.updateOne({ _id: itemOrId._id }, { $set: itemOrId }, { upsert: true });
    } else if (action === 'update') {
      await col.updateOne({ _id: itemOrId }, { $set: changes });
    } else if (action === 'inc') {
      await col.updateOne({ _id: itemOrId }, { $inc: changes });
    } else if (action === 'delete') {
      await col.deleteOne({ _id: itemOrId });
    }
  } catch (err) {
    console.error(`Atlas sync error on ${collectionName} (${action}):`, err.message);
  }
};

// Ensures required performance and uniqueness indexes are built on Atlas collections
const ensureIndexes = async () => {
  const db = getDb();
  if (!isAtlasConnected || !db) return;
  try {
    await db.collection('posts').createIndex({ floor: 1, createdAt: -1 });
    await db.collection('posts').createIndex({ score: -1, _id: -1 });
    await db.collection('posts').createIndex({ hidden: 1, createdAt: -1 });
    await db.collection('comments').createIndex({ post: 1, createdAt: 1 });
    await db.collection('floors').createIndex({ slug: 1 }, { unique: true });
    await db.collection('layoffs').createIndex({ createdAt: -1 });
    await db.collection('layoffs').createIndex({ company: 1 });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('reports').createIndex({ reporter: 1, targetType: 1, targetId: 1 }, { unique: true });
    await db.collection('votes').createIndex({ user: 1, targetType: 1, targetId: 1 }, { unique: true });
  } catch (err) {
    console.warn('Index creation warning on Atlas:', err.message);
  }
};

// Initializes connection to MongoDB Atlas if MONGODB_URI is provided
const initAtlas = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) return false;
  if (isAtlasConnected && getDb()) return true;
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    try {
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 5000,
          maxPoolSize: 20
        });
      }
      const db = getDb();
      if (!db) {
        throw new Error('Database handle not available after connection');
      }
      isAtlasConnected = true;

      const colNames = ['users', 'floors', 'posts', 'comments', 'layoffs', 'jobs', 'reports', 'votes'];
      for (const name of colNames) {
        const col = db.collection(name);
        const docs = await col.find({}).maxTimeMS(5000).toArray();
        if (docs && docs.length > 0) {
          data[name] = docs;
        } else if (data[name] && data[name].length > 0) {
          await col.insertMany(data[name]);
        }
      }
      await ensureIndexes();
      saveLocal();
      return true;
    } catch (err) {
      isAtlasConnected = false;
      console.warn('MongoDB Atlas connection failed. Falling back to local JSON store:', err.message);
      return false;
    } finally {
      connectPromise = null;
    }
  })();

  return connectPromise;
};

// Loads db.json into memory or triggers seed initialization
const init = () => {
  if (fs.existsSync(DB_PATH)) {
    try {
      const content = fs.readFileSync(DB_PATH, 'utf8');
      data = JSON.parse(content);
      data.votes = data.votes || [];
    } catch (e) {
      console.error('Failed to parse db.json, re-initializing:', e.message);
    }
  } else {
    const seedScriptPath = path.join(__dirname, '..', 'scripts', 'seed.js');
    if (fs.existsSync(seedScriptPath)) {
      try {
        const { runSeed } = require('../scripts/seed');
        runSeed();
        if (fs.existsSync(DB_PATH)) {
          data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
          data.votes = data.votes || [];
        }
      } catch (err) {
        console.error('Seed run on init failed:', err.message);
      }
    }
    saveLocal();
  }

  if (process.env.MONGODB_URI || process.env.MONGO_URI) {
    initAtlas().catch((err) => {
      console.warn('Atlas init error:', err.message);
    });
  }
};

init();

const getAll = (name) => {
  return [...(data[name] || [])];
};

const findById = (name, id) => {
  if (!id) return null;
  const targetId = id.toString();
  return (data[name] || []).find((item) => (item._id && item._id.toString() === targetId) || (item.id && item.id.toString() === targetId)) || null;
};

const findOne = (name, testFunction) => {
  return (data[name] || []).find(testFunction) || null;
};

const insert = (name, item) => {
  if (!data[name]) data[name] = [];
  const newItem = {
    _id: item._id || crypto.randomUUID(),
    createdAt: item.createdAt || new Date().toISOString(),
    ...item
  };
  data[name].push(newItem);
  saveLocal();
  syncToAtlas('insert', name, newItem);
  return newItem;
};

const update = (name, id, changes) => {
  const item = findById(name, id);
  if (!item) return null;
  Object.assign(item, changes);
  saveLocal();
  syncToAtlas('update', name, id.toString(), changes);
  return item;
};

// Atomically increments numeric fields on target document
const inc = (name, id, field, amount = 1) => {
  const item = findById(name, id);
  if (!item) return null;
  item[field] = (item[field] || 0) + amount;
  saveLocal();
  syncToAtlas('inc', name, id.toString(), { [field]: amount });
  return item;
};

const remove = (name, id) => {
  if (!data[name]) return false;
  const targetId = id.toString();
  const initialLength = data[name].length;
  data[name] = data[name].filter((item) => item._id !== targetId && item.id !== targetId);
  if (data[name].length !== initialLength) {
    saveLocal();
    syncToAtlas('delete', name, targetId);
    return true;
  }
  return false;
};

// Handles atomic casting and toggling of votes, updating score by delta
const castVote = ({ userId, targetType, targetId, value }) => {
  data.votes = data.votes || [];
  const existingIndex = data.votes.findIndex(v => v.user === userId && v.targetType === targetType && v.targetId === targetId);

  let scoreDiff = 0;
  let finalVote = 0;

  if (value === 0) {
    // Explicit unvote / vote cancellation
    if (existingIndex !== -1) {
      const existing = data.votes[existingIndex];
      scoreDiff = -existing.value;
      const voteId = existing._id;
      data.votes.splice(existingIndex, 1);
      syncToAtlas('delete', 'votes', voteId);
    }
    finalVote = 0;
  } else {
    const numericValue = value > 0 ? 1 : -1;
    if (existingIndex === -1) {
      const voteRecord = {
        _id: crypto.randomUUID(),
        user: userId,
        targetType,
        targetId,
        value: numericValue,
        createdAt: new Date().toISOString()
      };
      data.votes.push(voteRecord);
      syncToAtlas('insert', 'votes', voteRecord);
      scoreDiff = numericValue;
      finalVote = numericValue;
    } else {
      const existing = data.votes[existingIndex];
      if (existing.value === numericValue) {
        // Clicking same button again removes vote
        const voteId = existing._id;
        data.votes.splice(existingIndex, 1);
        syncToAtlas('delete', 'votes', voteId);
        scoreDiff = -numericValue;
        finalVote = 0;
      } else {
        // Switching vote from +1 to -1 or vice versa
        scoreDiff = numericValue - existing.value;
        existing.value = numericValue;
        syncToAtlas('update', 'votes', existing._id, { value: numericValue });
        finalVote = numericValue;
      }
    }
  }

  const targetCol = targetType === 'comment' ? 'comments' : 'posts';
  const updatedItem = inc(targetCol, targetId, 'score', scoreDiff);
  saveLocal();

  return {
    score: updatedItem ? updatedItem.score : 0,
    userVote: finalVote
  };
};

// Batch fetches votes for a specific user across a list of target IDs in a single query
const getUserVotesMap = (userId, targetType, targetIds) => {
  if (!userId || !data.votes || !targetIds || targetIds.length === 0) return {};
  const idSet = new Set(targetIds.map(id => id.toString()));
  const map = {};
  for (const v of data.votes) {
    if (v.user === userId && v.targetType === targetType && idSet.has(v.targetId)) {
      map[v.targetId] = v.value;
    }
  }
  return map;
};

module.exports = {
  getAll,
  findById,
  findOne,
  insert,
  update,
  inc,
  remove,
  castVote,
  getUserVotesMap,
  init,
  initAtlas,
  isAtlasConnected: () => isAtlasConnected
};
