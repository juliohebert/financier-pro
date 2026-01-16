
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CLIENTS = 'CLIENTS',
  CLIENT_FORM = 'CLIENT_FORM',
  LOANS = 'LOANS',
  CASHFLOW = 'CASHFLOW',
  REPORTS = 'REPORTS',
  LOAN_DETAILS = 'LOAN_DETAILS',
  SETTINGS = 'SETTINGS',
  MONTHLY_CONTROL = 'MONTHLY_CONTROL',
  UPGRADE = 'UPGRADE',
  ADMIN_LICENSES = 'ADMIN_LICENSES'
}

export interface LicensePayment {
  id: string;
  date: string;
  amount: number;
  planName: string;
}

export interface LicenseInfo {
  status: 'TESTE' | 'ATIVO' | 'EXPIRADO' | 'INATIVO' | 'PENDENTE_APROVACAO';
  trialStartDate: string;
  expiryDate?: string;
  planName: string;
  paymentHistory?: LicensePayment[];
  pendingPlan?: string;
}

export interface UserAuth {
  isAuthenticated: boolean;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  license: LicenseInfo;
}

export interface GlobalUser {
  id: string;
  name: string;
  email: string;
  license: LicenseInfo;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  document: string;
  totalOpen: number;
  status: 'EM DIA' | 'ATRASADO';
  initials: string;
}

export interface PaymentEntry {
  id: string;
  date: string;
  value: number;
  type: 'JUROS' | 'AMORTIZACAO';
}

export interface Loan {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  interestRate: number;
  totalToReceive: number;
  amountPaid: number; 
  startDate: string;
  dueDate: string;
  status: 'ATIVO' | 'QUITADO' | 'ATRASADO';
  payments: PaymentEntry[];
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: 'ENTRADA' | 'SAÍDA';
  value: number;
  status: 'LIQUIDADO' | 'PAGO' | 'AGUARDANDO';
}

export interface AppSettings {
  defaultInterestRate: number;
}
