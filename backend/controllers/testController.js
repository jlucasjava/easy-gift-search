// Test file
exports.test = function() {
  return 'test';
};

exports.getRecommendation = function(req, res) {
  res.json({ message: 'test' });
};
