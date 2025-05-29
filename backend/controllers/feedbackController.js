// Controller de feedback (mock, sem persistência)
exports.submitFeedback = (req, res) => {
  res.json({ sucesso: true, mensagem: 'Feedback recebido! Obrigado.' });
};
