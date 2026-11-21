// Factory function creating a plain Floor community object
const makeFloor = (data = {}) => {
  return {
    name: data.name ? data.name.trim() : '',
    slug: data.slug ? data.slug.trim().toLowerCase() : '',
    description: data.description ? data.description.trim() : '',
    mode: data.mode === 'innie' ? 'innie' : 'outie',
    members: data.members || [],
    createdBy: data.createdBy || null,
    createdAt: data.createdAt || new Date().toISOString()
  };
};

module.exports = {
  makeFloor
};
