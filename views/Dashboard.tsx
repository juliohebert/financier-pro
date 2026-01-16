
import React, { useState, useEffect } from 'react';
import { AppView, Loan } from '../types';

interface DashboardProps {
  onNavigate: (view: AppView) => void;
  stats: { totalBalance: number; principalOut: number; interestPending: number; totalReceived: number };
  loans: Loan[];
  onPayment: (loanId: string, value: number, isInterestOnly: boolean) => void;
  onViewDetails: (loanId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, stats, loans, onPayment, onViewDetails }) => {
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [payValue, setPayValue] = useState<string>('');
  const [paymentType, setPaymentType] = useState<'TOTAL' | 'INTEREST'>('TOTAL');

  useEffect(() => {
    if (selectedLoan) {
      if (paymentType === 'INTEREST') {
        const suggestedInterest = selectedLoan.amount * (selectedLoan.interestRate / 100);
        setPayValue(suggestedInterest.toString());
      } else {
        const remaining = selectedLoan.totalToReceive - selectedLoan.amountPaid;
        setPayValue(remaining.toString());
      }
    }
  }, [paymentType, selectedLoan]);

  const handleOpenPayment = (e: React.MouseEvent, loan: Loan) => {
    e.stopPropagation();
    setSelectedLoan(loan);
    setPaymentType('TOTAL');
  };

  const handleConfirmPayment = () => {
    const val = parseFloat(payValue);
    if (selectedLoan && val > 0) {
      onPayment(selectedLoan.id, val, paymentType === 'INTEREST');
      setSelectedLoan(null);
      setPayValue('');
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-bg-dark">Painel de Controle</h2>
          <p className="text-slate-500 font-medium">Acompanhe seu capital e o crescimento dos seus lucros.</p>
        </div>
        <button 
          onClick={() => onNavigate(AppView.LOANS)}
          className="bg-primary hover:bg-primary-dark text-bg-dark font-black px-6 h-12 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
        >
          <span className="material-symbols-outlined font-bold">add_card</span> Novo Empréstimo
        </button>
      </header>

      {/* Cards de Métricas de Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 mb-2">
            Capital Emprestado
            <span className="material-symbols-outlined text-[14px] text-slate-300 cursor-help" title="Apenas o valor original (principal) que saiu do seu caixa.">info</span>
          </p>
          <p className="text-3xl font-black text-slate-900 group-hover:text-primary-dark transition-colors">R$ {stats.principalOut.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <p className="text-[10px] text-slate-400 mt-2 font-bold italic">Valor líquido a recuperar</p>
        </div>

        {/* CARD DESTAQUE: LUCRO PROJETADO */}
        <div className="bg-white p-6 rounded-[2rem] border-2 border-primary shadow-xl relative overflow-hidden bg-gradient-to-br from-white via-white to-primary/10 group transform hover:scale-[1.02] transition-all">
          <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-9xl text-primary-dark">payments</span>
          </div>
          <div className="relative z-10">
            <p className="text-primary-dark text-[10px] font-black uppercase tracking-widest flex items-center gap-1 mb-2">
              Lucro Projetado (Juros)
              <div className="group/tooltip relative flex items-center">
                <span className="material-symbols-outlined text-[16px] text-primary cursor-help">info</span>
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-bg-dark text-white text-[10px] rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none shadow-xl z-50 font-medium leading-relaxed">
                  Este é o rendimento esperado baseado na soma de todos os juros que serão recebidos dos contratos atualmente ativos.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-bg-dark"></div>
                </div>
              </div>
            </p>
            <p className="text-4xl font-black text-primary-dark leading-none">R$ {stats.interestPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <div className="mt-4 py-1.5 px-3 bg-primary text-bg-dark rounded-xl inline-flex items-center gap-2 text-[10px] font-black shadow-sm">
              <span className="material-symbols-outlined text-[14px] fill-1">stars</span> 
              CRESCIMENTO ESTIMADO
            </div>
          </div>
        </div>

        <div className="bg-bg-dark p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 mb-2">
            Total Recebido
            <span className="material-symbols-outlined text-[14px] text-slate-500 cursor-help" title="Soma total de Principal + Juros que já voltaram para sua conta.">info</span>
          </p>
          <p className="text-3xl font-black text-white group-hover:text-primary transition-colors">R$ {stats.totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <p className="text-[10px] text-slate-400 mt-2 font-bold italic">Dinheiro real retornado</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-colors">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 mb-2">
            Saldo Disponível
            <span className="material-symbols-outlined text-[14px] text-slate-300 cursor-help" title="Dinheiro em caixa disponível para realizar novos empréstimos.">info</span>
          </p>
          <p className="text-3xl font-black text-slate-900 group-hover:text-bg-dark transition-colors">R$ {stats.totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <div className="mt-3 py-1 px-3 bg-slate-100 text-slate-600 rounded-lg inline-flex items-center gap-1 text-[10px] font-bold">
            <span className="material-symbols-outlined text-[12px]">account_balance_wallet</span> PRONTO PARA REINVESTIR
          </div>
        </div>
      </div>

      {/* Tabela de Contratos */}
      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/30">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-slate-900">Contratos em Vigência</h3>
            <span className="bg-bg-dark text-white text-[10px] px-2 py-0.5 rounded-full font-black">{loans.filter(l => l.status !== 'QUITADO').length} ATIVOS</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b bg-bg-light/30">
                <th className="px-8 py-5">Cliente</th>
                <th className="px-8 py-5">Vencimento</th>
                <th className="px-8 py-5 text-center">Juros</th>
                <th className="px-8 py-5 text-right">Saldo Devedor</th>
                <th className="px-8 py-5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loans.map(loan => (
                <tr 
                  key={loan.id} 
                  className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                  onClick={() => onViewDetails(loan.id)}
                >
                  <td className="px-8 py-6">
                    <p className="font-black text-slate-900 text-base group-hover:text-primary-dark transition-colors">{loan.clientName}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: {loan.id}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className={`text-sm font-black ${loan.status === 'ATRASADO' ? 'text-danger' : 'text-slate-600'}`}>
                        {new Date(loan.dueDate).toLocaleDateString('pt-BR')}
                      </span>
                      {loan.status === 'ATRASADO' && <span className="text-[9px] font-black text-danger uppercase">Vencido</span>}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="px-2 py-1 bg-primary/10 rounded-lg text-xs font-black text-primary-dark">
                      {loan.interestRate}%
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <p className="font-black text-slate-900 text-lg">R$ {(loan.totalToReceive - loan.amountPaid).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Restante</p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    {loan.status !== 'QUITADO' ? (
                      <button 
                        onClick={(e) => handleOpenPayment(e, loan)}
                        className="bg-bg-dark text-white hover:bg-primary hover:text-bg-dark px-6 py-2.5 rounded-xl text-xs font-black transition-all shadow-md active:scale-95"
                      >
                        RECEBER
                      </button>
                    ) : (
                      <span className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-black text-[10px] uppercase">
                        Quitado
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {loans.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase text-xs">
                    Nenhum empréstimo ativo para exibir.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Recebimento */}
      {selectedLoan && (
        <div className="fixed inset-0 bg-bg-dark/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setSelectedLoan(null)}>
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-3xl font-black text-slate-900 tracking-tight">Lançar Recebimento</h4>
                <p className="text-slate-500 font-medium italic">Recebendo de {selectedLoan.clientName}</p>
              </div>
              <button onClick={() => setSelectedLoan(null)} className="text-slate-400 hover:text-danger p-2">
                <span className="material-symbols-outlined text-3xl">close</span>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex p-1.5 bg-bg-light rounded-[1.5rem] gap-1">
                <button 
                  onClick={() => setPaymentType('INTEREST')}
                  className={`flex-1 py-3.5 rounded-[1.2rem] text-xs font-black uppercase tracking-widest transition-all ${
                    paymentType === 'INTEREST' ? 'bg-white text-primary-dark shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Somente Juros
                </button>
                <button 
                  onClick={() => setPaymentType('TOTAL')}
                  className={`flex-1 py-3.5 rounded-[1.2rem] text-xs font-black uppercase tracking-widest transition-all ${
                    paymentType === 'TOTAL' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Amortização
                </button>
              </div>

              <div className={`p-4 rounded-2xl border text-xs font-medium leading-relaxed transition-colors ${
                paymentType === 'INTEREST' 
                ? 'bg-primary/5 border-primary/20 text-primary-dark' 
                : 'bg-blue-50 border-blue-100 text-blue-700'
              }`}>
                {paymentType === 'INTEREST' ? (
                  <p><span className="font-black">LUCRO REALIZADO:</span> O cliente está pagando o aluguel do dinheiro. A dívida principal não diminui.</p>
                ) : (
                  <p><span className="font-black">RETORNO DE CAPITAL:</span> O cliente está devolvendo o valor emprestado. O saldo devedor será reduzido.</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Confirmar Valor (R$)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300 text-2xl">R$</span>
                  <input 
                    type="number" 
                    value={payValue}
                    onChange={(e) => setPayValue(e.target.value)}
                    className="w-full h-20 bg-bg-light border-none rounded-[1.5rem] pl-16 pr-6 font-black text-3xl text-slate-900 focus:ring-4 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <button 
                onClick={handleConfirmPayment}
                className="w-full bg-primary hover:bg-primary-dark text-bg-dark font-black h-16 rounded-[1.5rem] shadow-xl flex items-center justify-center gap-3 text-lg transition-transform active:scale-[0.98]"
              >
                Confirmar Lançamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
