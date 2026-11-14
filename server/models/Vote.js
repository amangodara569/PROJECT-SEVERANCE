// Factory function creating a plain Vote object
const makeVote = (data = {}) => {
  return {
    user: data.user,
    targetType: data.targetType || 'post', // 'post' or 'comment'
    targetId: data.targetId,
    value: Number(data.value) || 1, // 1 for upvote, -1 for downvote
    createdAt: data.createdAt || new Date().toISOString()
  };
};

module.exports = {
  makeVote
};
