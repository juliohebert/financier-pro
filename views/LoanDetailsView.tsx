import React, { useState, useEffect } from 'react';
import { Loan, PaymentEntry, AppView } from '../types';
import axios from 'axios';

const API_URL = 'https://financier-ie3x.onrender.com';

interface LoanDetailsViewProps {
  loanId: string;
  onNavigate: (view: AppView) => void;
  token: string;
}

export default function LoanDetailsView({ loanId, onNavigate, token }: LoanDetailsViewProps) {
  const [loan, setLoan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState<'JUROS' | 'AMORTIZACAO'>('JUROS');
  const [paymentValue, setPaymentValue] = useState('');
  const [observation, setObservation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadLoanDetails();
  }, [loanId]);

  const loadLoanDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/loans/${loanId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLoan(response.data);
    } catch (error) {
      console.error('Erro ao carregar detalhes do empréstimo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentValue || parseFloat(paymentValue) <= 0) {
      alert('Informe um valor válido para o pagamento');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        `${API_URL}/loans/${loanId}/payments`,
        {
          tipo: paymentType,
          valor_pago: parseFloat(paymentValue),
          observacao: observation || null
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Pagamento registrado com sucesso!');
      setShowPaymentModal(false);
      setPaymentValue('');
      setObservation('');
      loadLoanDetails(); // Recarregar dados
    } catch (error: any) {
      console.error('Erro ao registrar pagamento:', error);
      alert(error.response?.data?.error || 'Erro ao registrar pagamento');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="p-8">
        <p className="text-red-500">Empréstimo não encontrado</p>
        <button
          onClick={() => onNavigate(AppView.LOANS)}
          className="mt-4 text-primary underline"
        >
          Voltar para empréstimos
        </button>
      </div>
    );
  }

  const jurosDevidos = (loan.saldo_devedor * loan.taxa_juros) / 100;
  const totalDevido = loan.saldo_devedor + jurosDevidos;
  const isOverdue = new Date(loan.data_vencimento) < new Date() && loan.status === 'ATIVO';

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <button
            onClick={() => onNavigate(AppView.LOANS)}
            className="text-slate-500 hover:text-slate-700 mb-4 flex items-center gap-2"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Voltar
          </button>
          <h1 className="text-4xl font-black tracking-tight text-bg-dark">
            Detalhes do Empréstimo
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Cliente: {loan.nome_cliente}
          </p>
        </div>
        
        {loan.status === 'ATIVO' && (
          <button
            onClick={() => setShowPaymentModal(true)}
            className="h-14 px-8 bg-primary hover:bg-primary-dark text-white font-black rounded-2xl transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined">payments</span>
            Registrar Pagamento
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resumo Financeiro */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-6">Resumo Financeiro</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-2">
                  Valor Principal Inicial
                </p>
                <p className="text-2xl font-black text-slate-900">
                  R$ {parseFloat(loan.valor_principal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div>
                <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-2">
                  Saldo Devedor Atual
                </p>
                <p className="text-2xl font-black text-primary">
                  R$ {parseFloat(loan.saldo_devedor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div>
                <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-2">
                  Taxa de Juros
                </p>
                <p className="text-2xl font-black text-slate-900">
                  {loan.taxa_juros}% ao mês
                </p>
              </div>

              <div>
                <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-2">
                  Juros do Período
                </p>
                <p className="text-2xl font-black text-orange-600">
                  R$ {jurosDevidos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div>
                <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-2">
                  Data de Vencimento
                </p>
                <p className={`text-2xl font-black ${isOverdue ? 'text-red-600' : 'text-slate-900'}`}>
                  {new Date(loan.data_vencimento).toLocaleDateString('pt-BR')}
                  {isOverdue && <span className="text-sm ml-2">(ATRASADO)</span>}
                </p>
              </div>

              <div>
                <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-2">
                  Status
                </p>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-black ${
                  loan.status === 'QUITADO' ? 'bg-green-100 text-green-800' :
                  loan.status === 'ATRASADO' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {loan.status}
                </span>
              </div>
            </div>

            {loan.status === 'ATIVO' && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="bg-primary/5 p-6 rounded-2xl border border-dashed border-primary/20">
                  <h3 className="font-black text-slate-900 text-sm flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary text-sm">lightbulb</span>
                    Opções de Pagamento no Vencimento
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Opção 1: Pagar apenas juros</span>
                      <span className="font-bold text-orange-600">
                        R$ {jurosDevidos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Opção 2: Quitar tudo (principal + juros)</span>
                      <span className="font-bold text-primary">
                        R$ {totalDevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Histórico de Pagamentos */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-6">Histórico de Pagamentos</h2>
            
            {loan.payments && loan.payments.length > 0 ? (
              <div className="space-y-4">
                {loan.payments.map((payment: any) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        payment.tipo === 'JUROS' ? 'bg-orange-100' : 'bg-green-100'
                      }`}>
                        <span className={`material-symbols-outlined ${
                          payment.tipo === 'JUROS' ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {payment.tipo === 'JUROS' ? 'percent' : 'payments'}
                        </span>
                      </div>
                      <div>
                        <p className="font-black text-slate-900">
                          {payment.tipo === 'JUROS' ? 'Pagamento de Juros' : 'Amortização (Principal + Juros)'}
                        </p>
                        <p className="text-sm text-slate-500">
                          {new Date(payment.data_pagamento).toLocaleDateString('pt-BR')}
                        </p>
                        {payment.observacao && (
                          <p className="text-xs text-slate-400 mt-1">{payment.observacao}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-slate-900">
                        R$ {parseFloat(payment.valor_pago).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-slate-400">
                        Juros: R$ {parseFloat(payment.valor_juros).toFixed(2)} | Principal: R$ {parseFloat(payment.valor_principal).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">Nenhum pagamento registrado ainda</p>
            )}
          </div>
        </div>

        {/* Sidebar com Informações Adicionais */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-black text-slate-900 mb-4">Informações do Cliente</h3>
            <p className="text-lg font-bold text-slate-700">{loan.nome_cliente}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-black text-slate-900 mb-4">Datas</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Data de Liberação</p>
                <p className="text-sm font-bold text-slate-700">
                  {new Date(loan.data_inicio).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Próximo Vencimento</p>
                <p className="text-sm font-bold text-slate-700">
                  {new Date(loan.data_vencimento).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-2xl border border-primary/20">
            <span className="material-symbols-outlined text-primary mb-2">info</span>
            <h3 className="font-black text-slate-900 mb-2">Como funciona?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No vencimento, o cliente pode escolher entre:<br/>
              <strong>1.</strong> Pagar apenas os juros (mantém o principal em aberto)<br/>
              <strong>2.</strong> Quitar tudo (principal + juros)
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Pagamento */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Registrar Pagamento</h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 uppercase tracking-wider">
                  Tipo de Pagamento <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentType}
                  onChange={(e) => {
                    setPaymentType(e.target.value as 'JUROS' | 'AMORTIZACAO');
                    if (e.target.value === 'JUROS') {
                      setPaymentValue(jurosDevidos.toFixed(2));
                    } else {
                      setPaymentValue(totalDevido.toFixed(2));
                    }
                  }}
                  className="w-full h-14 bg-bg-light border-none rounded-xl px-4 focus:ring-2 focus:ring-primary font-bold text-slate-900"
                >
                  <option value="JUROS">Apenas Juros (R$ {jurosDevidos.toFixed(2)})</option>
                  <option value="AMORTIZACAO">Quitação Total (R$ {totalDevido.toFixed(2)})</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 uppercase tracking-wider">
                  Valor Pago <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentValue}
                    onChange={(e) => setPaymentValue(e.target.value)}
                    className="w-full h-14 bg-bg-light border-none rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-primary font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 uppercase tracking-wider">
                  Observação (Opcional)
                </label>
                <textarea
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  className="w-full h-24 bg-bg-light border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary font-medium text-slate-900 resize-none"
                  placeholder="Adicione uma observação sobre este pagamento..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  disabled={submitting}
                  className="flex-1 h-14 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black rounded-xl transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePayment}
                  disabled={submitting}
                  className="flex-1 h-14 bg-primary hover:bg-primary-dark text-white font-black rounded-xl transition-all disabled:opacity-50"
                >
                  {submitting ? 'Processando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
