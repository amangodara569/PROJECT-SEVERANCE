const store = require('../db/store');

// Generates a random 4-digit number between 1000 and 9999
const getRandomDigits = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

// Generates a unique pseudonymous handle formatted as "Innie-XXXX"
const generateUniqueInnieHandle = () => {
  let isUnique = false;
  let handle = '';

  while (!isUnique) {
    handle = `Innie-${getRandomDigits()}`;
    const existing = store.findOne('users', (u) => u.innieHandle === handle);
    if (!existing) {
      isUnique = true;
    }
  }

  return handle;
};

module.exports = {
  generateUniqueInnieHandle
};
