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
    // Lista de produtos simulados com URLs reais de marketplaces
  const templateProdutos = [
    {
      title: `Smartphone Galaxy S22 Ultra - ${query}`,
      link: 'https://www.amazon.com.br/Smartphone-Samsung-Galaxy-Ultra-Preto/dp/B09TPT41TK',
      snippet: 'Smartphone com câmera de alta resolução, processador potente e bateria de longa duração. Perfeito para quem busca tecnologia de ponta.',
      image: null, // Será preenchido dinamicamente
      price: 'R$ 4.499,90',
      marketplace: 'Amazon'
    },
    {
      title: `Fone de Ouvido JBL Tune 510BT - ${query}`,
      link: 'https://www.magazineluiza.com.br/fone-de-ouvido-bluetooth-jbl-tune-510bt-preto-jblt510btblk/p/228372000/ea/fobw/',
      snippet: 'Fone de ouvido sem fio com cancelamento de ruído, design ergonômico e bateria de longa duração para uma experiência sonora imersiva.',
      image: null,
      price: 'R$ 229,90',
      marketplace: 'Magazine Luiza'
    },
    {
      title: `Smartwatch Amazfit GTR 2 - ${query}`,
      link: 'https://www.americanas.com.br/produto/3647888532/relogio-smartwatch-amazfit-gtr-2-classic-edition-a1952-preto-com-nfc',
      snippet: 'Relógio inteligente com monitoramento cardíaco, GPS integrado, resistência à água e diversas funções esportivas.',
      image: null,
      price: 'R$ 699,90',
      marketplace: 'Americanas'
    },
    {
      title: `Livro: Os Sete Maridos de Evelyn Hugo - ${query}`,
      link: 'https://www.submarino.com.br/produto/4899866196/livro-os-sete-maridos-de-evelyn-hugo',
      snippet: 'Um livro emocionante que vai te prender do início ao fim, com personagens cativantes e uma história surpreendente.',
      image: null,
      price: 'R$ 39,90',
      marketplace: 'Submarino'
    },
    {
      title: `Kit de Utensílios de Cozinha Tramontina - ${query}`,
      link: 'https://www.casasbahia.com.br/conjunto-de-utensilios-de-cozinha-tramontina-inox-8-pecas-1501781642/p/1501781642',
      snippet: 'Kit completo para transformar sua cozinha e preparar refeições incríveis. Inclui utensílios de alta qualidade e livro de receitas.',
      image: null,
      price: 'R$ 229,90',
      marketplace: 'Casas Bahia'
    },
    {
      title: `Perfume Chanel N°5 - ${query}`,
      link: 'https://www.sephora.com.br/chanel-n-5-eau-de-parfum-2000063399/p',
      snippet: 'Fragrância sofisticada com notas marcantes e duradouras, ideal para ocasiões especiais. Embalagem elegante perfeita para presente.',
      image: null,
      price: 'R$ 789,90',
      marketplace: 'Sephora'
    },
    {
      title: `Mochila Dell Professional 15" - ${query}`,
      link: 'https://www.dell.com/pt-br/shop/mochila-dell-professional-de-15/apd/460-bcfh/acess%C3%B3rios-para-laptop',
      snippet: 'Mochila com compartimento acolchoado para notebook, design ergonômico, à prova d\'água e vários bolsos organizadores.',
      image: null,
      price: 'R$ 249,90',
      marketplace: 'Dell'
    },
    {
      title: `Cafeteira Philco Programável - ${query}`,
      link: 'https://www.pontofrio.com.br/cafeteira-eletrica-philco-pcf41-preto-inox-110v-1501256294/p/1501256294',
      snippet: 'Cafeteira moderna com programação, filtro permanente e jarra térmica para manter seu café quente por mais tempo.',
      image: null,
      price: 'R$ 279,90',
      marketplace: 'Ponto Frio'
    },
    {
      title: `Jogo de Toalhas Buddemeyer - ${query}`,
      link: 'https://www.riachuelo.com.br/jogo-de-banho-buddemeyer-4-pecas-dual-face-100-algodao-cinza-13127534_sku',
      snippet: 'Conjunto de toalhas macias e absorventes, com tecido de alta qualidade e durabilidade. Disponível em várias cores.',
      image: null,
      price: 'R$ 99,90',
      marketplace: 'Riachuelo'
    },
    {
      title: `Luminária de Mesa Inteligente Xiaomi - ${query}`,
      link: 'https://www.kabum.com.br/produto/233695/luminaria-de-mesa-xiaomi-mi-led-desk-lamp-1s-regulagem-de-temperatura-e-brilho-mijia-desk-lamp',
      snippet: 'Luminária moderna com LED de baixo consumo, controle de intensidade e design exclusivo para decorar qualquer ambiente.',
      image: null,
      price: 'R$ 229,90',
      marketplace: 'Kabum'
    },
    {
      title: `Bicicleta Caloi Explorer Sport - ${query}`,
      link: 'https://www.centauro.com.br/bicicleta-mtb-caloi-explorer-sport-aro-29-21-marchas-freio-v-brake-942083.html',
      snippet: 'Bicicleta leve e resistente, ideal para deslocamentos urbanos. Conta com câmbio de 21 marchas e freios de disco.',
      image: null,
      price: 'R$ 1.499,90',
      marketplace: 'Centauro'
    },
    {
      title: `Kit Ferramentas Tramontina 100 Peças - ${query}`,
      link: 'https://www.leroy.com.br/jogo-de-ferramentas-43409532/p',
      snippet: 'Kit completo com 100 peças incluindo chaves, alicates e bits. Perfeito para pequenos reparos domésticos.',
      image: null,
      price: 'R$ 189,90',
      marketplace: 'Leroy Merlin'
    },
    {
      title: `Câmera Instantânea Fujifilm Instax Mini 11 - ${query}`,
      link: 'https://www.fastshop.com.br/web/p/d/FIMINI11AZ_PRD/camera-instantanea-fujifilm-instax-mini-11-azul-celestial-instaxmini11-azul',
      snippet: 'Câmera que imprime fotos na hora, com flash automático e modos criativos. Crie memórias físicas instantaneamente.',
      image: null,
      price: 'R$ 399,90',
      marketplace: 'Fast Shop'
    },
    {
      title: `Churrasqueira Portátil Weber - ${query}`,
      link: 'https://www.madeiramadeira.com.br/churrasqueira-a-carvao-weber-portatil-go-anywhere-preta-weber-581713.html',
      snippet: 'Churrasqueira compacta ideal para uso em varandas, acampamentos e pequenos espaços. Fácil de transportar.',
      image: null,
      price: 'R$ 559,90',
      marketplace: 'Madeira Madeira'
    },
    {
      title: `Faqueiro Tramontina 24 peças - ${query}`,
      link: 'https://www.extra.com.br/faqueiro-tramontina-laguna-inox-24-pecas-23799004/p/23799004',
      snippet: 'Conjunto de talheres em aço inox de alta qualidade, com acabamento espelhado e design atemporal.',
      image: null,
      price: 'R$ 149,90',
      marketplace: 'Extra'
    },
    {
      title: `Caixa de Som JBL Flip 6 - ${query}`,
      link: 'https://www.shoptime.com.br/produto/5947259830/caixa-de-som-bluetooth-jbl-flip-6-20w-a-prova-d-agua-preto-jblflip6blk',
      snippet: 'Caixa de som portátil à prova d\'água com conectividade Bluetooth e bateria de longa duração.',
      image: null,
      price: 'R$ 649,90',
      marketplace: 'Shoptime'
    },
    {
      title: `Jogo de Panelas Tramontina Antiaderentes - ${query}`,
      link: 'https://www.havan.com.br/conjunto-de-panelas-tramontina-versalhes-7-pecas-aluminio-antiaderente-prata/p',
      snippet: 'Conjunto de panelas com revestimento antiaderente, cabos ergonômicos e compatível com todos os tipos de fogão.',
      image: null,
      price: 'R$ 369,90',
      marketplace: 'Havan'
    },
    {
      title: `Mala de Viagem Delsey Paris - ${query}`,
      link: 'https://www.bagaggio.com.br/mala-de-bordo-delsey-st-tropez-55cm/p',
      snippet: 'Mala espaçosa com rodas giratórias, puxador telescópico e interior bem organizado. Resistente e leve.',
      image: null,
      price: 'R$ 699,90',
      marketplace: 'Bagaggio'
    },
    {
      title: `Cadeira Ergonômica Flexform - ${query}`,
      link: 'https://www.flexform.com.br/cadeiras/cadeira-de-escritorio-presidente-my-chair-all-black-base-nylon-piramidal-e-rodizios-65mm/24800',
      snippet: 'Cadeira com ajustes de altura, encosto reclinável e apoio lombar para garantir conforto durante longas horas de trabalho.',
      image: null,
      price: 'R$ 1.599,90',
      marketplace: 'Flexform'
    },
    {
      title: `Drone DJI Mini 3 Pro - ${query}`,
      link: 'https://store.dji.com/br/product/dji-mini-3-pro',
      snippet: 'Drone compacto com câmera de alta definição, estabilização de imagem e até 25 minutos de voo com uma carga.',
      image: null,
      price: 'R$ 5.799,90',
      marketplace: 'DJI Store'
    }
  ];
  
  // Pré-processar produtos para adicionar imagens específicas de marketplace
  templateProdutos.forEach(produto => {
    // Usar a função de detecção de marketplace para obter o nome do marketplace
    const domain = extractDomainFromUrl(produto.link);
    produto.marketplace = detectMarketplace(produto.link);
    
    // Obter imagem específica do marketplace usando a URL
    const marketplaceImage = getMarketplaceImage(produto.link, domain);
    if (marketplaceImage) {
      produto.image = marketplaceImage;
    } else {
      // Fallback para imagem genérica com nome do marketplace
      produto.image = `https://via.placeholder.com/300x300?text=${encodeURIComponent(produto.marketplace)}`;
    }
  });
  
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
      
      // Gerar um preço com formato brasileiro
      const precoBase = parseFloat(produto.price.replace('R$ ', '').replace('.', '').replace(',', '.'));
      const precoNovo = precoBase + variacao;
      const precoFormatado = `R$ ${precoNovo.toFixed(2).replace('.', ',')}`;
      
      // Criar URL única para cada variação (adicionando um parâmetro de consulta)
      // Isto mantém o link para o produto real mas torna cada URL única
      const urlOriginal = new URL(produto.link);
      if (copy > 0) {
        urlOriginal.searchParams.append('variant', `${copy}-${i}`);
      }
      
      // Gerar imagens realistas baseadas no marketplace
      let imagem = produto.image;
      
      // Se não tiver uma imagem definida, tentar obter uma específica para o marketplace
      if (!imagem) {
        const domain = urlOriginal.hostname;
        const marketplaceImage = getMarketplaceImage(urlOriginal.toString(), domain);
        if (marketplaceImage) {
          imagem = marketplaceImage;
        } else {
          // Fallback para imagem genérica com nome do marketplace
          imagem = `https://via.placeholder.com/300x300?text=${encodeURIComponent(produto.marketplace)}`;
        }
      }
      
      resultadosExpandidos.push({
        ...produto,
        title: `${produto.title} - ${produto.marketplace}`,
        price: precoFormatado,
        image: imagem,
        link: urlOriginal.toString(), // Usar URL com variação
        marketplace: produto.marketplace || 'Loja Online' // Garantir que marketplace seja passado
      });
    });
  }
  
  // Selecionar o subconjunto de resultados para a página atual
  return resultadosExpandidos.slice(baseIndex, baseIndex + num);
}

// Importar funções necessárias do arquivo googleSearchService.js
// Estas funções são necessárias para a simulação mais realista
const { extractDomainFromUrl, getMarketplaceImage, detectMarketplace } = require('./googleSearchService');

module.exports = simulateGoogleResults;
