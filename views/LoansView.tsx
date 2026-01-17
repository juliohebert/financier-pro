
import React, { useState, useMemo, useEffect } from 'react';
import { Client, Loan, AppView } from '../types';

interface LoansViewProps {
  clients: Client[];
  onAddLoan: (loan: Omit<Loan, 'id' | 'status' | 'amountPaid' | 'payments'>) => void;
  onNavigate: (view: AppView) => void;
  defaultInterest: number;
  preSelectedClientId?: string;
}

const LoansView: React.FC<LoansViewProps> = ({ clients, onAddLoan, onNavigate, defaultInterest, preSelectedClientId }) => {
  // Alterado de '5000' para '0' conforme solicitação
  const [amountStr, setAmountStr] = useState<string>('0');
  const [interestStr, setInterestStr] = useState<string>(defaultInterest.toString());
  const [selectedClientId, setSelectedClientId] = useState<string>(preSelectedClientId || '');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [showSuccessBanner, setShowSuccessBanner] = useState(!!preSelectedClientId);
  
  // Função para calcular o mês seguinte mantendo o dia
  const calculateNextMonth = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00'); // Força meio-dia para evitar problemas de timezone
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  };

  const [dueDate, setDueDate] = useState(calculateNextMonth(new Date().toISOString().split('T')[0]));
  
  // Atualiza o vencimento automaticamente quando a data de liberação muda
  useEffect(() => {
    setDueDate(calculateNextMonth(startDate));
  }, [startDate]);

  useEffect(() => {
    if (preSelectedClientId) {
      setSelectedClientId(preSelectedClientId);
    }
  }, [preSelectedClientId]);

  useEffect(() => {
    setInterestStr(defaultInterest.toString());
  }, [defaultInterest]);

  const amount = useMemo(() => parseFloat(amountStr) || 0, [amountStr]);
  const interest = useMemo(() => parseFloat(interestStr) || 0, [interestStr]);

  const total = useMemo(() => {
    return amount + (amount * (interest / 100));
  }, [amount, interest]);

  const handleConfirm = () => {
    const client = clients.find(c => c.id === selectedClientId);
    if (!client) {
      alert("Por favor, selecione um cliente.");
      return;
    }
    if (amount <= 0) {
      alert("O valor do empréstimo deve ser maior que zero.");
      return;
    }
    if (!dueDate) {
      alert("Por favor, defina uma data de vencimento.");
      return;
    }

    onAddLoan({
      clientId: client.id,
      clientName: client.name,
      amount,
      interestRate: interest,
      totalToReceive: total,
      saldoDevedor: amount,
      startDate,
      dueDate
    });
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto animate-in fade-in duration-700">
      <div className="mb-4 flex gap-2 items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
        <button onClick={() => onNavigate(AppView.DASHBOARD)} className="hover:text-primary transition-colors">Início</button> 
        <span>/</span> 
        <span className="text-slate-900">Novo Empréstimo</span>
      </div>

      {showSuccessBanner && (
        <div className="mb-6 bg-green-50 border-2 border-green-500 rounded-2xl p-4 flex items-center justify-between animate-in slide-in-from-top duration-500">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-green-600 text-3xl">check_circle</span>
            <div>
              <p className="font-black text-green-900">Cliente cadastrado com sucesso!</p>
              <p className="text-sm text-green-700 font-medium">Agora você pode criar um empréstimo para este cliente.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowSuccessBanner(false)}
            className="text-green-600 hover:text-green-800 p-2"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tight text-bg-dark">Emprestar Capital</h1>
        <p className="text-slate-500 mt-2 font-medium">Configure os termos e a data de retorno do contrato.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                Quem vai receber? <span className="text-red-500">*</span>
              </label>
              <select 
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full h-14 bg-bg-light border-none rounded-xl px-4 focus:ring-2 focus:ring-primary font-bold text-slate-900 transition-all appearance-none"
              >
                <option value="">Selecione um cliente cadastrado...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  Valor Emprestado (Principal) <span className="text-red-500">*</span>
                  <span className="material-symbols-outlined text-xs text-slate-300 cursor-help" title="Este é o valor que sairá do seu caixa hoje.">info</span>
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">R$</span>
                  <input 
                    type="number" 
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    onFocus={(e) => amountStr === '0' && setAmountStr('')}
                    onBlur={(e) => amountStr === '' && setAmountStr('0')}
                    className="w-full h-14 bg-bg-light border-none rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-primary font-black text-lg text-slate-900 transition-all" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  Taxa de Juros (%) <span className="text-red-500">*</span>
                  <span className="material-symbols-outlined text-xs text-slate-300 cursor-help" title="Esta taxa foi definida automaticamente nas Configurações.">info</span>
                </label>
                <input 
                  type="number" 
                  step="0.1"
                  value={interestStr}
                  onChange={(e) => setInterestStr(e.target.value)}
                  className="w-full h-14 bg-bg-light border-none rounded-xl px-4 focus:ring-2 focus:ring-primary font-black text-lg text-slate-900 transition-all" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  Data de Liberação <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-14 bg-bg-light border-none rounded-xl px-4 focus:ring-2 focus:ring-primary font-bold text-slate-900 transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  Próximo Vencimento <span className="text-red-500">*</span>
                  <span className="material-symbols-outlined text-xs text-primary cursor-help" title="Definido automaticamente para 30 dias após a liberação.">event</span>
                </label>
                <input 
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full h-14 bg-white border-2 border-primary/20 rounded-xl px-4 focus:ring-2 focus:ring-primary font-black text-slate-900 transition-all" 
                />
              </div>
            </div>

            <div className="bg-primary/5 p-6 rounded-2xl border border-dashed border-primary/20 space-y-2">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">lightbulb</span>
                Resumo da Operação
              </h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Você está liberando <span className="font-bold text-slate-900">R$ {amount.toLocaleString('pt-BR')}</span> hoje ({new Date(startDate + 'T12:00:00').toLocaleDateString('pt-BR')}). 
                O sistema sugeriu o vencimento para <span className="font-bold text-primary-dark">{new Date(dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}</span> (exatamente 1 mês após).
              </p>
            </div>

            <div className="pt-6 flex gap-4">
              <button 
                onClick={handleConfirm}
                className="bg-primary hover:bg-primary-dark text-bg-dark font-black h-14 rounded-xl px-8 flex-1 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all"
              >
                Confirmar Empréstimo
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm sticky top-8 p-6">
            <h3 className="font-black text-bg-dark mb-4">Projeção do Recebimento</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-bold text-slate-500">
                <span>Principal (Seu Capital)</span>
                <span className="text-slate-900">R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-500">
                <span>Juros (Seu Lucro)</span>
                <span className="text-primary-dark">+ R$ {(amount * (interest/100)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Dívida Total Inicial</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="mt-4 p-3 bg-slate-50 rounded-xl">
                 <p className="text-[10px] font-black text-slate-400 uppercase">Primeiro Vencimento Sugerido</p>
                 <p className="text-sm font-black text-slate-700">{new Date(dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoansView;
