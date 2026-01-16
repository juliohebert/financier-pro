import api from './api';
import { GlobalUser } from '../types';

export const usersService = {
  // Listar todos os usuários (apenas admin)
  async getAll(): Promise<GlobalUser[]> {
    try {
      const response = await api.get('/auth/users');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  },

  // Atualizar status da licença de um usuário
  async updateLicenseStatus(userId: string, status: string, planName?: string): Promise<void> {
    try {
      await api.patch(`/auth/users/${userId}/license`, { status, planName });
    } catch (error) {
      console.error('Erro ao atualizar licença:', error);
      throw error;
    }
  }
};
