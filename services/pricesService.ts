import api from './api';

export interface PlanPrices {
  mensal: number;
  anual: number;
}

export const pricesService = {
  getAll: async (): Promise<PlanPrices> => {
    const response = await api.get<PlanPrices>('/prices');
    return response.data;
  },

  update: async (prices: PlanPrices): Promise<PlanPrices> => {
    const response = await api.patch<PlanPrices>('/prices', prices);
    return response.data;
  }
};
