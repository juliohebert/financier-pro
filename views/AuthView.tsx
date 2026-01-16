
import React, { useState } from 'react';

interface AuthViewProps {
  onLogin: (email: string, isAdmin: boolean) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Regra de simulação: e-mail que contém "admin" vira administrador
      const isAdmin = email.toLowerCase().includes('admin');
      onLogin(email, isAdmin);
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
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">E-mail Corporativo</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">mail</span>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@empresa.com"
                  className="w-full h-14 bg-bg-light border-none rounded-2xl pl-12 pr-4 focus:ring-4 focus:ring-primary/20 font-bold text-slate-900 transition-all"
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
                  className="w-full h-14 border-none rounded-2xl pl-12 pr-4 font-bold text-slate-900 transition-all focus:ring-4"
                  style={{backgroundColor: '#f6f8f6', outlineColor: 'rgba(19, 236, 91, 0.2)'}}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full h-16 text-white font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 group"
              style={{backgroundColor: '#102216'}}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#13ec5b';
                e.currentTarget.style.color = '#102216';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#102216';
                e.currentTarget.style.color = '#ffffff';
              }}
            >
              {isLogin ? 'Entrar no Sistema' : 'Criar minha Conta'}
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
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
