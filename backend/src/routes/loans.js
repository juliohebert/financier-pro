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

// CRUD de empréstimos
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM emprestimos WHERE usuario_id = $1', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { cliente_id, nome_cliente, valor_principal, taxa_juros, total_receber, data_inicio, data_vencimento } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO emprestimos (usuario_id, cliente_id, nome_cliente, valor_principal, taxa_juros, total_receber, data_inicio, data_vencimento) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [req.user.id, cliente_id, nome_cliente, valor_principal, taxa_juros, total_receber, data_inicio, data_vencimento]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Adicione PUT e DELETE conforme necessário

export default router;
