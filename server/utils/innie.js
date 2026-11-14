const store = require('../db/store');

const getRandomDigits = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

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
