import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import authRoutes from './routes/auth.js';
import clientRoutes from './routes/clients.js';
import loanRoutes from './routes/loans.js';
import cashflowRoutes from './routes/cashflow.js';
import pricesRoutes from './routes/prices.js';

// Carrega variáveis do .env
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Configuração do pool do PostgreSQL
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// CORS liberado para o frontend do Vercel
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

app.use(express.json());

// Rotas principais
app.use('/auth', authRoutes);
app.use('/clients', clientRoutes);
app.use('/loans', loanRoutes);
app.use('/cashflow', cashflowRoutes);
app.use('/prices', pricesRoutes);

app.get('/', (req, res) => {
  res.send('API Financier Backend rodando!');
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
