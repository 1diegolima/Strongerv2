import api from './api';

export interface SerieExecutadaAPI {
  reps: number;
  load: number;
  rir: number;
  isValid: boolean;
}

export interface ExercicioExecutadoAPI {
  exerciseId: string | number;
  sets: SerieExecutadaAPI[];
}

export interface SessaoAPI {
  id: number;
  usuario_id: number;
  treino_id: number;
  treino_nome: string;
  data_sessao: string;
  exercicios_executados: ExercicioExecutadoAPI[];
  completo: boolean;
  duracao_minutos: number | null;
  criado_em: string;
}

export interface SessaoInput {
  treino_id?: number | string;
  data_sessao?: string;
  exercicios_executados?: ExercicioExecutadoAPI[];
  completo?: boolean;
  duracao_minutos?: number;
}

export const getSessoes = async (): Promise<SessaoAPI[]> => {
  const response = await api.get<SessaoAPI[]>('/sessoes');
  return response.data;
};

export const createSessao = async (data: SessaoInput): Promise<SessaoAPI> => {
  const response = await api.post<SessaoAPI>('/sessoes', data);
  return response.data;
};
