import api from './api';

export interface SerieAPI {
  minReps: number;
  maxReps: number;
  targetLoad: number;
  restTime: number;
}

export interface ExercicioTreinoAPI {
  id: number;
  exercicioId: number;
  exercicioNome: string;
  grupoMuscular: string;
  ordem: number;
  seriesPlanejadas: SerieAPI[];
}

export interface TreinoAPI {
  id: number;
  usuario_id: number;
  nome: string;
  dia_semana: number;
  observacoes: string | null;
  exercicios: ExercicioTreinoAPI[] | null;
  criado_em: string;
  atualizado_em: string;
}

export interface TreinoInput {
  nome: string;
  dia_semana?: number;
  observacoes?: string;
}

export interface ExercicioAPI {
  id: number;
  nome: string;
  grupo_muscular: string;
}

export const getTreinos = async (): Promise<TreinoAPI[]> => {
  const response = await api.get<TreinoAPI[]>('/treinos');
  return response.data;
};

export const getTreinoById = async (id: number | string): Promise<TreinoAPI> => {
  const response = await api.get<TreinoAPI>(`/treinos/${id}`);
  return response.data;
};

export const createTreino = async (data: TreinoInput): Promise<TreinoAPI> => {
  const response = await api.post<TreinoAPI>('/treinos', data);
  return response.data;
};

export const updateTreino = async (id: number, data: TreinoInput): Promise<TreinoAPI> => {
  const response = await api.put<TreinoAPI>(`/treinos/${id}`, data);
  return response.data;
};

export const deleteTreino = async (id: number): Promise<void> => {
  await api.delete(`/treinos/${id}`);
};

export const addExercicioAoTreino = async (
  treinoId: number | string,
  exercicioId: number,
  seriesPlanejadas: SerieAPI[]
): Promise<any> => {
  const response = await api.post(`/treinos/${treinoId}/exercicios`, {
    exercicioId,
    seriesPlanejadas,
  });
  return response.data;
};

export const removeExercicioDoTreino = async (
  treinoId: number | string,
  treinoExercicioId: number
): Promise<void> => {
  await api.delete(`/treinos/${treinoId}/exercicios/${treinoExercicioId}`);
};

export const updateExercicioDoTreino = async (
  treinoId: number | string,
  treinoExercicioId: number,
  seriesPlanejadas: SerieAPI[],
  exercicioId: number,
): Promise<any> => {
  const response = await api.put(`/treinos/${treinoId}/exercicios/${treinoExercicioId}`, {
    seriesPlanejadas,
    exercicioId,
  });
  return response.data;
};

export const reorderExerciciosAPI = async (
  treinoId: number | string,
  items: { id: number; ordem: number }[]
): Promise<void> => {
  await api.put(`/treinos/${treinoId}/exercicios/reorder`, { items });
};

export const getExercicios = async (): Promise<ExercicioAPI[]> => {
  const response = await api.get<ExercicioAPI[]>('/treinos/exercicios');
  return response.data;
};
