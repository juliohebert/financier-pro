
import React, { useState, useMemo } from 'react';
import { GlobalUser, LicensePayment } from '../types';

const MOCK_USERS: GlobalUser[] = [
  { 
    id: '1', 
    name: 'Ricardo Financeiro', 
    email: 'ricardo@exemplo.com', 
    createdAt: '2023-10-01', 
    license: { 
      status: 'ATIVO', 
      planName: 'Anual', 
      trialStartDate: '2023-10-01',
      paymentHistory: [
        { id: 'pay_1', date: '2023-10-01', amount: 499.00, planName: 'Anual' }
      ]
    } 
  },
  { id: '2', name: 'Ana Empréstimos', email: 'ana@credito.com', createdAt: new Date(Date.now() - (5 * 24 * 60 * 60 * 1000)).toISOString(), license: { status: 'TESTE', planName: 'Teste', trialStartDate: new Date(Date.now() - (5 * 24 * 60 * 60 * 1000)).toISOString(), paymentHistory: [] } },
  { id: '3', name: 'Carlos Santos', email: 'carlos@santos.com', createdAt: '2023-09-20', license: { status: 'EXPIRADO', planName: 'Mensal', trialStartDate: '2023-09-20', paymentHistory: [] } },
  { 
    id: '4', 
    name: 'Beatriz Capital', 
    email: 'beatriz@cap.com', 
    createdAt: '2024-01-10', 
    license: { 
      status: 'ATIVO', 
      planName: 'Mensal', 
      trialStartDate: '2024-01-10',
      paymentHistory: [
        { id: 'pay_2', date: '2024-01-10', amount: 49.90, planName: 'Mensal' },
        { id: 'pay_3', date: '2024-02-10', amount: 49.90, planName: 'Mensal' }
      ]
    } 
  },
];

