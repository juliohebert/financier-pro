import express from 'express';
import { pool } from '../index.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Fluxo de caixa
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM transacoes WHERE usuario_id = $1 ORDER BY data_transacao DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { data_transacao, descricao, categoria, tipo_transacao, valor, status } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO transacoes (usuario_id, data_transacao, descricao, categoria, tipo_transacao, valor, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [req.user.id, data_transacao, descricao, categoria, tipo_transacao, valor, status || 'LIQUIDADO']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
