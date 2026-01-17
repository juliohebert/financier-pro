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
      'INSERT INTO emprestimos (usuario_id, cliente_id, nome_cliente, valor_principal, taxa_juros, total_receber, data_inicio, data_vencimento, saldo_devedor, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $4, $9) RETURNING *',
      [req.user.id, cliente_id, nome_cliente, valor_principal, taxa_juros, total_receber, data_inicio, data_vencimento, 'ATIVO']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obter detalhes de um empréstimo específico com histórico de pagamentos
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const loanResult = await pool.query(
      'SELECT * FROM emprestimos WHERE id = $1 AND usuario_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (loanResult.rows.length === 0) {
      return res.status(404).json({ error: 'Empréstimo não encontrado' });
    }

    const paymentsResult = await pool.query(
      'SELECT * FROM pagamentos WHERE emprestimo_id = $1 ORDER BY data_pagamento DESC',
      [req.params.id]
    );

    const loan = loanResult.rows[0];
    loan.payments = paymentsResult.rows;

    res.json(loan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Registrar pagamento de juros ou amortização
router.post('/:id/payments', authenticateToken, async (req, res) => {
  const { tipo, valor_pago, observacao } = req.body;
  const loanId = req.params.id;

  try {
    console.log('=== REGISTRAR PAGAMENTO ===');
    console.log('Loan ID:', loanId);
    console.log('User ID:', req.user.id);
    console.log('Body:', req.body);
    console.log('Tipo:', tipo);
    console.log('Valor:', valor_pago);

    // Verificar se o empréstimo pertence ao usuário
    const loanResult = await pool.query(
      'SELECT * FROM emprestimos WHERE id = $1 AND usuario_id = $2',
      [loanId, req.user.id]
    );

    if (loanResult.rows.length === 0) {
      console.log('Empréstimo não encontrado!');
      return res.status(404).json({ error: 'Empréstimo não encontrado' });
    }

    const loan = loanResult.rows[0];
    console.log('Empréstimo encontrado:', loan);
    const jurosDevidos = (loan.saldo_devedor * loan.taxa_juros) / 100;

    let valor_juros = 0;
    let valor_principal = 0;
    let novo_saldo = loan.saldo_devedor;
    let novo_status = loan.status;

    if (tipo === 'JUROS') {
      // Pagamento apenas dos juros
      valor_juros = valor_pago;
      valor_principal = 0;
      // Saldo devedor permanece o mesmo
      // Gerar novo vencimento (próximo mês)
      const novaDataVencimento = new Date(loan.data_vencimento);
      novaDataVencimento.setMonth(novaDataVencimento.getMonth() + 1);

      await pool.query(
        'UPDATE emprestimos SET data_vencimento = $1, ultimo_vencimento = $2, status = $3 WHERE id = $4',
        [novaDataVencimento, loan.data_vencimento, 'ATIVO', loanId]
      );

    } else if (tipo === 'AMORTIZACAO') {
      // Pagamento total: juros + principal
      valor_juros = jurosDevidos;
      valor_principal = valor_pago - valor_juros;
      novo_saldo = Math.max(0, loan.saldo_devedor - valor_principal);

      // Se quitou tudo
      if (novo_saldo === 0) {
        novo_status = 'QUITADO';
      }

      await pool.query(
        'UPDATE emprestimos SET saldo_devedor = $1, valor_pago = valor_pago + $2, status = $3 WHERE id = $4',
        [novo_saldo, valor_pago, novo_status, loanId]
      );
    }

    // Registrar o pagamento
    const paymentResult = await pool.query(
      'INSERT INTO pagamentos (emprestimo_id, tipo, valor_pago, valor_juros, valor_principal, observacao) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [loanId, tipo, valor_pago, valor_juros, valor_principal, observacao || null]
    );

    res.status(201).json({
      payment: paymentResult.rows[0],
      novo_saldo,
      novo_status
    });

  } catch (err) {
    console.error('=== ERRO AO REGISTRAR PAGAMENTO ===');
    console.error('Erro:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({ error: err.message });
  }
});

// Obter histórico de pagamentos de um empréstimo
router.get('/:id/payments', authenticateToken, async (req, res) => {
  try {
    // Verificar se o empréstimo pertence ao usuário
    const loanCheck = await pool.query(
      'SELECT id FROM emprestimos WHERE id = $1 AND usuario_id = $2',
      [req.params.id, req.user.id]
    );

    if (loanCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Empréstimo não encontrado' });
    }

    const result = await pool.query(
      'SELECT * FROM pagamentos WHERE emprestimo_id = $1 ORDER BY data_pagamento DESC',
      [req.params.id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
