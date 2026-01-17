
import React from 'react';
import { AppView, UserAuth } from '../types';

interface SidebarProps {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  user?: UserAuth;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, user, onLogout }) => {
  const isAdmin = user?.role === 'ADMIN';

  const getTrialDaysRemaining = () => {
    if (!user || user.license.status !== 'TESTE') return 0;
    
    // Usar comparação de dias de calendário ao invés de período de 24h
    const start = new Date(user.license.trialStartDate);
    const now = new Date();
    
    // Zerar as horas para comparar apenas as datas
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const currentDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = currentDay.getTime() - startDay.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, 14 - diffDays);
  };

  const menuItems = isAdmin ? [
    { view: AppView.ADMIN_LICENSES, label: 'Gestão de Licenças', icon: 'admin_panel_settings' },
    { view: AppView.REPORTS, label: 'Métricas da Plataforma', icon: 'monitoring' },
  ] : [
    { view: AppView.DASHBOARD, label: 'Dashboard', icon: 'dashboard' },
    { view: AppView.MONTHLY_CONTROL, label: 'Controle de Juros', icon: 'event_repeat' },
    { view: AppView.CLIENTS, label: 'Clientes', icon: 'group' },
    { view: AppView.CASHFLOW, label: 'Fluxo de Caixa', icon: 'account_balance_wallet' },
    { view: AppView.LOANS, label: 'Novo Empréstimo', icon: 'payments' },
    { view: AppView.REPORTS, label: 'Relatórios', icon: 'analytics' },
  ];

  const trialDays = getTrialDaysRemaining();

  return (
    <aside className="w-64 border-r border-[#dbe6df] bg-white flex flex-col justify-between p-4 hidden md:flex">
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3 px-2">
          <div className="bg-primary rounded-lg p-2 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#102216] font-bold">account_balance</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-slate-900 text-base font-bold leading-none">Financier</h1>
            <p className="text-[#61896f] text-xs">{isAdmin ? 'Super-Admin Panel' : 'Gestão de Crédito'}</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <button
              key={item.view}
              onClick={() => onViewChange(item.view)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                activeView === item.view
                  ? 'bg-primary/20 text-[#111813] font-bold'
                  : 'hover:bg-[#f0f4f2] text-[#61896f] font-medium'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <p className="text-sm">{item.label}</p>
            </button>
          ))}
          
          <div className="mt-4 border-t border-[#dbe6df] pt-6 flex flex-col gap-2">
            {!isAdmin && (
              <>
                <button 
                  onClick={() => onViewChange(AppView.UPGRADE)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all w-full text-left ${
                    activeView === AppView.UPGRADE
                      ? 'bg-primary text-bg-dark font-black'
                      : 'bg-primary/10 text-primary-dark font-bold hover:bg-primary/20'
                  }`}
                >
                  <span className="material-symbols-outlined">workspace_premium</span>
                  <p className="text-sm">Assinatura</p>
                </button>
                
                <button 
                  onClick={() => onViewChange(AppView.SETTINGS)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left ${
                    activeView === AppView.SETTINGS
                      ? 'bg-primary/20 text-[#111813] font-bold'
                      : 'hover:bg-[#f0f4f2] text-[#61896f] font-medium'
                  }`}
                >
                  <span className="material-symbols-outlined">settings</span>
                  <p className="text-sm">Configurações</p>
                </button>
              </>
            )}

            {/* Botão de Logout para todos os papéis, mas com destaque no Super-Admin */}
            <button 
              onClick={onLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left text-red-400 hover:bg-red-50 font-bold mt-2"
            >
              <span className="material-symbols-outlined">logout</span>
              <p className="text-sm">Sair do Sistema</p>
            </button>
          </div>
        </nav>
      </div>

      <div className="p-2 bg-[#f0f4f2] rounded-xl flex items-center gap-3">
        <div 
          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-white ${isAdmin ? 'bg-bg-dark text-white' : 'bg-primary/20 text-bg-dark'}`}
        >
          <span className="material-symbols-outlined text-xl">{isAdmin ? 'shield_person' : 'person'}</span>
        </div>
        <div className="flex flex-col overflow-hidden">
          <p className="text-xs font-bold truncate">{user?.name || 'Usuário'}</p>
          {user?.license.status === 'TESTE' ? (
            <p className="text-[9px] text-orange-600 uppercase font-black">
               {trialDays} {trialDays === 1 ? 'dia restante' : 'dias restantes'}
            </p>
          ) : (
            <p className="text-[10px] text-[#61896f] uppercase font-black">{isAdmin ? 'Super-Admin' : 'Plano Ativo'}</p>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
