// Factory function creating a plain Post object
const makePost = (data = {}) => {
  return {
    title: data.title ? data.title.trim() : '',
    body: data.body ? data.body.trim() : '',
    type: data.type || 'vent',
    floor: data.floor || null,
    author: data.author || null,
    isInnie: Boolean(data.isInnie),
    innieHandle: data.innieHandle || '',
    upvotes: data.upvotes || [],
    downvotes: data.downvotes || [],
    commentCount: data.commentCount || 0,
    reportCount: data.reportCount || 0,
    hidden: Boolean(data.hidden),
    createdAt: data.createdAt || new Date().toISOString()
  };
};

module.exports = {
  makePost
};
