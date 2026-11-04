const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Path to JSON database file
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

// Memory store object holding all collections
let data = {
  users: [],
  floors: [],
  posts: [],
  comments: [],
  layoffs: [],
  jobs: [],
  reports: []
};

// Writes the in-memory store to db.json synchronously
const save = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
};

// Loads db.json into memory or triggers seed initialization
const init = () => {
  if (fs.existsSync(DB_PATH)) {
    try {
      const content = fs.readFileSync(DB_PATH, 'utf8');
      data = JSON.parse(content);
      return;
    } catch (e) {
      console.error('Failed to parse db.json, re-initializing:', e.message);
    }
  }

  // If db.json does not exist, run seed script if available
  const seedScriptPath = path.join(__dirname, '..', 'scripts', 'seed.js');
  if (fs.existsSync(seedScriptPath)) {
    try {
      const { runSeed } = require('../scripts/seed');
      runSeed();
      if (fs.existsSync(DB_PATH)) {
        data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
        return;
      }
    } catch (err) {
      console.error('Seed run on init failed:', err.message);
    }
  }

  save();
};

init();

// Returns all items in a collection
const getAll = (name) => {
  return [...(data[name] || [])];
};

// Finds a single item by its unique ID
const findById = (name, id) => {
  if (!id) return null;
  const targetId = id.toString();
  return (data[name] || []).find((item) => (item._id && item._id.toString() === targetId) || (item.id && item.id.toString() === targetId)) || null;
};

// Finds the first item matching the provided filter function
const findOne = (name, testFunction) => {
  return (data[name] || []).find(testFunction) || null;
};

// Inserts a new item with generated UUID and timestamp
const insert = (name, item) => {
  if (!data[name]) data[name] = [];
  const newItem = {
    _id: item._id || crypto.randomUUID(),
    createdAt: item.createdAt || new Date().toISOString(),
    ...item
  };
  data[name].push(newItem);
  save();
  return newItem;
};

// Updates an existing item by ID
const update = (name, id, changes) => {
  const item = findById(name, id);
  if (!item) return null;
  Object.assign(item, changes);
  save();
  return item;
};

// Removes an item from a collection by ID
const remove = (name, id) => {
  if (!data[name]) return false;
  const targetId = id.toString();
  const initialLength = data[name].length;
  data[name] = data[name].filter((item) => item._id !== targetId && item.id !== targetId);
  if (data[name].length !== initialLength) {
    save();
    return true;
  }
  return false;
};

module.exports = {
  getAll,
  findById,
  findOne,
  insert,
  update,
  remove,
  init
};

