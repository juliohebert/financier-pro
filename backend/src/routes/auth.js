import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { pool } from '../index.js';

const router = express.Router();

// Login - Autenticação com banco de dados
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário no banco
    const result = await pool.query(
      'SELECT id, nome, email, senha_hash, funcao, status_licenca, plano_licenca, data_inicio_teste FROM usuarios WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const usuario = result.rows[0];

    // Comparar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: usuario.id, 
        email: usuario.email,
        funcao: usuario.funcao 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // Retornar token e dados do usuário
    res.json({ 
      token,
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        funcao: usuario.funcao,
        statusLicenca: usuario.status_licenca,
        planoLicenca: usuario.plano_licenca,
        dataInicioTeste: usuario.data_inicio_teste
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Registro - Criar novo usuário
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    // Verificar se email já existe
    const existente = await pool.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email]
    );

    if (existente.rows.length > 0) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    // Hashear senha
    const senha_hash = await bcrypt.hash(senha, 10);

    // Criar usuário
    const result = await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash, funcao, status_licenca, plano_licenca) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nome, email, funcao, status_licenca, plano_licenca, data_inicio_teste',
      [nome, email, senha_hash, 'USUARIO', 'TESTE', 'Teste']
    );

    const usuario = result.rows[0];

    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: usuario.id, 
        email: usuario.email,
        funcao: usuario.funcao 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // Retornar token e dados do usuário
    res.status(201).json({ 
      token,
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        funcao: usuario.funcao,
        statusLicenca: usuario.status_licenca,
        planoLicenca: usuario.plano_licenca,
        dataInicioTeste: usuario.data_inicio_teste
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
