// Controller para autenticação OAuth Mercado Livre
const axios = require('axios');

const CLIENT_ID = process.env.MERCADO_LIVRE_CLIENT_ID;
const CLIENT_SECRET = process.env.MERCADO_LIVRE_CLIENT_SECRET;
const REDIRECT_URI = process.env.MERCADO_LIVRE_REDIRECT_URI;

// 1. Redireciona usuário para login/autorização Mercado Livre
exports.login = (req, res) => {
  const url = `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  res.redirect(url);
};

// 2. Callback: troca code por access_token
exports.callback = async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ erro: 'Código de autorização ausente.' });
  try {
    const { data } = await axios.post('https://api.mercadolibre.com/oauth/token', null, {
      params: {
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    // Para demo: retorna o token (em produção, armazene com segurança)
    res.json({ access_token: data.access_token, user_id: data.user_id, expires_in: data.expires_in });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao obter token do Mercado Livre', detalhes: err.response?.data || err.message });
  }
};
