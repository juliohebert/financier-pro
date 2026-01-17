import api from './api';
import { Loan } from '../types';

export const loansService = {
  // Listar todos os empréstimos
  async getAll() {
    const response = await api.get('/loans');
    return response.data;
  },

  // Buscar empréstimo por ID
  async getById(id: string) {
    const response = await api.get(`/loans/${id}`);
    return response.data;
  },

  // Criar novo empréstimo
  async create(emprestimo: {
    cliente_id: number;
    nome_cliente: string;
    valor_principal: number;
    taxa_juros: number;
    total_receber: number;
    data_inicio: string;
    data_vencimento: string;
  }) {
    const response = await api.post('/loans', emprestimo);
    return response.data;
  },

  // Atualizar empréstimo
  async update(id: string, emprestimo: Partial<Loan>) {
    const response = await api.put(`/loans/${id}`, emprestimo);
    return response.data;
  },

  // Registrar pagamento
  async registerPayment(loanId: string, pagamento: {
    tipo: 'JUROS' | 'AMORTIZACAO';
    valor_pago: number;
    observacao?: string;
  }) {
    const response = await api.post(`/loans/${loanId}/payments`, pagamento);
    return response.data;
  },

  // Deletar empréstimo
  async delete(id: string) {
    await api.delete(`/loans/${id}`);
  },
};
