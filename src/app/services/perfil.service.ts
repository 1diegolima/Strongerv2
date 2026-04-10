import api from './api';

export interface PerfilAPI {
  id: number;
  usuario_id: number;
  nome: string;
  data_nascimento: string;
  altura_cm: number;
  sexo: 'M' | 'F';
  objetivo: string;
  peso_atual: number;
  criado_em: string;
  atualizado_em: string;
}

export interface PerfilInput {
  nome: string;
  data_nascimento?: string;
  altura_cm?: number;
  sexo?: 'M' | 'F';
  objetivo?: string;
  peso_atual?: number;
}

export const getPerfil = async (): Promise<PerfilAPI> => {
  const response = await api.get<PerfilAPI>('/perfil');
  return response.data;
};

export const savePerfil = async (data: PerfilInput): Promise<PerfilAPI> => {
  const response = await api.post<PerfilAPI>('/perfil', data);
  return response.data;
};

export const updatePerfil = async (id: number, data: PerfilInput): Promise<PerfilAPI> => {
  const response = await api.put<PerfilAPI>(`/perfil/${id}`, data);
  return response.data;
};
