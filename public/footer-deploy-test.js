// Teste de verificação do footer - Deploy Vercel
console.log('🚀 Teste de Deploy - Vercel Footer Check');
console.log('Timestamp:', new Date().toISOString());
console.log('Commit: 03197c1 - Vercel config fixed');

// Verificar se o footer existe
document.addEventListener('DOMContentLoaded', function() {
    const footer = document.querySelector('footer');
    const footerContent = document.querySelector('.footer-content');
    
    if (footer && footerContent) {
        console.log('✅ Footer encontrado e carregado corretamente!');
        console.log('Footer HTML:', footer.outerHTML.substring(0, 200) + '...');
        
        // Adicionar indicador visual de sucesso
        const indicator = document.createElement('div');
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #4CAF50;
            color: white;
            padding: 10px;
            border-radius: 5px;
            z-index: 9999;
            font-size: 12px;
            font-family: monospace;
        `;
        indicator.textContent = '✅ Footer Deploy OK - 03197c1';
        document.body.appendChild(indicator);
        
        // Remover após 5 segundos
        setTimeout(() => {
            indicator.remove();
        }, 5000);
    } else {
        console.error('❌ Footer não encontrado!');
        
        // Adicionar indicador visual de erro
        const indicator = document.createElement('div');
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #f44336;
            color: white;
            padding: 10px;
            border-radius: 5px;
            z-index: 9999;
            font-size: 12px;
            font-family: monospace;
        `;
        indicator.textContent = '❌ Footer Deploy FAIL';
        document.body.appendChild(indicator);
    }
});
