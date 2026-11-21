const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const store = require('../db/store');

async function testAtlas() {
  console.log('--- MongoDB Atlas Connection Test ---');
  console.log('Target Cluster: cluster0.utbajgk.mongodb.net');
  console.log('Database Name:  linkedout');

  // Initialize store with Atlas connection
  store.init();
  await store.initAtlas();

  const isConnected = store.isAtlasConnected();
  console.log(`Connection Status: ${isConnected ? 'CONNECTED' : 'FAILED'}`);

  const db = mongoose.connection.db || (mongoose.connection.getClient && mongoose.connection.getClient().db());
  if (isConnected && db) {
    const ping = await db.admin().ping();
    console.log(`Atlas Ping (ok: 1): ${ping.ok === 1 ? 'SUCCESS' : 'FAILED'}`);

    const collections = await db.listCollections().toArray();
    console.log(`\nCollections in "${db.databaseName}":`);

    if (collections.length === 0) {
      console.log('  (No collections yet - run seed or start server to populate)');
    } else {
      for (const col of collections) {
        const count = await db.collection(col.name).countDocuments();
        console.log(`  - ${col.name}: ${count} document(s)`);
      }
    }
  }

  console.log('--------------------------------------');
  process.exit(isConnected ? 0 : 1);
}

testAtlas().catch((err) => {
  console.error('Atlas test error:', err.message);
  process.exit(1);
});