const AdminLicenseView: React.FC = () => {
  const [users, setUsers] = useState<GlobalUser[]>(MOCK_USERS);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'ATIVO' | 'PENDENTE_APROVACAO' | 'TESTE' | 'EXPIRADO'>('TODOS');
  const [showPlanConfig, setShowPlanConfig] = useState(false);
  const [selectedUserForPay, setSelectedUserForPay] = useState<GlobalUser | null>(null);
  const [viewingHistoryUser, setViewingHistoryUser] = useState<GlobalUser | null>(null);
  const [editingPasswordUser, setEditingPasswordUser] = useState<GlobalUser | null>(null);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  
  // States for New User
  const [newUser, setNewUser] = useState({ name: '', email: '', plan: 'Teste' });
  const [newPass, setNewPass] = useState('');

  const [plans, setPlans] = useState([
    { id: 'm', name: 'Mensal', price: 49.90 },
    { id: 'a', name: 'Anual', price: 499.00 }
  ]);

  const metrics = useMemo(() => {
    const activeUsers = users.filter(u => u.license.status === 'ATIVO');
    const mrr = activeUsers.reduce((acc, user) => {
      const plan = plans.find(p => p.name === user.license.planName);
      if (user.license.planName === 'Anual') {
        return acc + (plan ? plan.price / 12 : 0);
      }
      return acc + (plan ? plan.price : 0);
    }, 0);

    const testing = users.filter(u => u.license.status === 'TESTE').length;
    const expired = users.filter(u => u.license.status === 'EXPIRADO' || u.license.status === 'INATIVO').length;
    const pending = users.filter(u => u.license.status === 'PENDENTE_APROVACAO').length;
    const total = users.length;
    const conversionRate = total > 0 ? (activeUsers.length / total) * 100 : 0;

    return { mrr, testing, expired, pending, conversionRate };
  }, [users, plans]);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const user: GlobalUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: newUser.name,
      email: newUser.email,
      createdAt: new Date().toISOString(),
      license: {
        status: newUser.plan === 'Teste' ? 'TESTE' : 'ATIVO',
        planName: newUser.plan,
        trialStartDate: new Date().toISOString(),
        paymentHistory: []
      }
    };
    setUsers([user, ...users]);
    setShowCreateUserModal(false);
    setNewUser({ name: '', email: '', plan: 'Teste' });
    alert(`Acesso criado com sucesso para ${user.name}`);
  };

  const handleUpdatePassword = () => {
    if (!newPass) return;
    alert(`Senha de ${editingPasswordUser?.name} alterada para: ${newPass}`);
    setEditingPasswordUser(null);
    setNewPass('');
  };

  const handleUpdateStatus = (userId: string, newStatus: 'ATIVO' | 'EXPIRADO' | 'TESTE' | 'INATIVO') => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, license: { ...u.license, status: newStatus } } : u));
    if (newStatus === 'EXPIRADO' || newStatus === 'INATIVO') {
        alert('Licença suspensa. O usuário não terá mais acesso às ferramentas até a reativação.');
    }
  };

  const handleRegisterPayment = (userId: string, planName: string) => {
    const plan = plans.find(p => p.name === planName);
    const newPayment: LicensePayment = {
      id: `pay_${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString(),
      amount: plan ? plan.price : 0,
      planName: planName
    };

    setUsers(prev => prev.map(u => u.id === userId ? { 
      ...u, 
      license: { 
        ...u.license, 
        status: 'ATIVO', 
        planName: planName,
        paymentHistory: [...(u.license.paymentHistory || []), newPayment]
      } 
    } : u));
    setSelectedUserForPay(null);
  };

  const handleApprovePayment = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user || !user.license.pendingPlan) return;

    const plan = plans.find(p => p.name === user.license.pendingPlan);
    const newPayment: LicensePayment = {
      id: `pay_${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString(),
      amount: plan ? plan.price : 0,
      planName: user.license.pendingPlan
    };

    setUsers(prev => prev.map(u => u.id === userId ? { 
      ...u, 
      license: { 
        ...u.license, 
        status: 'ATIVO', 
        planName: user.license.pendingPlan || 'Teste',
        pendingPlan: undefined,
        paymentHistory: [...(u.license.paymentHistory || []), newPayment]
      } 
    } : u));
    alert(`✅ Pagamento aprovado! ${user.name} agora tem acesso ao plano ${user.license.pendingPlan}.`);
  };

  const handleRejectPayment = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setUsers(prev => prev.map(u => u.id === userId ? { 
      ...u, 
      license: { 
        ...u.license, 
        status: 'TESTE',
        pendingPlan: undefined
      } 
    } : u));
    alert(`❌ Pagamento rejeitado. ${user.name} voltou para o período de teste.`);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(filter.toLowerCase()) || u.email.toLowerCase().includes(filter.toLowerCase());
    const matchesStatus = statusFilter === 'TODOS' || u.license.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 max-w-[1200px] mx-auto animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-bg-dark tracking-tight flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-primary-dark">hub</span>
            Gestão da Plataforma
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Controle total sobre faturamento, acessos e usuários.</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setShowCreateUserModal(true)}
            className="flex items-center gap-2 bg-primary text-bg-dark px-6 h-14 rounded-2xl font-black hover:bg-primary-dark transition-all shadow-xl shadow-primary/20"
          >
            <span className="material-symbols-outlined font-bold">person_add</span>
            Novo Usuário
          </button>
          <button 
            onClick={() => setShowPlanConfig(!showPlanConfig)}
            className="flex items-center gap-2 bg-bg-dark text-white px-6 h-14 rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl"
          >
            <span className="material-symbols-outlined">payments</span>
            Preços
          </button>
        </div>
      </div>

      {showPlanConfig && (
        <div className="bg-white border-2 border-bg-dark p-8 rounded-[2.5rem] mb-10 animate-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-bg-dark">Tabela de Preços ao Consumidor</h3>
            <span className="bg-primary/10 text-primary-dark px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Configuração Global</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {plans.map((p) => (
              <div key={p.id} className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Valor Visível para o Plano {p.name}</label>
                <div className="flex items-center gap-4">
                   <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                      <input 
                        type="number" 
                        defaultValue={p.price}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) setPlans(prev => prev.map(item => item.id === p.id ? {...item, price: val} : item));
                        }}
                        className="w-full h-14 bg-white border border-slate-200 rounded-xl pl-12 pr-4 text-xl font-black text-slate-900"
                      />
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">MRR (Recorrência)</p>
          <p className="text-2xl font-black text-primary-dark">R$ {metrics.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Em Teste</p>
          <p className="text-2xl font-black text-blue-600">{metrics.testing}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pendentes</p>
          <p className="text-2xl font-black text-orange-600">{metrics.pending}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Conversão</p>
          <p className="text-2xl font-black text-green-600">{metrics.conversionRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Seção de Aprovações Pendentes */}
      {metrics.pending > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 p-8 rounded-[2.5rem] mb-10 animate-in slide-in-from-top-4">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-3xl text-orange-600">pending_actions</span>
            <div>
              <h3 className="text-xl font-black text-slate-900">Aprovações Pendentes</h3>
              <p className="text-sm text-slate-600 font-medium">{metrics.pending} pagamento(s) aguardando confirmação</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {users.filter(u => u.license.status === 'PENDENTE_APROVACAO').map(user => (
              <div key={user.id} className="bg-white p-6 rounded-2xl border border-orange-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-black text-lg">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-slate-900">{user.name}</p>
                    <p className="text-sm text-slate-600 font-medium">{user.email}</p>
                    <p className="text-xs text-orange-700 font-bold mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">payments</span>
                      Plano solicitado: {user.license.pendingPlan}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprovePayment(user.id)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 h-12 rounded-xl font-bold transition-all"
                  >
                    <span className="material-symbols-outlined">check_circle</span>
                    Aprovar
                  </button>
                  <button
                    onClick={() => handleRejectPayment(user.id)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 h-12 rounded-xl font-bold transition-all"
                  >
                    <span className="material-symbols-outlined">cancel</span>
                    Rejeitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-8 border-b bg-slate-50 flex flex-col lg:flex-row items-center gap-6">
          <div className="relative flex-1 w-full">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Buscar por cliente ou e-mail..."
              className="w-full h-14 bg-white border border-slate-200 rounded-2xl pl-12 pr-4 focus:ring-2 focus:ring-primary font-bold text-slate-900 shadow-inner"
            />
          </div>
          
          <div className="flex gap-2 bg-slate-200 p-1.5 rounded-2xl w-full lg:w-auto overflow-x-auto">
            {(['TODOS', 'ATIVO', 'PENDENTE_APROVACAO', 'TESTE', 'EXPIRADO'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`flex-1 lg:flex-none px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${
                  statusFilter === s ? 'bg-white text-bg-dark shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {s === 'PENDENTE_APROVACAO' ? 'PENDENTES' : s}
              </button>
            ))}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b bg-bg-light/50">
                <th className="px-8 py-5">Identificação</th>
                <th className="px-8 py-5 text-center">Plano</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Acumulado</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(user => {
                const totalRevenue = (user.license.paymentHistory || []).reduce((acc, pay) => acc + pay.amount, 0);
                
                return (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-bg-dark text-white flex items-center justify-center font-black">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-xs font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                        {user.license.planName}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${
                          user.license.status === 'ATIVO' ? 'bg-green-100 text-green-700' :
                          user.license.status === 'PENDENTE_APROVACAO' ? 'bg-orange-100 text-orange-700' :
                          user.license.status === 'EXPIRADO' || user.license.status === 'INATIVO' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {user.license.status === 'ATIVO' ? 'LICENCIADO' : 
                           user.license.status === 'PENDENTE_APROVACAO' ? 'AGUARDANDO' :
                           user.license.status === 'INATIVO' ? 'SUSPENSO' : 
                           user.license.status}
                        </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <p className={`font-black text-base ${totalRevenue > 0 ? 'text-primary-dark' : 'text-slate-300'}`}>
                         R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                       </p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setViewingHistoryUser(user)}
                          className="p-2.5 text-slate-400 hover:text-blue-500 transition-colors border border-slate-100 rounded-xl hover:bg-slate-50"
                          title="Extrato de Pagamentos"
                        >
                          <span className="material-symbols-outlined text-xl">history</span>
                        </button>
                        
                        <button 
                          onClick={() => setEditingPasswordUser(user)}
                          className="p-2.5 text-slate-400 hover:text-orange-500 transition-colors border border-slate-100 rounded-xl hover:bg-slate-50"
                          title="Alterar Senha"
                        >
                          <span className="material-symbols-outlined text-xl">key</span>
                        </button>

                        {user.license.status !== 'ATIVO' ? (
                          <button 
                            onClick={() => setSelectedUserForPay(user)}
                            className="bg-primary text-bg-dark h-11 px-5 rounded-xl text-[10px] font-black hover:bg-primary-dark transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                          >
                            <span className="material-symbols-outlined text-sm font-bold">check_circle</span>
                            RENOVAR
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleUpdateStatus(user.id, 'INATIVO')}
                            className="bg-red-50 text-red-500 h-11 px-5 rounded-xl text-[10px] font-black hover:bg-red-500 hover:text-white transition-all border border-red-100"
                          >
                            SUSPENDER
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CRIAR USUÁRIO */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-bg-dark/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setShowCreateUserModal(false)}>
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="mb-8">
              <h4 className="text-2xl font-black text-slate-900">Novo Acesso</h4>
              <p className="text-slate-500 font-medium">Cadastre um novo cliente manualmente.</p>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Nome Completo</label>
                <input required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full h-14 bg-bg-light border-none rounded-2xl px-6 font-bold text-slate-900 focus:ring-4 focus:ring-primary/20" placeholder="Ex: João da Silva" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">E-mail de Acesso</label>
                <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full h-14 bg-bg-light border-none rounded-2xl px-6 font-bold text-slate-900 focus:ring-4 focus:ring-primary/20" placeholder="joao@email.com" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Plano Inicial</label>
                <select value={newUser.plan} onChange={e => setNewUser({...newUser, plan: e.target.value})} className="w-full h-14 bg-bg-light border-none rounded-2xl px-6 font-black text-slate-900 focus:ring-4 focus:ring-primary/20 appearance-none">
                  <option value="Teste">Teste (14 dias)</option>
                  <option value="Mensal">Mensal (Ativo)</option>
                  <option value="Anual">Anual (Ativo)</option>
                </select>
              </div>
              <div className="pt-4 flex gap-4">
                 <button type="button" onClick={() => setShowCreateUserModal(false)} className="flex-1 h-14 border-2 border-slate-200 rounded-2xl font-black text-slate-400 hover:bg-slate-50">Cancelar</button>
                 <button type="submit" className="flex-1 h-14 bg-primary text-bg-dark rounded-2xl font-black shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">Criar Acesso</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ALTERAR SENHA */}
      {editingPasswordUser && (
        <div className="fixed inset-0 bg-bg-dark/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setEditingPasswordUser(null)}>
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
             <div className="text-center mb-8">
               <div className="size-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
                  <span className="material-symbols-outlined text-3xl font-bold">lock_reset</span>
               </div>
               <h4 className="text-2xl font-black text-slate-900 tracking-tight">Redefinir Senha</h4>
               <p className="text-slate-500 text-sm font-medium mt-1">Alterando credenciais de {editingPasswordUser.name}</p>
             </div>
             
             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Nova Senha Temporária</label>
                   <input 
                      type="text"
                      value={newPass}
                      onChange={e => setNewPass(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full h-16 bg-bg-light border-none rounded-2xl px-6 font-black text-xl text-slate-900 focus:ring-4 focus:ring-primary/20 transition-all"
                   />
                </div>
                
                <div className="pt-4 space-y-3">
                   <button 
                      onClick={handleUpdatePassword}
                      disabled={!newPass}
                      className="w-full bg-bg-dark text-white hover:bg-slate-800 disabled:opacity-30 h-14 rounded-2xl font-black transition-all"
                   >
                      Salvar Nova Senha
                   </button>
                   <button 
                      onClick={() => setEditingPasswordUser(null)}
                      className="w-full h-14 border-2 border-slate-200 text-slate-400 font-black rounded-2xl hover:bg-slate-50"
                   >
                      Cancelar
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* MODAL HISTÓRICO DE MENSALIDADES */}
      {viewingHistoryUser && (
        <div className="fixed inset-0 bg-bg-dark/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setViewingHistoryUser(null)}>
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl p-10 shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-start mb-8">
                <div>
                  <h4 className="text-2xl font-black text-slate-900">Extrato de Licença</h4>
                  <p className="text-slate-500 font-medium">Histórico de pagamentos de {viewingHistoryUser.name}</p>
                </div>
                <button onClick={() => setViewingHistoryUser(null)} className="text-slate-300 hover:text-danger p-2">
                  <span className="material-symbols-outlined text-3xl">close</span>
                </button>
             </div>

             <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {(viewingHistoryUser.license.paymentHistory || []).length > 0 ? (
                  (viewingHistoryUser.license.paymentHistory || []).map((pay) => (
                    <div key={pay.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                       <div className="flex items-center gap-4">
                          <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary-dark">
                             <span className="material-symbols-outlined">receipt_long</span>
                          </div>
                          <div>
                             <p className="font-black text-slate-900">Assinatura {pay.planName}</p>
                             <p className="text-xs text-slate-400 font-bold">{new Date(pay.date).toLocaleDateString('pt-BR')} às {new Date(pay.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="font-black text-lg text-primary-dark">R$ {pay.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          <p className="text-[9px] font-black text-slate-300 uppercase">Recebido</p>
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center text-slate-300">
                     <span className="material-symbols-outlined text-6xl block mb-2 opacity-20">payments</span>
                     <p className="font-bold uppercase text-xs">Nenhum registro de faturamento encontrado.</p>
                  </div>
                )}
             </div>

             <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase">Total Contribuído</p>
                   <p className="text-2xl font-black text-bg-dark">R$ {(viewingHistoryUser.license.paymentHistory || []).reduce((acc, p) => acc + p.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <button 
                  onClick={() => setViewingHistoryUser(null)}
                  className="bg-bg-dark text-white h-14 px-8 rounded-2xl font-black hover:bg-slate-800 transition-all"
                >
                  Fechar Extrato
                </button>
             </div>
          </div>
        </div>
      )}

      {/* MODAL REGISTRO DE PAGAMENTO */}
      {selectedUserForPay && (
        <div className="fixed inset-0 bg-bg-dark/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setSelectedUserForPay(null)}>
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-8">
              <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-dark">
                <span className="material-symbols-outlined text-3xl font-bold">verified</span>
              </div>
              <h4 className="text-2xl font-black text-slate-900 tracking-tight">Renovação de Licença</h4>
              <p className="text-slate-500 text-sm font-medium mt-1">Registrar pagamento direto de {selectedUserForPay.name}</p>
            </div>
            
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qual plano foi pago?</p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleRegisterPayment(selectedUserForPay.id, 'Mensal')}
                  className="p-6 border-2 border-slate-100 rounded-3xl hover:border-primary hover:bg-primary/5 transition-all text-center group"
                >
                  <p className="font-black text-slate-900">Mensal</p>
                  <p className="text-xs text-slate-500 font-bold">R$ {plans.find(p => p.id === 'm')?.price.toLocaleString('pt-BR')}</p>
                </button>
                <button 
                  onClick={() => handleRegisterPayment(selectedUserForPay.id, 'Anual')}
                  className="p-6 border-2 border-slate-100 rounded-3xl hover:border-primary hover:bg-primary/5 transition-all text-center group"
                >
                  <p className="font-black text-slate-900">Anual</p>
                  <p className="text-xs text-slate-500 font-bold">R$ {plans.find(p => p.id === 'a')?.price.toLocaleString('pt-BR')}</p>
                </button>
              </div>
              
              <button 
                onClick={() => setSelectedUserForPay(null)}
                className="w-full h-14 border-2 border-slate-200 text-slate-400 font-black rounded-2xl mt-4 hover:bg-slate-50 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLicenseView;
