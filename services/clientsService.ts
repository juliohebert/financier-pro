import api from './api';
import { Client } from '../types';

export const clientsService = {
  // Listar todos os clientes
  async getAll() {
    const response = await api.get('/clients');
    return response.data;
  },

  // Buscar cliente por ID
  async getById(id: string) {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  // Criar novo cliente
  async create(cliente: {
    nome: string;
    documento: string;
    iniciais?: string;
    email?: string;
    telefone?: string;
    endereco?: string;
    observacoes?: string;
  }) {
    const response = await api.post('/clients', cliente);
    return response.data;
  },

  // Atualizar cliente
  async update(id: string, cliente: Partial<Client>) {
    const response = await api.put(`/clients/${id}`, cliente);
    return response.data;
  },

  // Deletar cliente
  async delete(id: string) {
    await api.delete(`/clients/${id}`);
  },
};
