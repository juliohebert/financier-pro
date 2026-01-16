
import React, { useState, useMemo, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import ClientsView from './views/ClientsView';
import ClientFormView from './views/ClientFormView';
import LoansView from './views/LoansView';
import CashFlowView from './views/CashFlowView';
import ReportsView from './views/ReportsView';
import LoanDetailsView from './views/LoanDetailsView';
import SettingsView from './views/SettingsView';
import MonthlyControlView from './views/MonthlyControlView';
import AuthView from './views/AuthView';
import UpgradeView from './views/UpgradeView';
import AdminLicenseView from './views/AdminLicenseView';
import { AppView, Client, Transaction, Loan, PaymentEntry, AppSettings, UserAuth } from './types';
import { authService, clientsService, loansService, transactionsService } from './services';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Erro capturado pelo ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-bg-light">
          <div className="max-w-md p-8 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Ops! Algo deu errado</h1>
            <p className="text-gray-700 mb-4">Ocorreu um erro na aplicação. Por favor, recarregue a página.</p>
            <details className="mb-4">
              <summary className="cursor-pointer text-sm text-gray-500">Detalhes do erro</summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                {this.state.error?.toString()}
              </pre>
            </details>
            <button 
              onClick={() => window.location.reload()} 
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const INITIAL_CLIENTS: Omit<Client, 'totalOpen' | 'status'>[] = [
  { id: '1', name: 'João Silva', document: '123.456.789-00', initials: 'JS' },
  { id: '2', name: 'Maria Oliveira', document: '987.654.321-11', initials: 'MO' },
  { id: '3', name: 'Tech Solutions LTDA', document: '12.345.678/0001-99', initials: 'TS' },
];

const App: React.FC = () => {
  const [auth, setAuth] = useState<UserAuth>({
    isAuthenticated: authService.isAuthenticated(),
    name: '',
    email: '',
    role: 'USER',
    license: {
      status: 'TESTE',
      trialStartDate: new Date().toISOString(),
      planName: 'Teste'
    }
  });

  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [preSelectedClientId, setPreSelectedClientId] = useState<string>('');
  const [baseClients, setBaseClients] = useState<Omit<Client, 'totalOpen' | 'status'>[]>(INITIAL_CLIENTS);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ defaultInterestRate: 5 });
  const [isLoadingData, setIsLoadingData] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  // Carregar dados do backend ao fazer login
  useEffect(() => {
    const loadData = async () => {
      if (!auth.isAuthenticated) return;
      
      setIsLoadingData(true);
      try {
        // Carregar dados em paralelo
        const [clientsData, loansData, transactionsData] = await Promise.all([
          clientsService.getAll().catch(err => {
            console.warn('Erro ao carregar clientes, usando dados locais:', err);
            return [];
          }),
          loansService.getAll().catch(err => {
            console.warn('Erro ao carregar empréstimos, usando dados locais:', err);
            return [];
          }),
          transactionsService.getAll().catch(err => {
            console.warn('Erro ao carregar transações, usando dados locais:', err);
            return [];
          })
        ]);

        // Atualizar estados apenas se recebeu dados
        if (clientsData && clientsData.length > 0) {
          const mappedClients = clientsData.map(c => ({
            id: c.id?.toString() || '',
            name: c.nome || '',
            document: c.documento || '',
            initials: (c.nome?.split(' ')[0][0] + (c.nome?.split(' ').pop()?.[0] || '')).toUpperCase()
          }));
          setBaseClients(mappedClients);
        }

        if (loansData && loansData.length > 0) {
          const mappedLoans = loansData.map(l => ({
            id: l.id?.toString() || '',
            clientId: l.cliente_id?.toString() || '',
            clientName: l.nome_cliente || '',
            amount: Number(l.valor_emprestado) || 0,
            interestRate: Number(l.taxa_juros) || 5,
            startDate: l.data_liberacao || today,
            dueDate: l.data_vencimento || today,
            totalToReceive: Number(l.valor_total) || 0,
            amountPaid: Number(l.valor_pago) || 0,
            status: l.status || 'ATIVO',
            payments: []
          }));
          setLoans(mappedLoans);
        }

        if (transactionsData && transactionsData.length > 0) {
          const mappedTransactions = transactionsData.map(t => ({
            id: t.id?.toString() || '',
            date: t.data || today,
            description: t.descricao || '',
            category: t.categoria || '',
            type: t.tipo || 'ENTRADA',
            value: Number(t.valor) || 0,
            status: 'LIQUIDADO'
          }));
          setTransactions(mappedTransactions);
        }

        console.log('✅ Dados carregados do backend:', {
          clientes: clientsData?.length || 0,
          empréstimos: loansData?.length || 0,
          transações: transactionsData?.length || 0
        });
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [auth.isAuthenticated]);

  useEffect(() => {
    try {
      if (auth.isAuthenticated && auth.role === 'USER' && auth.license.status === 'TESTE') {
        const start = new Date(auth.license.trialStartDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 14) {
          setAuth(prev => ({
            ...prev,
            license: { ...prev.license, status: 'EXPIRADO' }
          }));
        }
      }
    } catch (error) {
      console.error('Erro ao verificar licença:', error);
    }
  }, [auth.isAuthenticated]);

  const processedLoans = useMemo(() => {
    return loans.map(loan => {
      const isPaid = loan.amountPaid >= loan.totalToReceive;
      const isLate = loan.dueDate < today && !isPaid;
      return { 
        ...loan, 
        status: isPaid ? 'QUITADO' : (isLate ? 'ATRASADO' : 'ATIVO') 
      } as Loan;
    });
  }, [loans, today]);

  const processedClients = useMemo(() => {
    return baseClients.map(client => {
      const clientLoans = processedLoans.filter(l => l.clientId === client.id && l.status !== 'QUITADO');
      const totalOpen = clientLoans.reduce((sum, l) => sum + (l.totalToReceive - l.amountPaid), 0);
      const isLate = clientLoans.some(l => l.status === 'ATRASADO');
      
      return {
        ...client,
        totalOpen,
        status: isLate ? 'ATRASADO' : 'EM DIA'
      } as Client;
    });
  }, [baseClients, processedLoans]);

  const stats = useMemo(() => {
    const principalOut = processedLoans.reduce((acc, l) => {
      const principalPaid = l.payments.filter(p => p.type === 'AMORTIZACAO').reduce((sum, p) => sum + p.value, 0);
      return acc + (l.status !== 'QUITADO' ? (l.amount - principalPaid) : 0);
    }, 0);

    const interestPending = processedLoans.reduce((acc, l) => {
      if (l.status === 'QUITADO') return acc;
      const interestPaid = l.payments.filter(p => p.type === 'JUROS').reduce((sum, p) => sum + p.value, 0);
      const totalInterest = l.totalToReceive - l.amount;
      return acc + Math.max(0, totalInterest - interestPaid);
    }, 0);

    const totalReceived = transactions.reduce((acc, t) => t.category === 'Recebimento' ? acc + t.value : acc, 0);
    const totalBalance = transactions.reduce((acc, t) => t.type === 'ENTRADA' ? acc + t.value : acc - t.value, 0);

    return { totalBalance, principalOut, interestPending, totalReceived };
  }, [transactions, processedLoans]);

  const handleNavigate = (view: AppView, clientId?: string) => {
    setPreSelectedClientId(clientId || '');
    setCurrentView(view);
  };

  const handleLogin = (email: string, isAdmin: boolean) => {
    const user = authService.getCurrentUser();
    setAuth(prev => ({
      ...prev,
      isAuthenticated: true,
      email: user?.email || email,
      role: isAdmin ? 'ADMIN' : 'USER',
      name: user?.nome || email.split('@')[0].toUpperCase(),
      license: isAdmin ? { status: 'ATIVO', planName: 'Super-Admin', trialStartDate: '' } : prev.license
    }));
    if (isAdmin) {
      setCurrentView(AppView.ADMIN_LICENSES);
    } else {
      setCurrentView(AppView.DASHBOARD);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setAuth({
      isAuthenticated: false,
      name: '',
      email: '',
      role: 'USER',
      license: {
        status: 'TESTE',
        trialStartDate: new Date().toISOString(),
        planName: 'Teste'
      }
    });
    setBaseClients(INITIAL_CLIENTS);
    setLoans([]);
    setTransactions([]);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleSubscribe = () => {
    setAuth(prev => ({
      ...prev,
      license: {
        ...prev.license,
        status: 'ATIVO',
        planName: 'Pro Anual'
      }
    }));
    setCurrentView(AppView.DASHBOARD);
  };

  const handleRegisterPayment = async (loanId: string, value: number, isInterestOnly: boolean) => {
    try {
      const paymentDate = today;
      const targetLoan = loans.find(l => l.id === loanId);
      
      if (!targetLoan) return;

      // Tentar registrar pagamento no backend
      await loansService.registerPayment(loanId, {
        valor: value,
        tipo_pagamento: isInterestOnly ? 'JUROS' : 'AMORTIZACAO',
        data_pagamento: paymentDate
      }).catch(err => {
        console.warn('Erro ao registrar pagamento na API, salvando localmente:', err);
      });

      // Atualizar estado local
      const newPayment: PaymentEntry = {
        id: Math.random().toString(36).substr(2, 9),
        date: paymentDate,
        value: value,
        type: isInterestOnly ? 'JUROS' : 'AMORTIZACAO'
      };

      setLoans(prev => prev.map(loan => {
        if (loan.id === loanId) {
          let newDueDate = loan.dueDate;
          if (isInterestOnly) {
            const d = new Date(loan.dueDate);
            d.setMonth(d.getMonth() + 1);
            newDueDate = d.toISOString().split('T')[0];
          }
          return { 
            ...loan, 
            dueDate: newDueDate,
            amountPaid: loan.amountPaid + value,
            payments: [...loan.payments, newPayment]
          };
        }
        return loan;
      }));

      // Registrar transação de entrada
      await transactionsService.create({
        data_transacao: paymentDate,
        descricao: `${isInterestOnly ? 'Juros' : 'Amortização'}: ${targetLoan.clientName}`,
        categoria: 'Recebimento',
        tipo_transacao: 'ENTRADA',
        valor: value
      }).catch(err => console.warn('Erro ao criar transação:', err));

      setTransactions(prev => [...prev, {
        id: `T-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        date: paymentDate,
        description: `${isInterestOnly ? 'Juros' : 'Amortização'}: ${targetLoan.clientName}`,
        category: 'Recebimento',
        type: 'ENTRADA',
        value: value,
        status: 'LIQUIDADO'
      }]);
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      alert('Erro ao registrar pagamento. Tente novamente.');
    }
  };

  const handleViewLoanDetails = (loanId: string) => {
    setSelectedLoanId(loanId);
    setCurrentView(AppView.LOAN_DETAILS);
  };

  if (!auth.isAuthenticated) {
    return <AuthView onLogin={handleLogin} />;
  }

  const accessDenied = auth.role === 'USER' && (auth.license.status === 'EXPIRADO' || auth.license.status === 'INATIVO') && currentView !== AppView.UPGRADE;

  return (
    <div className="flex h-screen overflow-hidden bg-bg-light">
      <Sidebar activeView={currentView} onViewChange={(view) => handleNavigate(view)} user={auth} onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto relative">
        {isLoadingData && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium">Carregando dados...</p>
            </div>
          </div>
        )}
        {accessDenied ? (
          <UpgradeView auth={auth} onSubscribe={handleSubscribe} />
        ) : (
          <>
            {currentView === AppView.DASHBOARD && auth.role === 'USER' && (
              <Dashboard 
                onNavigate={(view) => handleNavigate(view)} 
                stats={stats} 
                loans={processedLoans} 
                onPayment={handleRegisterPayment}
                onViewDetails={handleViewLoanDetails}
              />
            )}
            {currentView === AppView.MONTHLY_CONTROL && auth.role === 'USER' && (
              <MonthlyControlView 
                loans={processedLoans}
                onViewDetails={handleViewLoanDetails}
                onNavigate={handleNavigate}
                onPayment={handleRegisterPayment}
              />
            )}
            {currentView === AppView.CLIENTS && auth.role === 'USER' && (
              <ClientsView 
                onNavigate={(view, cid) => handleNavigate(view, cid)} 
                clients={processedClients} 
              />
            )}
            {currentView === AppView.CLIENT_FORM && auth.role === 'USER' && <ClientFormView onNavigate={(view) => handleNavigate(view)} onAddClient={async (c) => {
               try {
                 const initials = (c.name.split(' ')[0][0] + (c.name.split(' ').pop()?.[0] || '')).toUpperCase();
                 
                 // Tentar criar no backend
                 const novoCliente = await clientsService.create({
                   nome: c.name,
                   documento: c.document
                 }).catch(err => {
                   console.warn('Erro ao criar cliente na API, salvando localmente:', err);
                   return null;
                 });

                 if (novoCliente) {
                   // Adicionar cliente com ID do backend
                   setBaseClients(prev => [{
                     id: novoCliente.id?.toString() || Math.random().toString(36).substr(2, 9),
                     name: novoCliente.nome || c.name,
                     document: novoCliente.documento || c.document,
                     initials
                   }, ...prev]);
                 } else {
                   // Fallback: adicionar localmente
                   setBaseClients(prev => [{
                     ...c,
                     id: Math.random().toString(36).substr(2, 9),
                     initials
                   }, ...prev]);
                 }
                 
                 setCurrentView(AppView.CLIENTS);
               } catch (error) {
                 console.error('Erro ao adicionar cliente:', error);
                 alert('Erro ao adicionar cliente. Tente novamente.');
               }
            }} />}
            {currentView === AppView.LOANS && auth.role === 'USER' && (
              <LoansView 
                clients={processedClients} 
                onAddLoan={async (loan) => {
                  try {
                    // Tentar criar no backend
                    const novoEmprestimo = await loansService.create({
                      cliente_id: parseInt(loan.clientId),
                      nome_cliente: loan.clientName,
                      valor_principal: loan.amount,
                      taxa_juros: loan.interestRate,
                      data_inicio: loan.startDate,
                      data_vencimento: loan.dueDate,
                      total_receber: loan.totalToReceive
                    }).catch(err => {
                      console.warn('Erro ao criar empréstimo na API, salvando localmente:', err);
                      return null;
                    });

                    if (novoEmprestimo) {
                      // Adicionar empréstimo com ID do backend
                      const newLoan: Loan = {
                        id: novoEmprestimo.id?.toString() || `L-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
                        clientId: loan.clientId,
                        clientName: loan.clientName,
                        amount: loan.amount,
                        interestRate: loan.interestRate,
                        startDate: loan.startDate,
                        dueDate: loan.dueDate,
                        totalToReceive: loan.totalToReceive,
                        status: 'ATIVO',
                        amountPaid: 0,
                        payments: []
                      };
                      setLoans(prev => [newLoan, ...prev]);

                      // Registrar transação de saída
                      await transactionsService.create({
                        data_transacao: loan.startDate,
                        descricao: `Empréstimo Liberado: ${loan.clientName}`,
                        categoria: 'Empréstimos',
                        tipo_transacao: 'SAIDA',
                        valor: loan.amount
                      }).catch(err => console.warn('Erro ao criar transação:', err));

                      setTransactions(prev => [...prev, {
                        id: `T-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
                        date: loan.startDate,
                        description: `Empréstimo Liberado: ${loan.clientName}`,
                        category: 'Empréstimos',
                        type: 'SAÍDA',
                        value: loan.amount,
                        status: 'LIQUIDADO'
                      }]);
                    } else {
                      // Fallback: adicionar localmente
                      const newLoan: Loan = {
                        ...loan,
                        id: `L-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
                        status: 'ATIVO',
                        amountPaid: 0,
                        payments: []
                      };
                      setLoans(prev => [newLoan, ...prev]);
                      setTransactions(prev => [...prev, {
                        id: `T-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
                        date: loan.startDate,
                        description: `Empréstimo Liberado: ${loan.clientName}`,
                        category: 'Empréstimos',
                        type: 'SAÍDA',
                        value: loan.amount,
                        status: 'LIQUIDADO'
                      }]);
                    }

                    setCurrentView(AppView.DASHBOARD);
                  } catch (error) {
                    console.error('Erro ao adicionar empréstimo:', error);
                    alert('Erro ao adicionar empréstimo. Tente novamente.');
                  }
                }} 
                onNavigate={(view) => handleNavigate(view)} 
                defaultInterest={settings.defaultInterestRate}
                preSelectedClientId={preSelectedClientId}
              />
            )}
            {currentView === AppView.CASHFLOW && auth.role === 'USER' && <CashFlowView transactions={transactions} />}
            {currentView === AppView.REPORTS && (
               auth.role === 'ADMIN' 
               ? <div className="p-20 text-center text-slate-400 font-bold uppercase">Métricas da Plataforma (Em Breve)</div>
               : <ReportsView clients={processedClients} />
            )}
            {currentView === AppView.SETTINGS && <SettingsView settings={settings} onUpdateSettings={setSettings} />}
            {currentView === AppView.LOAN_DETAILS && auth.role === 'USER' && processedLoans.find(l => l.id === selectedLoanId) && (
              <LoanDetailsView 
                loan={processedLoans.find(l => l.id === selectedLoanId)!} 
                onNavigate={(view) => handleNavigate(view)} 
                onPayment={handleRegisterPayment}
              />
            )}
            {currentView === AppView.UPGRADE && auth.role === 'USER' && <UpgradeView auth={auth} onSubscribe={handleSubscribe} />}
            {currentView === AppView.ADMIN_LICENSES && auth.role === 'ADMIN' && <AdminLicenseView />}
          </>
        )}
      </main>
    </div>
  );
};

const AppWithErrorBoundary = () => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

export default AppWithErrorBoundary;
