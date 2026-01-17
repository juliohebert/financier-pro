import { Router } from 'express';
import { pool } from '../index.js';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'financier-jwt-secret-2024-secure-key-production';

// Middleware para verificar se é admin
const verifyAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ erro: 'Token não fornecido' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.funcao !== 'ADMIN') {
      return res.status(403).json({ erro: 'Acesso negado. Apenas administradores.' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ erro: 'Token inválido' });
  }
};

// Endpoint para executar migração de data_inicio_teste
router.post('/fix-trial-dates', verifyAdmin, async (req, res) => {
  try {
    console.log('🔄 Executando migração de data_inicio_teste...');
    
    // Atualizar usuários sem data_inicio_teste
    const result = await pool.query(`
      UPDATE usuarios
      SET data_inicio_teste = criado_em
      WHERE data_inicio_teste IS NULL 
        AND status_licenca = 'TESTE'
        AND funcao = 'USUARIO'
      RETURNING id, nome, email
    `);
    
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
    
    const usuarios = verify.rows.map(u => ({
      nome: u.nome,
      email: u.email,
      criadoEm: u.criado_em,
      dataInicioTeste: u.data_inicio_teste,
      diasDesdeInicio: Math.floor(u.dias_desde_inicio),
      diasRestantes: Math.max(0, 14 - Math.floor(u.dias_desde_inicio)),
      status: u.status_licenca
    }));
    
    res.json({
      sucesso: true,
      usuariosAtualizados: result.rowCount,
      usuariosModificados: result.rows,
      todosUsuarios: usuarios
    });
    
    console.log(`✅ ${result.rowCount} usuários atualizados com sucesso`);
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    res.status(500).json({
      erro: 'Erro ao executar migração',
      detalhes: error.message
    });
  }
});

export default router;
