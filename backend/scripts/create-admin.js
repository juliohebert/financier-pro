import bcrypt from 'bcrypt';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function createAdmin() {
  try {
    // Senha padrão do admin
    const senhaAdmin = 'admin123'; // ALTERE ESTA SENHA!
    
    console.log('🔐 Criando usuário administrador...');
    console.log('📧 Email: admin@financier.pro');
    console.log('🔑 Senha:', senhaAdmin);
    console.log('⚠️  IMPORTANTE: Altere esta senha após o primeiro login!\n');

    // Gerar hash da senha
    const senhaHash = await bcrypt.hash(senhaAdmin, 10);

    // Inserir ou atualizar usuário admin
    const result = await pool.query(`
      INSERT INTO usuarios (nome, email, senha_hash, funcao, status_licenca, plano_licenca)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) 
      DO UPDATE SET 
        senha_hash = $3,
        funcao = $4,
        status_licenca = $5,
        plano_licenca = $6,
        atualizado_em = CURRENT_TIMESTAMP
      RETURNING id, nome, email, funcao
    `, ['Administrador', 'admin@financier.pro', senhaHash, 'ADMIN', 'ATIVO', 'Super Admin']);

    console.log('✅ Usuário admin criado/atualizado com sucesso!');
    console.log('ID:', result.rows[0].id);
    console.log('Nome:', result.rows[0].nome);
    console.log('Email:', result.rows[0].email);
    console.log('Função:', result.rows[0].funcao);
    console.log('\n🌐 Acesse: https://financier-ks3x.onrender.com');
    console.log('📧 Email: admin@financier.pro');
    console.log('🔑 Senha:', senhaAdmin);
    
  } catch (error) {
    console.error('❌ Erro ao criar admin:', error);
  } finally {
    await pool.end();
    process.exit();
  }
}

createAdmin();
