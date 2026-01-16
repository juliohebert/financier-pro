import express from 'express';
import { pool } from '../index.js';
import jwt from 'jsonwebtoken';

// Middleware para verificar admin
const verifyAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'financier_secret_key_2024');
    
    if (decoded.funcao !== 'ADMIN') {
      return res.status(403).json({ error: 'Acesso negado. Requer privilégios de administrador.' });
    }

    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// GET /prices - Obter preços (público)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT plano_nome, preco FROM configuracoes_precos ORDER BY id'
    );

    const precos = {
      mensal: result.rows.find(r => r.plano_nome === 'Mensal')?.preco || 49.00,
      anual: result.rows.find(r => r.plano_nome === 'Anual')?.preco || 468.00
    };

    res.json(precos);
  } catch (error) {
    console.error('Erro ao buscar preços:', error);
    res.status(500).json({ error: 'Erro ao buscar preços' });
  }
});

// PATCH /prices - Atualizar preços (admin apenas)
router.patch('/', verifyAdmin, async (req, res) => {
  try {
    const { mensal, anual } = req.body;

    if (mensal !== undefined) {
      await pool.query(
        'UPDATE configuracoes_precos SET preco = $1, atualizado_em = CURRENT_TIMESTAMP WHERE plano_nome = $2',
        [mensal, 'Mensal']
      );
    }

    if (anual !== undefined) {
      await pool.query(
        'UPDATE configuracoes_precos SET preco = $1, atualizado_em = CURRENT_TIMESTAMP WHERE plano_nome = $2',
        [anual, 'Anual']
      );
    }

    const result = await pool.query(
      'SELECT plano_nome, preco FROM configuracoes_precos ORDER BY id'
    );

    const precos = {
      mensal: result.rows.find(r => r.plano_nome === 'Mensal')?.preco || 49.00,
      anual: result.rows.find(r => r.plano_nome === 'Anual')?.preco || 468.00
    };

    res.json(precos);
  } catch (error) {
    console.error('Erro ao atualizar preços:', error);
    res.status(500).json({ error: 'Erro ao atualizar preços' });
  }
});

const router = express.Router();

export default router;
