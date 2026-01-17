
import React from 'react';
import { UserAuth } from '../types';
import { PlanPrices } from '../services/pricesService';

interface UpgradeViewProps {
  auth: UserAuth;
  onSubscribe: () => void;
  planPrices?: PlanPrices;
}

const UpgradeView: React.FC<UpgradeViewProps> = ({ auth, onSubscribe, planPrices = { mensal: 49.00, anual: 468.00 } }) => {
  const isExpired = auth.license.status === 'EXPIRADO';

  const getTrialDaysRemaining = () => {
    if (auth.license.status !== 'TESTE') return 0;
    
    // Usar comparação de dias de calendário ao invés de período de 24h
    const start = new Date(auth.license.trialStartDate);
    const now = new Date();
    
    // Zerar as horas para comparar apenas as datas
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const currentDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = currentDay.getTime() - startDay.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, 14 - diffDays);
  };

  const daysLeft = getTrialDaysRemaining();
  const monthlyPrice = planPrices.mensal;
  const annualPrice = planPrices.anual;
  const annualMonthlyPrice = annualPrice / 12;
  const savings = (monthlyPrice * 12) - annualPrice;

  return (
    <div className="p-8 max-w-[1000px] mx-auto animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary-dark text-xs font-black uppercase tracking-widest mb-4">
          <span className="material-symbols-outlined text-sm font-black">workspace_premium</span>
          {isExpired ? 'Licença Expirada' : `Acesso em Teste: ${daysLeft} dias restantes`}
        </div>
        <h1 className="text-4xl font-black text-bg-dark tracking-tight">
          {isExpired ? 'Seu período de teste acabou' : 'Eleve sua Gestão para o Próximo Nível'}
        </h1>
        <p className="text-slate-500 mt-4 text-lg font-medium max-w-2xl mx-auto">
          {isExpired 
            ? 'Para continuar acessando seus dados e gerindo seus empréstimos, escolha um dos planos abaixo.' 
            : 'Aproveite todas as funcionalidades pro e suporte prioritário ativando sua licença.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-[3rem] border border-slate-200 p-10 flex flex-col hover:border-primary/50 transition-all shadow-sm">
          <div className="mb-8">
            <h3 className="text-xl font-black text-slate-900">Plano Mensal</h3>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Ideal para iniciantes</p>
          </div>
          <div className="mb-8 flex items-baseline gap-1">
            <span className="text-4xl font-black text-bg-dark">R$ {monthlyPrice.toFixed(2).replace('.', ',')}</span>
            <span className="text-slate-400 font-bold">/mês</span>
          </div>
          <ul className="space-y-4 mb-10 flex-1">
            <li className="flex items-center gap-3 text-slate-600 font-medium">
              <span className="material-symbols-outlined text-primary font-bold">check_circle</span>
              Clientes e Empréstimos Ilimitados
            </li>
            <li className="flex items-center gap-3 text-slate-600 font-medium">
              <span className="material-symbols-outlined text-primary font-bold">check_circle</span>
              Dashboards e Relatórios
            </li>
            <li className="flex items-center gap-3 text-slate-600 font-medium">
              <span className="material-symbols-outlined text-primary font-bold">check_circle</span>
              Suporte via Ticket
            </li>
          </ul>
          <button 
            onClick={onSubscribe}
            className="w-full h-16 border-2 border-bg-dark text-bg-dark hover:bg-bg-dark hover:text-white rounded-[1.5rem] font-black transition-all text-lg"
          >
            Assinar Agora
          </button>
        </div>

        <div className="bg-bg-dark rounded-[3rem] p-10 flex flex-col relative overflow-hidden shadow-2xl scale-105">
          <div className="absolute top-0 right-0 bg-primary text-bg-dark px-6 py-2 rounded-bl-3xl font-black text-xs uppercase tracking-widest">
            MAIS VANTAJOSO
          </div>
          <div className="mb-8">
            <h3 className="text-xl font-black text-white">Plano Anual</h3>
            <p className="text-primary font-bold text-xs uppercase tracking-widest">Pague 10 meses, ganhe 12</p>
          </div>
          <div className="mb-8">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">R$ {annualPrice.toFixed(2).replace('.', ',')}</span>
              <span className="text-slate-400 font-bold">/ano</span>
            </div>
            <p className="text-primary font-bold text-xs mt-1">Economia de R$ {savings.toFixed(2).replace('.', ',')}</p>
          </div>
          <ul className="space-y-4 mb-10 flex-1">
            <li className="flex items-center gap-3 text-slate-300 font-medium">
              <span className="material-symbols-outlined text-primary font-bold">check_circle</span>
              Tudo do plano mensal
            </li>
            <li className="flex items-center gap-3 text-slate-300 font-medium">
              <span className="material-symbols-outlined text-primary font-bold">check_circle</span>
              Backup em Nuvem Diário
            </li>
            <li className="flex items-center gap-3 text-slate-300 font-medium">
              <span className="material-symbols-outlined text-primary font-bold">check_circle</span>
              Suporte Prioritário (WhatsApp)
            </li>
            <li className="flex items-center gap-3 text-slate-300 font-medium">
              <span className="material-symbols-outlined text-primary font-bold">check_circle</span>
              Acesso Antecipado a Recursos
            </li>
          </ul>
          <button 
            onClick={onSubscribe}
            className="w-full h-16 bg-primary text-bg-dark hover:bg-primary-dark rounded-[1.5rem] font-black transition-all text-lg shadow-xl shadow-primary/20"
          >
            Ativar Licença Anual
          </button>
        </div>
      </div>

      <div className="bg-slate-100 p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-bg-dark text-4xl">security</span>
          <div>
            <p className="font-black text-slate-900">Pagamento 100% Seguro</p>
            <p className="text-xs text-slate-500 font-bold">Processado de forma criptografada para sua segurança.</p>
          </div>
        </div>
        <div className="flex gap-4 opacity-50 grayscale">
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6" alt="Mastercard" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-5" alt="PayPal" />
        </div>
      </div>
    </div>
  );
};

export default UpgradeView;
