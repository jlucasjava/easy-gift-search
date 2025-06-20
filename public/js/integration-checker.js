// Script para verificar a exibição de resultados da Google Custom Search API
// na interface do usuário

document.addEventListener('DOMContentLoaded', function() {
  const testButton = document.createElement('button');
  testButton.textContent = 'Verificar Integração';
  testButton.style.position = 'fixed';
  testButton.style.bottom = '20px';
  testButton.style.right = '20px';
  testButton.style.zIndex = '9999';
  testButton.style.background = '#4e54c8';
  testButton.style.color = 'white';
  testButton.style.border = 'none';
  testButton.style.borderRadius = '4px';
  testButton.style.padding = '10px 15px';
  testButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  testButton.style.cursor = 'pointer';
  
  testButton.addEventListener('click', function() {
    verificarIntegracao();
  });
  
  document.body.appendChild(testButton);
});

function verificarIntegracao() {
  // Criar elemento de log
  let logDiv = document.getElementById('integration-log');
  if (!logDiv) {
    logDiv = document.createElement('div');
    logDiv.id = 'integration-log';
    logDiv.style.position = 'fixed';
    logDiv.style.top = '50%';
    logDiv.style.left = '50%';
    logDiv.style.transform = 'translate(-50%, -50%)';
    logDiv.style.background = 'white';
    logDiv.style.padding = '20px';
    logDiv.style.borderRadius = '8px';
    logDiv.style.boxShadow = '0 0 20px rgba(0,0,0,0.3)';
    logDiv.style.zIndex = '10000';
    logDiv.style.maxWidth = '600px';
    logDiv.style.maxHeight = '80vh';
    logDiv.style.overflow = 'auto';
    logDiv.style.fontSize = '14px';
    logDiv.style.lineHeight = '1.5';
    
    // Botão para fechar o log
    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.background = '#f44336';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '50%';
    closeButton.style.width = '24px';
    closeButton.style.height = '24px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.display = 'flex';
    closeButton.style.alignItems = 'center';
    closeButton.style.justifyContent = 'center';
    closeButton.style.fontWeight = 'bold';
    
    closeButton.addEventListener('click', function() {
      document.body.removeChild(logDiv);
    });
    
    logDiv.appendChild(closeButton);
    document.body.appendChild(logDiv);
  }
  
  // Limpar log anterior
  logDiv.innerHTML = '<h3>Verificação de Integração</h3>';
  const closeButton = document.createElement('button');
  closeButton.textContent = 'X';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '10px';
  closeButton.style.right = '10px';
  closeButton.style.background = '#f44336';
  closeButton.style.color = 'white';
  closeButton.style.border = 'none';
  closeButton.style.borderRadius = '50%';
  closeButton.style.width = '24px';
  closeButton.style.height = '24px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.display = 'flex';
  closeButton.style.alignItems = 'center';
  closeButton.style.justifyContent = 'center';
  closeButton.style.fontWeight = 'bold';
  
  closeButton.addEventListener('click', function() {
    document.body.removeChild(logDiv);
  });
  
  logDiv.appendChild(closeButton);
  
  // Função para adicionar mensagem ao log
  function log(message, isError = false) {
    const p = document.createElement('p');
    p.innerHTML = message;
    p.style.margin = '5px 0';
    p.style.padding = '5px';
    p.style.borderRadius = '3px';
    
    if (isError) {
      p.style.backgroundColor = '#ffebee';
      p.style.color = '#c62828';
    } else {
      p.style.backgroundColor = '#e8f5e9';
      p.style.color = '#2e7d32';
    }
    
    logDiv.appendChild(p);
  }
  
  // Início da verificação
  log('🔍 Iniciando verificação de integração...');
  
  // 1. Verificar se o grid existe
  const grid = document.getElementById('grid');
  if (!grid) {
    log('❌ Elemento #grid não encontrado', true);
    return;
  }
  log('✅ Elemento #grid encontrado');
  
  // 2. Verificar se há produtos no grid
  const cards = grid.querySelectorAll('.card');
  if (cards.length === 0) {
    log('❌ Nenhum produto encontrado no grid', true);
    log('🔍 Execute uma busca para verificar a exibição de resultados', true);
    return;
  }
  log(`✅ ${cards.length} produtos encontrados no grid`);
  
  // 3. Verificar se os produtos estão corretamente formatados
  let badgeCount = 0;
  let imageIssues = 0;
  let priceIssues = 0;
  let titleIssues = 0;
  
  cards.forEach((card, index) => {
    log(`📦 Analisando produto ${index + 1}:`);
    
    // Verificar badge
    const badge = card.querySelector('.origem-badge');
    if (badge) {
      badgeCount++;
      log(`✅ Badge encontrado: ${badge.textContent}`);
    } else {
      log('❌ Badge não encontrado', true);
    }
    
    // Verificar imagem
    const img = card.querySelector('img');
    if (img) {
      if (img.src.includes('placeholder.')) {
        log('⚠️ Imagem placeholder sendo usada');
        imageIssues++;
      } else {
        log('✅ Imagem carregada: ' + img.src.substring(0, 50) + '...');
      }
    } else {
      log('❌ Imagem não encontrada', true);
      imageIssues++;
    }
    
    // Verificar preço
    const price = card.querySelector('.preco-produto, .preco-indisponivel');
    if (price) {
      if (price.classList.contains('preco-indisponivel')) {
        log('⚠️ Preço indisponível: ' + price.textContent);
        priceIssues++;
      } else {
        log('✅ Preço encontrado: ' + price.textContent);
      }
    } else {
      log('❌ Preço não encontrado', true);
      priceIssues++;
    }
    
    // Verificar título
    const title = card.querySelector('h3');
    if (title) {
      if (title.textContent.length < 5) {
        log('⚠️ Título muito curto: ' + title.textContent);
        titleIssues++;
      } else {
        log('✅ Título encontrado: ' + title.textContent.substring(0, 30) + '...');
      }
    } else {
      log('❌ Título não encontrado', true);
      titleIssues++;
    }
    
    // Adicionar separador
    const hr = document.createElement('hr');
    hr.style.margin = '10px 0';
    hr.style.border = '0';
    hr.style.borderTop = '1px dashed #ccc';
    logDiv.appendChild(hr);
  });
  
  // 4. Resumo
  log('<b>📊 Resumo da Verificação:</b>');
  log(`✅ ${cards.length} produtos encontrados`);
  log(`✅ ${badgeCount} badges encontrados`);
  
  if (imageIssues > 0) {
    log(`⚠️ ${imageIssues} problemas com imagens`, imageIssues === cards.length);
  } else {
    log('✅ Todas as imagens estão sendo exibidas corretamente');
  }
  
  if (priceIssues > 0) {
    log(`⚠️ ${priceIssues} problemas com preços`, priceIssues === cards.length);
  } else {
    log('✅ Todos os preços estão sendo exibidos corretamente');
  }
  
  if (titleIssues > 0) {
    log(`⚠️ ${titleIssues} problemas com títulos`, titleIssues === cards.length);
  } else {
    log('✅ Todos os títulos estão sendo exibidos corretamente');
  }
  
  // 5. Conclusão
  const totalIssues = imageIssues + priceIssues + titleIssues;
  if (totalIssues === 0) {
    log('<b>🎉 Integração funcionando perfeitamente!</b>');
  } else if (totalIssues < cards.length * 0.5) {
    log('<b>⚠️ Integração funcionando com pequenos problemas</b>');
  } else {
    log('<b>❌ Integração com problemas significativos</b>', true);
  }
}
