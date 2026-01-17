
import React, { useState } from 'react';
import { AppView, Client } from '../types';

interface ClientFormViewProps {
  onNavigate: (view: AppView) => void;
  onAddClient: (client: Omit<Client, 'id' | 'totalOpen' | 'status' | 'initials'>) => void;
}

const ClientFormView: React.FC<ClientFormViewProps> = ({ onNavigate, onAddClient }) => {
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddClient({
      name,
      document: document.trim() || 'Não informado',
    });
  };

  return (
    <div className="p-8 max-w-[900px] mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
      <button 
        onClick={() => onNavigate(AppView.CLIENTS)}
        className="flex items-center gap-2 text-slate-400 hover:text-primary font-bold text-xs uppercase tracking-widest mb-6 transition-colors"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span> Voltar para listagem
      </button>

      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Novo Cliente</h1>
        <p className="text-slate-500 mt-2 font-medium">Preencha as informações básicas para cadastrar um novo tomador de crédito.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700 uppercase tracking-wider">
                Nome Completo / Razão Social <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">person</span>
                <input 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-14 bg-bg-light border-none rounded-xl pl-12 pr-4 focus:ring-primary font-medium text-slate-900" 
                  placeholder="Ex: Roberto Carlos da Silva"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700 uppercase tracking-wider flex justify-between">
                <span>CPF ou CNPJ</span>
                <span className="text-[10px] text-slate-400 font-bold lowercase tracking-normal italic">(Opcional)</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">badge</span>
                <input 
                  value={document}
                  onChange={(e) => setDocument(e.target.value)}
                  className="w-full h-14 bg-bg-light border-none rounded-xl pl-12 pr-4 focus:ring-primary font-mono text-slate-900" 
                  placeholder="Deixe em branco se não possuir"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Telefone / WhatsApp</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">call</span>
                <input 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-14 bg-bg-light border-none rounded-xl pl-12 pr-4 focus:ring-primary font-medium text-slate-900" 
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700 uppercase tracking-wider">E-mail</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 bg-bg-light border-none rounded-xl pl-12 pr-4 focus:ring-primary font-medium text-slate-900" 
                  placeholder="cliente@email.com"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-100">
            <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Endereço Completo</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-4 text-slate-400">location_on</span>
              <textarea 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full h-32 bg-bg-light border-none rounded-xl pl-12 pr-4 py-4 focus:ring-primary font-medium text-slate-900 resize-none" 
                placeholder="Rua, Número, Bairro, Cidade - UF"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 pt-6">
            <button 
              type="submit"
              className="bg-primary hover:bg-primary-dark text-[#102216] font-black h-14 rounded-xl px-10 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all flex-1"
            >
              <span className="material-symbols-outlined">save</span> Salvar Cadastro
            </button>
            <button 
              type="button"
              onClick={() => onNavigate(AppView.CLIENTS)}
              className="bg-slate-100 text-slate-600 font-bold h-14 rounded-xl px-10 hover:bg-slate-200 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>

        <div className="bg-primary/5 p-6 rounded-2xl border border-dashed border-primary/30 flex items-start gap-4">
          <span className="material-symbols-outlined text-primary">verified_user</span>
          <div>
            <p className="text-sm font-black text-slate-900">Segurança de Dados</p>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">Os dados do cliente serão criptografados e armazenados de acordo com a LGPD. Certifique-se de que todas as informações de contato estão corretas para facilitar cobranças futuras.</p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ClientFormView;
