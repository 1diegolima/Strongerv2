import api from './api';

export interface PesoAPI {
  id: number;
  usuario_id: number;
  peso_kg: string;
  data_registro: string;
  observacao: string | null;
  criado_em: string;
}

export interface PesoInput {
  peso_kg: number;
  observacao?: string;
  data_registro?: string;
}

export const getPesos = async (): Promise<PesoAPI[]> => {
  const response = await api.get<PesoAPI[]>('/pesos');
  return response.data;
};

export const addPeso = async (data: PesoInput): Promise<PesoAPI> => {
  const response = await api.post<PesoAPI>('/pesos', data);
  return response.data;
};

export const deletePeso = async (id: number): Promise<void> => {
  await api.delete(`/pesos/${id}`);
};
