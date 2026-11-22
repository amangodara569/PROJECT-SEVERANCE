// Factory function creating a plain Comment object
const makeComment = (data = {}) => {
  return {
    post: data.post || null,
    parent: data.parent || null,
    replyToUser: data.replyToUser || null,
    body: data.body ? data.body.trim() : '',
    author: data.author || null,
    isInnie: Boolean(data.isInnie),
    innieHandle: data.innieHandle || '',
    upvotes: data.upvotes || [],
    downvotes: data.downvotes || [],
    reportCount: data.reportCount || 0,
    hidden: Boolean(data.hidden),
    createdAt: data.createdAt || new Date().toISOString()
  };
};

module.exports = {
  makeComment
};
