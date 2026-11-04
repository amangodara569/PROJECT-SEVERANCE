// Factory function creating a plain Report moderation object
const makeReport = (data = {}) => {
  return {
    targetType: data.targetType || 'post',
    targetId: data.targetId || null,
    reporter: data.reporter || null,
    reason: data.reason ? data.reason.trim() : 'Community guidelines violation',
    createdAt: data.createdAt || new Date().toISOString()
  };
};

module.exports = {
  makeReport
};
