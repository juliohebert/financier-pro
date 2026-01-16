import api from './api';
import { Transaction } from '../types';

export const transactionsService = {
  // Listar todas as transações
  async getAll() {
    const response = await api.get('/cashflow');
    return response.data;
  },

  // Criar nova transação
  async create(transacao: {
    data_transacao: string;
    descricao: string;
    categoria: string;
    tipo_transacao: 'ENTRADA' | 'SAIDA';
    valor: number;
    status?: string;
  }) {
    const response = await api.post('/cashflow', transacao);
    return response.data;
  },

  // Deletar transação
  async delete(id: string) {
    await api.delete(`/cashflow/${id}`);
  },
};
