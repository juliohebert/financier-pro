import api from './api';

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    nome: string;
    email: string;
    funcao: 'USUARIO' | 'ADMIN';
    status_licenca: string;
    plano_licenca: string;
  };
}

export const authService = {
  // Login
  async login(email: string, senha: string): Promise<LoginResponse> {
    const response = await api.post('/auth/login', { email, senha });
    
    // Salvar token e usuário
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  },

  // Registro
  async register(nome: string, email: string, senha: string): Promise<LoginResponse> {
    const response = await api.post('/auth/register', { nome, email, senha });
    
    // NÃO salvar token automaticamente - deixar para o login posterior
    return response.data;
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  // Obter usuário atual
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};
