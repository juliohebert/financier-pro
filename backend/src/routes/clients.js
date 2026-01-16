import express from 'express';
import { pool } from '../index.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware de autenticação
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

// CRUD de clientes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clientes WHERE usuario_id = $1', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { nome, documento, iniciais, email, telefone, endereco, observacoes } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO clientes (usuario_id, nome, documento, iniciais, email, telefone, endereco, observacoes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [req.user.id, nome, documento, iniciais, email, telefone, endereco, observacoes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Adicione PUT e DELETE conforme necessário

export default router;
