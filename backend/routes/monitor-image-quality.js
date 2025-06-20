/**
 * Monitor de Qualidade de Imagens
 * 
 * Este script implementa um endpoint adicional para monitorar a qualidade
 * das imagens nos resultados da API Google Custom Search.
 * Ele pode ser importado pelo servidor principal para adicionar esta funcionalidade.
 */

const express = require('express');
const router = express.Router();
const { searchGoogle, getBestImage, extractImageFromLink, extractImageFromSnippet } = require('../services/googleSearchService');

// Armazenar estatísticas em memória
const estatisticas = {
  totalRequests: 0,
  totalResults: 0,
  totalWithImages: 0,
  totalWithoutImages: 0,
  imageSourceStats: {
    pagemap: 0,
    link: 0,
    snippet: 0,
    fallback: 0
  },
  lastQueries: []
};

/**
 * Endpoint para obter estatísticas de qualidade de imagens
 */
router.get('/image-quality', async (req, res) => {
  try {
    // Calcular taxas
    const taxaSucesso = estatisticas.totalResults > 0 
      ? (estatisticas.totalWithImages / estatisticas.totalResults * 100).toFixed(2) 
      : 0;
      
    // Preparar resposta
    const response = {
      ...estatisticas,
      imageSucessRate: `${taxaSucesso}%`,
      imageFailRate: `${(100 - taxaSucesso).toFixed(2)}%`
    };
    
    res.json(response);
  } catch (error) {
    console.error('Erro ao gerar estatísticas de imagens:', error);
    res.status(500).json({ error: 'Erro ao gerar estatísticas' });
  }
});

/**
 * Endpoint para testar a extração de imagens com uma query específica
 */
router.get('/test-image-extraction', async (req, res) => {
  try {
    const { query = 'presente' } = req.query;
    
    // Buscar resultados
    const resultados = await searchGoogle(query, 10);
    
    // Analisar imagens em cada resultado
    const análise = resultados.map(item => {
      // Testar extração de imagem direto do item
      const originalItem = item._originalItem || {};
      
      // Testar diferentes métodos
      const imagemPagmap = getBestImage(originalItem);
      const imagemLink = extractImageFromLink(item.link);
      const imagemSnippet = extractImageFromSnippet(item.snippet);
      
      // Determinar origem da imagem
      let origemImagem = 'nenhuma';
      if (imagemPagmap) origemImagem = 'pagemap';
      else if (imagemLink) origemImagem = 'link';
      else if (imagemSnippet) origemImagem = 'snippet';
      
      // Atualizar estatísticas
      estatisticas.totalResults++;
      if (item.image) {
        estatisticas.totalWithImages++;
        if (origemImagem === 'pagemap') estatisticas.imageSourceStats.pagemap++;
        else if (origemImagem === 'link') estatisticas.imageSourceStats.link++;
        else if (origemImagem === 'snippet') estatisticas.imageSourceStats.snippet++;
      } else {
        estatisticas.totalWithoutImages++;
        estatisticas.imageSourceStats.fallback++;
      }
      
      // Guardar histórico das últimas 10 consultas
      if (estatisticas.lastQueries.length >= 10) {
        estatisticas.lastQueries.shift();
      }
      
      if (!estatisticas.lastQueries.some(q => q.query === query)) {
        estatisticas.lastQueries.push({
          query,
          timestamp: new Date().toISOString(),
          sucessRate: (estatisticas.totalWithImages / estatisticas.totalResults * 100).toFixed(2) + '%'
        });
      }
      
      estatisticas.totalRequests++;
      
      return {
        title: item.title,
        link: item.link,
        imageUsed: item.image,
        imageAlternatives: {
          pagemap: imagemPagmap,
          link: imagemLink, 
          snippet: imagemSnippet
        },
        imageSource: origemImagem,
        hasImage: !!item.image
      };
    });
    
    // Calcular estatísticas desta consulta
    const comImagem = análise.filter(a => a.hasImage).length;
    const semImagem = análise.length - comImagem;
    const taxaSucesso = (comImagem / análise.length * 100).toFixed(2);
    
    res.json({
      query,
      resultCount: análise.length,
      withImage: comImagem,
      withoutImage: semImagem,
      successRate: `${taxaSucesso}%`,
      resultDetails: análise,
      overallStats: {
        totalProcessed: estatisticas.totalResults,
        overallSuccessRate: `${(estatisticas.totalWithImages / estatisticas.totalResults * 100).toFixed(2)}%`
      }
    });
    
  } catch (error) {
    console.error('Erro ao testar extração de imagens:', error);
    res.status(500).json({ error: 'Erro ao testar extração de imagens' });
  }
});

module.exports = router;
