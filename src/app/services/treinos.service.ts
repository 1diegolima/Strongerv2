import db, { type Treino, type TreinoExercicio, type Serie } from './db';

export interface SerieAPI extends Serie {}

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
  const treinos = await db.treinos.toArray();
  const result: TreinoAPI[] = [];

  for (const t of treinos) {
    const exerciciosRelacionados = await db.treino_exercicios
      .where('treinoId').equals(t.id!)
      .sortBy('ordem');

    const exerciciosFormatados: ExercicioTreinoAPI[] = [];
    
    for (const exRel of exerciciosRelacionados) {
      const exercicioInfo = await db.exercicios.get(exRel.exercicioId);
      if (exercicioInfo) {
        exerciciosFormatados.push({
          id: exRel.id!,
          exercicioId: exRel.exercicioId,
          exercicioNome: exercicioInfo.nome,
          grupoMuscular: exercicioInfo.grupo_muscular,
          ordem: exRel.ordem,
          seriesPlanejadas: exRel.seriesPlanejadas
        });
      }
    }

    result.push({
      ...t,
      id: t.id!,
      exercicios: exerciciosFormatados.length > 0 ? exerciciosFormatados : null,
      observacoes: t.observacoes || null
    });
  }

  return result;
};

export const getTreinoById = async (id: number | string): Promise<TreinoAPI> => {
  const numericId = typeof id === 'string' ? parseInt(id) : id;
  const t = await db.treinos.get(numericId);
  
  if (!t) throw new Error("Treino não encontrado");

  const exerciciosRelacionados = await db.treino_exercicios
    .where('treinoId').equals(t.id!)
    .sortBy('ordem');

  const exerciciosFormatados: ExercicioTreinoAPI[] = [];
  
  for (const exRel of exerciciosRelacionados) {
    const exercicioInfo = await db.exercicios.get(exRel.exercicioId);
    if (exercicioInfo) {
      exerciciosFormatados.push({
        id: exRel.id!,
        exercicioId: exRel.exercicioId,
        exercicioNome: exercicioInfo.nome,
        grupoMuscular: exercicioInfo.grupo_muscular,
        ordem: exRel.ordem,
        seriesPlanejadas: exRel.seriesPlanejadas
      });
    }
  }

  return {
    ...t,
    id: t.id!,
    exercicios: exerciciosFormatados.length > 0 ? exerciciosFormatados : null,
    observacoes: t.observacoes || null
  };
};

export const createTreino = async (data: TreinoInput): Promise<TreinoAPI> => {
  const novoTreino: Treino = {
    nome: data.nome,
    dia_semana: data.dia_semana || 0,
    observacoes: data.observacoes || null,
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString()
  };

  const newId = await db.treinos.add(novoTreino);
  return await getTreinoById(newId as number);
};

export const updateTreino = async (id: number, data: TreinoInput): Promise<TreinoAPI> => {
  await db.treinos.update(id, {
    ...data,
    atualizado_em: new Date().toISOString()
  });
  return await getTreinoById(id);
};

export const deleteTreino = async (id: number): Promise<void> => {
  await db.transaction('rw', db.treinos, db.treino_exercicios, async () => {
    // Cascade delete manually since Dexie standard tables don't do foreign key cascades natively
    await db.treino_exercicios.where({ treinoId: id }).delete();
    await db.treinos.delete(id);
  });
};

export const addExercicioAoTreino = async (
  treinoId: number | string,
  exercicioId: number,
  seriesPlanejadas: SerieAPI[]
): Promise<any> => {
  const numericTreinoId = typeof treinoId === 'string' ? parseInt(treinoId) : treinoId;
  
  // Find highest order to push at the end
  const currentExercises = await db.treino_exercicios.where({ treinoId: numericTreinoId }).toArray();
  const maxOrdem = currentExercises.length > 0 
    ? Math.max(...currentExercises.map(e => e.ordem))
    : 0;

  const novoExercicio: TreinoExercicio = {
    treinoId: numericTreinoId,
    exercicioId,
    ordem: maxOrdem + 1,
    seriesPlanejadas
  };

  await db.treino_exercicios.add(novoExercicio);
  return await getTreinoById(numericTreinoId);
};

export const removeExercicioDoTreino = async (
  treinoId: number | string,
  treinoExercicioId: number
): Promise<void> => {
  await db.treino_exercicios.delete(treinoExercicioId);
};

export const updateExercicioDoTreino = async (
  treinoId: number | string,
  treinoExercicioId: number,
  seriesPlanejadas: SerieAPI[],
  exercicioId: number,
): Promise<any> => {
  await db.treino_exercicios.update(treinoExercicioId, {
    seriesPlanejadas,
    exercicioId
  });
  return await getTreinoById(treinoId);
};

export const reorderExerciciosAPI = async (
  treinoId: number | string,
  items: { id: number; ordem: number }[]
): Promise<void> => {
  await db.transaction('rw', db.treino_exercicios, async () => {
    for (const item of items) {
      await db.treino_exercicios.update(item.id, { ordem: item.ordem });
    }
  });
};

export const getExercicios = async (): Promise<ExercicioAPI[]> => {
  return (await db.exercicios.toArray()).map(ex => ({
    id: ex.id!,
    nome: ex.nome,
    grupo_muscular: ex.grupo_muscular
  }));
};
