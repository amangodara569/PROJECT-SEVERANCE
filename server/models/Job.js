// Factory function creating a plain Job listing object
const makeJob = (data = {}) => {
  return {
    title: data.title ? data.title.trim() : '',
    company: data.company ? data.company.trim() : '',
    location: data.location ? data.location.trim() : 'Remote',
    link: data.link ? data.link.trim() : '',
    postedBy: data.postedBy || null,
    createdAt: data.createdAt || new Date().toISOString()
  };
};

module.exports = {
  makeJob
};
