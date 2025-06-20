/**
 * Simula resultados da API do Google para desenvolvimento e teste
 * @param {string} query - Termo de busca
 * @param {number} num - Número de resultados
 * @param {number} start - Índice inicial (1-based)
 * @returns {Array} Resultados simulados
 */
function simulateGoogleResults(query, num = 10, start = 1) {
  console.log(`🤖 Simulando resultados para: "${query}" (start: ${start}, num: ${num})`);
  
  // Gerar índice base para a página atual
  const baseIndex = (start - 1);
  
  // Lista de produtos simulados - pode ser expandida
  const templateProdutos = [
    {
      title: `Smartphone Moderno - ${query}`,
      link: 'https://www.exemplo.com.br/produto/smartphone',
      snippet: 'Smartphone com câmera de alta resolução, processador potente e bateria de longa duração. Perfeito para quem busca tecnologia de ponta.',
      image: 'https://picsum.photos/id/0/300/300',
      price: 'R$ 1.299,90'
    },
    {
      title: `Fone de Ouvido Bluetooth - ${query}`,
      link: 'https://www.exemplo.com.br/produto/fone',
      snippet: 'Fone de ouvido sem fio com cancelamento de ruído, design ergonômico e bateria de longa duração para uma experiência sonora imersiva.',
      image: 'https://picsum.photos/id/3/300/300',
      price: 'R$ 349,90'
    },
    {
      title: `Relógio Inteligente Esportivo - ${query}`,
      link: 'https://www.exemplo.com.br/produto/relogio',
      snippet: 'Relógio inteligente com monitoramento cardíaco, GPS integrado, resistência à água e diversas funções esportivas.',
      image: 'https://picsum.photos/id/26/300/300',
      price: 'R$ 499,90'
    },
    {
      title: `Livro Bestseller: Aventuras Fantásticas - ${query}`,
      link: 'https://www.exemplo.com.br/produto/livro',
      snippet: 'Um livro emocionante que vai te prender do início ao fim, com personagens cativantes e uma história surpreendente.',
      image: 'https://picsum.photos/id/24/300/300',
      price: 'R$ 59,90'
    },
    {
      title: `Kit Cozinha Gourmet - ${query}`,
      link: 'https://www.exemplo.com.br/produto/cozinha',
      snippet: 'Kit completo para transformar sua cozinha e preparar refeições incríveis. Inclui utensílios de alta qualidade e livro de receitas.',
      image: 'https://picsum.photos/id/30/300/300',
      price: 'R$ 229,90'
    },
    {
      title: `Perfume Luxuoso - ${query}`,
      link: 'https://www.exemplo.com.br/produto/perfume',
      snippet: 'Fragrância sofisticada com notas marcantes e duradouras, ideal para ocasiões especiais. Embalagem elegante perfeita para presente.',
      image: 'https://picsum.photos/id/54/300/300',
      price: 'R$ 189,90'
    },
    {
      title: `Mochila para Notebook - ${query}`,
      link: 'https://www.exemplo.com.br/produto/mochila',
      snippet: 'Mochila com compartimento acolchoado para notebook, design ergonômico, à prova d\'água e vários bolsos organizadores.',
      image: 'https://picsum.photos/id/7/300/300',
      price: 'R$ 149,90'
    },
    {
      title: `Cafeteira Programável - ${query}`,
      link: 'https://www.exemplo.com.br/produto/cafeteira',
      snippet: 'Cafeteira moderna com programação, filtro permanente e jarra térmica para manter seu café quente por mais tempo.',
      image: 'https://picsum.photos/id/11/300/300',
      price: 'R$ 279,90'
    },
    {
      title: `Jogo de Toalhas Premium - ${query}`,
      link: 'https://www.exemplo.com.br/produto/toalhas',
      snippet: 'Conjunto de toalhas macias e absorventes, com tecido de alta qualidade e durabilidade. Disponível em várias cores.',
      image: 'https://picsum.photos/id/40/300/300',
      price: 'R$ 99,90'
    },
    {
      title: `Luminária Decorativa LED - ${query}`,
      link: 'https://www.exemplo.com.br/produto/luminaria',
      snippet: 'Luminária moderna com LED de baixo consumo, controle de intensidade e design exclusivo para decorar qualquer ambiente.',
      image: 'https://picsum.photos/id/63/300/300',
      price: 'R$ 129,90'
    },
    {
      title: `Bicicleta Urbana - ${query}`,
      link: 'https://www.exemplo.com.br/produto/bicicleta',
      snippet: 'Bicicleta leve e resistente, ideal para deslocamentos urbanos. Conta com câmbio de 21 marchas e freios de disco.',
      image: 'https://picsum.photos/id/17/300/300',
      price: 'R$ 899,90'
    },
    {
      title: `Conjunto de Ferramentas - ${query}`,
      link: 'https://www.exemplo.com.br/produto/ferramentas',
      snippet: 'Kit completo com 100 peças incluindo chaves, alicates e bits. Perfeito para pequenos reparos domésticos.',
      image: 'https://picsum.photos/id/36/300/300',
      price: 'R$ 189,90'
    },
    {
      title: `Câmera Instantânea - ${query}`,
      link: 'https://www.exemplo.com.br/produto/camera',
      snippet: 'Câmera que imprime fotos na hora, com flash automático e modos criativos. Crie memórias físicas instantaneamente.',
      image: 'https://picsum.photos/id/250/300/300',
      price: 'R$ 399,90'
    },
    {
      title: `Churrasqueira Portátil - ${query}`,
      link: 'https://www.exemplo.com.br/produto/churrasqueira',
      snippet: 'Churrasqueira compacta ideal para uso em varandas, acampamentos e pequenos espaços. Fácil de transportar.',
      image: 'https://picsum.photos/id/42/300/300',
      price: 'R$ 159,90'
    },
    {
      title: `Faqueiro Inox 24 peças - ${query}`,
      link: 'https://www.exemplo.com.br/produto/faqueiro',
      snippet: 'Conjunto de talheres em aço inox de alta qualidade, com acabamento espelhado e design atemporal.',
      image: 'https://picsum.photos/id/10/300/300',
      price: 'R$ 149,90'
    },
    {
      title: `Caixa de Som Bluetooth - ${query}`,
      link: 'https://www.exemplo.com.br/produto/caixa-som',
      snippet: 'Caixa de som portátil à prova d\'água com conectividade Bluetooth e bateria de longa duração.',
      image: 'https://picsum.photos/id/3/300/300',
      price: 'R$ 249,90'
    },
    {
      title: `Jogo de Panelas Antiaderentes - ${query}`,
      link: 'https://www.exemplo.com.br/produto/panelas',
      snippet: 'Conjunto de panelas com revestimento antiaderente, cabos ergonômicos e compatível com todos os tipos de fogão.',
      image: 'https://picsum.photos/id/20/300/300',
      price: 'R$ 299,90'
    },
    {
      title: `Mala de Viagem Grande - ${query}`,
      link: 'https://www.exemplo.com.br/produto/mala',
      snippet: 'Mala espaçosa com rodas giratórias, puxador telescópico e interior bem organizado. Resistente e leve.',
      image: 'https://picsum.photos/id/88/300/300',
      price: 'R$ 349,90'
    },
    {
      title: `Cadeira Ergonômica para Home Office - ${query}`,
      link: 'https://www.exemplo.com.br/produto/cadeira',
      snippet: 'Cadeira com ajustes de altura, encosto reclinável e apoio lombar para garantir conforto durante longas horas de trabalho.',
      image: 'https://picsum.photos/id/96/300/300',
      price: 'R$ 599,90'
    },
    {
      title: `Drone com Câmera HD - ${query}`,
      link: 'https://www.exemplo.com.br/produto/drone',
      snippet: 'Drone compacto com câmera de alta definição, estabilização de imagem e até 25 minutos de voo com uma carga.',
      image: 'https://picsum.photos/id/65/300/300',
      price: 'R$ 799,90'
    }
  ];
  
  // Criar variações adicionais para paginação
  const resultadosExpandidos = [];
  
  // Calcular quantas cópias são necessárias para ter pelo menos 100 itens
  const copiesNeeded = Math.ceil(100 / templateProdutos.length);
  
  // Criar cópias suficientes
  for (let copy = 0; copy < copiesNeeded; copy++) {
    templateProdutos.forEach((produto, i) => {
      // Criar uma cópia com algumas variações para simular mais resultados
      const index = copy * templateProdutos.length + i;
      const variacao = (copy + 1) * 10; // Variação de preço entre cópias
      
      resultadosExpandidos.push({
        ...produto,
        title: `${produto.title} - Item ${index + 1}`,
        price: `R$ ${(parseFloat(produto.price.replace('R$ ', '').replace('.', '').replace(',', '.')) + variacao).toFixed(2).replace('.', ',')}`,
        image: `https://picsum.photos/id/${(index % 100) + 1}/300/300` // Variar as imagens
      });
    });
  }
  
  // Selecionar o subconjunto de resultados para a página atual
  return resultadosExpandidos.slice(baseIndex, baseIndex + num);
}

module.exports = simulateGoogleResults;
