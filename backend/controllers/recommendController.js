const axios = require('axios');

// Integração real com OpenAI para recomendação inteligente
exports.getRecommendation = async (req, res) => {
  const { idade, genero, interesses } = req.body;
  try {
    const prompt = `Sugira um presente para uma pessoa de idade ${idade}, gênero ${genero}${interesses ? `, com interesses em ${interesses}` : ''}. Responda em uma frase curta e retorne também uma lista de até 3 ideias de produtos (nome, preço estimado, imagem ilustrativa e link de exemplo). Responda em JSON no formato: { sugestao: string, produtosRelacionados: [{ nome, preco, imagem, url }] }`;
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Você é um assistente de presentes.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 400,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    // Tenta extrair JSON da resposta do modelo
    const match = response.data.choices[0].message.content.match(/\{[\s\S]*\}/);
    if (match) {
      const result = JSON.parse(match[0]);
      return res.json(result);
    } else {
      return res.status(500).json({ erro: 'Resposta inesperada da OpenAI.' });
    }
  } catch (err) {
    console.error('Erro OpenAI:', err.response?.data || err.message);
    res.status(500).json({ erro: 'Erro ao obter sugestão da OpenAI.' });
  }
};
