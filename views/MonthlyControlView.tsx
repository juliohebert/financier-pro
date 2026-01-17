
import React, { useMemo, useState, useEffect } from 'react';
import { Loan, AppView } from '../types';

interface MonthlyControlViewProps {
  loans: Loan[];
  onViewDetails: (loanId: string) => void;
  onNavigate: (view: AppView) => void;
  onPayment: (loanId: string, value: number, isInterestOnly: boolean) => void;
}

const MonthlyControlView: React.FC<MonthlyControlViewProps> = ({ loans, onViewDetails, onNavigate, onPayment }) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Estados para a Modal de Recebimento
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [payValue, setPayValue] = useState<string>('');
  const [paymentType, setPaymentType] = useState<'TOTAL' | 'INTEREST'>('INTEREST');

  const activeLoans = loans.filter(l => l.status !== 'QUITADO');

  // Atualiza valor sugerido na modal
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

  const handleConfirmPayment = () => {
    const val = parseFloat(payValue);
    if (selectedLoan && val > 0) {
      onPayment(selectedLoan.id, val, paymentType === 'INTEREST');
      setSelectedLoan(null);
      setPayValue('');
    }
  };

  const getLoanStatusForCurrentMonth = (loan: Loan) => {
    const expectedInterest = loan.amount * (loan.interestRate / 100);
    const paidThisMonth = loan.payments
      .filter(p => {
        const pDate = new Date(p.data_pagamento);
        return p.tipo === 'JUROS' && pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + p.valor_pago, 0);

    const isPaid = paidThisMonth >= expectedInterest;
    const displayDueDate = new Date(loan.dueDate);
    const isLate = !isPaid && today > displayDueDate;

    return { expectedInterest, paidThisMonth, isPaid, isLate, displayDueDate };
  };

  const metrics = useMemo(() => {
    return activeLoans.reduce((acc, loan) => {
      const info = getLoanStatusForCurrentMonth(loan);
      acc.totalExpected += info.expectedInterest;
      acc.totalReceived += info.paidThisMonth;
      const gap = Math.max(0, info.expectedInterest - info.paidThisMonth);
      acc.totalPending += gap;
      return acc;
    }, { totalExpected: 0, totalReceived: 0, totalPending: 0 });
  }, [activeLoans, currentMonth, currentYear]);

  return (
    <div className="p-8 max-w-[1200px] mx-auto animate-in fade-in duration-500">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-bg-dark tracking-tight">Controle de Juros Mensais</h2>
          <p className="text-slate-500 font-medium">Monitoramento de lucros e pontualidade dos pagamentos.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-sm font-black">calendar_today</span>
          <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
            REFERÊNCIA: {today.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">TOTAL ESPERADO (CICLO ATUAL)</p>
          <p className="text-2xl font-black text-slate-900">
            R$ {metrics.totalExpected.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-green-200 shadow-sm border-l-4 border-l-primary bg-gradient-to-br from-white to-green-50/30">
          <p className="text-[10px] font-black text-primary-dark uppercase tracking-widest mb-1">RECEBIDO (LUCRO)</p>
          <p className="text-2xl font-black text-primary-dark">
            R$ {metrics.totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-sm border-l-4 border-l-red-500 bg-gradient-to-br from-white to-red-50/30">
          <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">PENDENTE OU VENCIDO</p>
          <p className="text-2xl font-black text-red-700">
             R$ {metrics.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-bg-light/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
                <th className="px-8 py-5">CLIENTE</th>
                <th className="px-8 py-5">VENCIMENTO</th>
                <th className="px-8 py-5 text-right">VALOR JUROS</th>
                <th className="px-8 py-5 text-center">STATUS</th>
                <th className="px-8 py-5 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activeLoans.map(loan => {
                const info = getLoanStatusForCurrentMonth(loan);
                return (
                  <tr key={loan.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="font-black text-slate-900">{loan.clientName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">PRINCIPAL: R$ {loan.amount.toLocaleString('pt-BR')}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-lg ${info.isLate ? 'text-red-500' : 'text-slate-400'}`}>
                          calendar_month
                        </span>
                        <div>
                          <p className={`text-sm font-black ${info.isLate ? 'text-red-600' : 'text-slate-700'}`}>
                            {info.displayDueDate.toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">CICLO ATUAL</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right font-black text-primary-dark">
                      R$ {info.expectedInterest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        {info.isPaid ? (
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-green-100 text-green-700">
                            PAGO
                          </span>
                        ) : (
                          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${info.isLate ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            <span className="material-symbols-outlined text-[12px]">{info.isLate ? 'history' : 'schedule'}</span>
                            {info.isLate ? 'ATRASADO' : 'PENDENTE'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        {!info.isPaid && (
                          <button 
                            onClick={() => setSelectedLoan(loan)}
                            className="bg-bg-dark text-white hover:bg-primary hover:text-bg-dark px-4 py-2 rounded-xl text-[10px] font-black transition-all shadow-md"
                          >
                            RECEBER / LANÇAR
                          </button>
                        )}
                        <button 
                          onClick={() => onViewDetails(loan.id)}
                          className="p-2 text-slate-400 hover:text-bg-dark transition-colors border border-slate-100 rounded-xl hover:bg-slate-50"
                          title="Detalhes do Contrato"
                        >
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Recebimento Reutilizada */}
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
                  SOMENTE JUROS
                </button>
                <button 
                  onClick={() => setPaymentType('TOTAL')}
                  className={`flex-1 py-3.5 rounded-[1.2rem] text-xs font-black uppercase tracking-widest transition-all ${
                    paymentType === 'TOTAL' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  AMORTIZAÇÃO
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
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">CONFIRMAR VALOR (R$)</label>
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

export default MonthlyControlView;
