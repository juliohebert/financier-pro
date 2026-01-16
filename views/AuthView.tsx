
import React, { useState } from 'react';
import { authService } from '../services';

interface AuthViewProps {
  onLogin: (email: string, isAdmin: boolean) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        await authService.login(email, senha);
        const user = authService.getCurrentUser();
        
        if (user) {
          onLogin(user.email, user.funcao === 'ADMIN');
        }
      } else {
        // Registro
        await authService.register(nome, email, senha);
        const user = authService.getCurrentUser();
        
        if (user) {
          onLogin(user.email, false);
        }
      }
    } catch (err: any) {
      console.error('Erro:', err);
      setError(err.response?.data?.error || 'Erro ao processar solicitação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{backgroundColor: '#102216'}}>
      <div className="max-w-md w-full animate-in zoom-in-95 duration-500">
        <div className="flex items-center gap-3 justify-center mb-10">
          <div className="rounded-2xl p-3 shadow-xl" style={{backgroundColor: '#13ec5b', boxShadow: '0 20px 60px rgba(19, 236, 91, 0.2)'}}>
            <span className="material-symbols-outlined text-4xl font-black" style={{color: '#102216'}}>account_balance</span>
          </div>
          <h1 className="text-white text-3xl font-black tracking-tight">Financier<span style={{color: '#13ec5b'}}>.pro</span></h1>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2" style={{backgroundColor: '#13ec5b'}}></div>
          
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-black text-slate-900">{isLogin ? 'Bem-vindo de volta' : 'Comece agora'}</h2>
            <p className="text-slate-500 font-medium mt-1">
              {isLogin ? 'Gerencie seus empréstimos com eficiência.' : 'Teste grátis por 14 dias sem compromisso.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Nome Completo</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">person</span>
                  <input 
                    type="text" 
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    disabled={loading}
                    placeholder="Seu nome completo"
                    className="w-full h-14 bg-bg-light border-none rounded-2xl pl-12 pr-4 focus:ring-4 focus:ring-primary/20 font-bold text-slate-900 transition-all disabled:opacity-50"
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">E-mail Corporativo</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">mail</span>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  placeholder="exemplo@empresa.com"
                  className="w-full h-14 bg-bg-light border-none rounded-2xl pl-12 pr-4 focus:ring-4 focus:ring-primary/20 font-bold text-slate-900 transition-all disabled:opacity-50"
                />
              </div>
              <p className="text-[9px] text-slate-400 px-2 italic">Dica: Use "admin@financier.pro" para acessar painel super-admin.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Senha de Acesso</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">lock</span>
                <input 
                  type="password" 
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  disabled={loading}
                  className="w-full h-14 border-none rounded-2xl pl-12 pr-4 font-bold text-slate-900 transition-all focus:ring-4 disabled:opacity-50"
                  style={{backgroundColor: '#f6f8f6', outlineColor: 'rgba(19, 236, 91, 0.2)'}}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-16 text-white font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              style={{backgroundColor: loading ? '#64748b' : '#102216'}}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#13ec5b';
                  e.currentTarget.style.color = '#102216';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#102216';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
            >
              {loading ? 'Entrando...' : (isLogin ? 'Entrar no Sistema' : 'Criar minha Conta')}
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                {loading ? 'hourglass_empty' : 'arrow_forward'}
              </span>
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-bold text-slate-500 hover:text-primary transition-colors"
            >
              {isLogin ? 'Ainda não tem conta? Registre-se agora' : 'Já possui licença? Faça o login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
