const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Carregar .env do diretório backend
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    console.log('🔄 Atualizando data_inicio_teste para usuários existentes...\n');
    
    // Atualizar usuários sem data_inicio_teste
    const result = await pool.query(`
      UPDATE usuarios
      SET data_inicio_teste = criado_em
      WHERE data_inicio_teste IS NULL 
        AND status_licenca = 'TESTE'
        AND funcao = 'USUARIO'
      RETURNING id, nome, email
    `);
    
    console.log(`✅ ${result.rowCount} usuários atualizados:`);
    result.rows.forEach(u => console.log(`  - ${u.nome} (${u.email})`));
    
    // Verificar resultados
    const verify = await pool.query(`
      SELECT 
        id, 
        nome, 
        email, 
        status_licenca,
        TO_CHAR(criado_em, 'DD/MM/YYYY HH24:MI') as criado_em,
        TO_CHAR(data_inicio_teste, 'DD/MM/YYYY HH24:MI') as data_inicio_teste,
        EXTRACT(DAY FROM (NOW() - data_inicio_teste)) as dias_desde_inicio
      FROM usuarios 
      WHERE funcao = 'USUARIO'
      ORDER BY criado_em DESC
    `);
    
    console.log('\n📊 Status dos usuários:');
    verify.rows.forEach(u => {
      const dias = Math.floor(u.dias_desde_inicio);
      const diasRestantes = Math.max(0, 14 - dias);
      console.log(`  ${u.nome}:`);
      console.log(`    - Criado em: ${u.criado_em}`);
      console.log(`    - Teste iniciado em: ${u.data_inicio_teste}`);
      console.log(`    - Dias desde início: ${dias}`);
      console.log(`    - Dias restantes: ${diasRestantes}`);
      console.log(`    - Status: ${u.status_licenca}`);
      console.log('');
    });
    
    await pool.end();
    console.log('✅ Migração concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro:', error.message);
    await pool.end();
    process.exit(1);
  }
})();
