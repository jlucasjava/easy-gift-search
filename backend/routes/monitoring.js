// Rota para monitoramento dos motores de busca
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const monitoringService = require('../services/monitoringService');

// Rota para obter o relatório de métricas em formato JSON
router.get('/metrics', (req, res) => {
  try {
    const relatorio = monitoringService.gerarRelatorio();
    res.json(relatorio);
  } catch (error) {
    console.error('Erro ao gerar relatório de métricas:', error);
    res.status(500).json({ erro: 'Erro ao gerar relatório de métricas' });
  }
});

// Rota para obter a página HTML de monitoramento
router.get('/dashboard', (req, res) => {
  try {
    const arquivoHTML = monitoringService.gerarPaginaMonitoramento();
    res.sendFile(arquivoHTML);
  } catch (error) {
    console.error('Erro ao gerar página de monitoramento:', error);
    res.status(500).send('Erro ao gerar página de monitoramento');
  }
});

// Rota para obter os logs recentes
router.get('/logs', (req, res) => {
  try {
    const arquivoLog = path.join(__dirname, '..', 'logs', 'busca-detalhado.log');
    
    if (!fs.existsSync(arquivoLog)) {
      return res.status(404).json({ erro: 'Arquivo de log não encontrado' });
    }
    
    // Ler as últimas linhas do arquivo de log
    const linhas = req.query.lines ? parseInt(req.query.lines) : 100;
    const conteudo = fs.readFileSync(arquivoLog, 'utf8');
    const logs = conteudo
      .split('\n')
      .filter(line => line.trim() !== '')
      .slice(-linhas)
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (e) {
          return { raw: line };
        }
      });
    
    res.json(logs);
  } catch (error) {
    console.error('Erro ao obter logs:', error);
    res.status(500).json({ erro: 'Erro ao obter logs' });
  }
});

module.exports = router;
