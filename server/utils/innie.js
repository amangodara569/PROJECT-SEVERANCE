const User = require('../models/User');

// Generates a random 4-digit number between 1000 and 9999
const getRandomDigits = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

// Generates a unique anonymous handle formatted as "Innie-XXXX"
// Checks the database to ensure no other user has the same handle
const generateUniqueInnieHandle = async () => {
  let isUnique = false;
  let handle = '';

  while (!isUnique) {
    handle = `Innie-${getRandomDigits()}`;
    // Check if the handle already exists in the database
    const existing = await User.findOne({ innieHandle: handle });
    if (!existing) {
      isUnique = true;
    }
  }

  return handle;
};

module.exports = {
  generateUniqueInnieHandle
};

