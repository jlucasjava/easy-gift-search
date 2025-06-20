const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função para atualizar a chave da API no arquivo .env
function updateApiKey(newKey) {
  try {
    // Ler o arquivo .env
    const envPath = './.env';
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Substituir a chave da API
    envContent = envContent.replace(
      /GOOGLE_SEARCH_API_KEY=.*/,
      `GOOGLE_SEARCH_API_KEY=${newKey}`
    );
    
    // Escrever de volta no arquivo
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ Chave da API atualizada com sucesso no arquivo .env');
    
    // Verificar se a atualização foi bem-sucedida
    const updatedContent = fs.readFileSync(envPath, 'utf8');
    if (updatedContent.includes(`GOOGLE_SEARCH_API_KEY=${newKey}`)) {
      console.log('✓ Confirmado: a nova chave está no arquivo .env');
    } else {
      console.log('⚠️ Aviso: Não foi possível confirmar a atualização da chave');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao atualizar a chave da API:', error.message);
    return false;
  }
}

// Pedir a nova chave ao usuário
rl.question('🔑 Digite a nova chave de API do Google: ', (newKey) => {
  if (newKey.trim()) {
    updateApiKey(newKey.trim());
  } else {
    console.log('❌ Nenhuma chave fornecida. O arquivo .env não foi alterado.');
  }
  rl.close();
});
