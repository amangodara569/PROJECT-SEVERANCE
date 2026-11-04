// Factory function creating a plain Layoff report object
const makeLayoff = (data = {}) => {
  return {
    company: data.company ? data.company.trim() : '',
    date: data.date || new Date().toISOString(),
    peopleAffected: Number(data.peopleAffected) || 0,
    sourceUrl: data.sourceUrl ? data.sourceUrl.trim() : '',
    note: data.note ? data.note.trim() : '',
    addedBy: data.addedBy || null,
    confirmedBy: data.confirmedBy || [],
    createdAt: data.createdAt || new Date().toISOString()
  };
};

module.exports = {
  makeLayoff
};
