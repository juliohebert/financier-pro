// Script para chamar o backend em produção e executar a migração via API
const https = require('https');

const API_URL = 'https://financier-ie3x.onrender.com';

// Simulação: precisaríamos criar um endpoint /admin/migrate no backend
// Por enquanto, vamos criar um endpoint temporário

console.log('⚠️  AVISO: Para executar a migração em produção, você tem duas opções:\n');
console.log('1. Executar diretamente no painel do Neon (Recomendado):');
console.log('   - Acesse: https://console.neon.tech/');
console.log('   - Vá em Query Editor');
console.log('   - Execute a query:\n');
console.log('   UPDATE usuarios');
console.log('   SET data_inicio_teste = criado_em');
console.log('   WHERE data_inicio_teste IS NULL');
console.log('     AND status_licenca = \'TESTE\'');
console.log('     AND funcao = \'USUARIO\';\n');
console.log('2. Criar um endpoint de migração no backend (mais seguro)');
console.log('   - Criar rota /admin/migrate');
console.log('   - Proteger com autenticação admin');
console.log('   - Executar a query');
