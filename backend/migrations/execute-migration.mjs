#!/usr/bin/env node

/**
 * Script para executar migração de data_inicio_teste via API
 * Uso: node execute-migration.mjs
 */

const API_URL = 'https://financier-ie3x.onrender.com';
const ADMIN_EMAIL = 'admin@financier.pro';
const ADMIN_PASSWORD = 'admin123';
const MAX_RETRIES = 10;
const RETRY_DELAY = 10000; // 10 segundos

async function checkEndpointAvailability() {
  console.log('🔍 Verificando se o endpoint de migração está disponível...\n');
  
  for (let i = 1; i <= MAX_RETRIES; i++) {
    try {
      const response = await fetch(`${API_URL}/migrations/fix-trial-dates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      // Se não for 404, o endpoint existe (mesmo que retorne 401)
      if (response.status !== 404) {
        console.log('✅ Endpoint disponível!\n');
        return true;
      }
      
      console.log(`⏳ Tentativa ${i}/${MAX_RETRIES}: Endpoint ainda não disponível. Aguardando ${RETRY_DELAY/1000}s...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    } catch (error) {
      console.log(`⚠️  Tentativa ${i}/${MAX_RETRIES}: Erro ao conectar. Aguardando ${RETRY_DELAY/1000}s...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
  
  console.log('\n❌ Endpoint não ficou disponível após várias tentativas.');
  console.log('📌 Possíveis soluções:');
  console.log('   1. Aguarde mais alguns minutos e execute novamente');
  console.log('   2. Verifique os logs do Render: https://dashboard.render.com/');
  console.log('   3. Execute diretamente no banco (veja MIGRACAO.md)\n');
  return false;
}

async function executeMigration() {
  // Verificar disponibilidade do endpoint primeiro
  const isAvailable = await checkEndpointAvailability();
  if (!isAvailable) {
    process.exit(1);
  }
  
  console.log('🔐 Fazendo login como administrador...\n');
  
  try {
    // 1. Fazer login como admin
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, senha: ADMIN_PASSWORD })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Erro no login: ${loginResponse.status} ${loginResponse.statusText}`);
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    console.log('✅ Login realizado com sucesso!\n');
    console.log('🔄 Executando migração de data_inicio_teste...\n');
    
    // 2. Executar migração
    const migrationResponse = await fetch(`${API_URL}/migrations/fix-trial-dates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!migrationResponse.ok) {
      const errorText = await migrationResponse.text();
      throw new Error(`Erro na migração: ${migrationResponse.status} ${errorText}`);
    }
    
    const migrationData = await migrationResponse.json();
    
    console.log('✅ Migração concluída com sucesso!\n');
    console.log(`📊 Usuários atualizados: ${migrationData.usuariosAtualizados}\n`);
    
    if (migrationData.usuariosModificados && migrationData.usuariosModificados.length > 0) {
      console.log('Usuários modificados:');
      migrationData.usuariosModificados.forEach(u => {
        console.log(`  - ${u.nome} (${u.email})`);
      });
      console.log('');
    }
    
    if (migrationData.todosUsuarios && migrationData.todosUsuarios.length > 0) {
      console.log('Status de todos os usuários:');
      migrationData.todosUsuarios.forEach(u => {
        console.log(`\n  ${u.nome} (${u.email}):`);
        console.log(`    - Criado em: ${u.criadoEm}`);
        console.log(`    - Teste iniciado em: ${u.dataInicioTeste}`);
        console.log(`    - Dias desde início: ${u.diasDesdeInicio}`);
        console.log(`    - Dias restantes: ${u.diasRestantes}`);
        console.log(`    - Status: ${u.status}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

// Executar migração imediatamente (verifica disponibilidade automaticamente)
executeMigration();
