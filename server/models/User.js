// Factory function creating a plain User object with default fields
const makeUser = (data = {}) => {
  return {
    username: data.username ? data.username.trim() : '',
    email: data.email ? data.email.trim().toLowerCase() : '',
    passwordHash: data.passwordHash || '',
    headline: data.headline ? data.headline.trim() : '',
    bio: data.bio ? data.bio.trim() : '',
    status: data.status || 'Employed',
    innieHandle: data.innieHandle || '',
    joinedFloors: data.joinedFloors || [],
    isAdmin: Boolean(data.isAdmin),
    createdAt: data.createdAt || new Date().toISOString()
  };
};

module.exports = {
  makeUser
};
