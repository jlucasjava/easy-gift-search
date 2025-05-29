// Teste simples do endpoint de recomendação com OpenAI
const axios = require('axios');

(async () => {
  try {
    const res = await axios.post('http://localhost:3000/api/recommend', {
      idade: 25,
      genero: 'Feminino',
      interesses: 'tecnologia, livros'
    });
    console.log('Resposta da API:', res.data);
  } catch (err) {
    if (err.response) {
      console.error('Erro na resposta:', err.response.data);
    } else {
      console.error('Erro:', err.message);
    }
  }
})();
