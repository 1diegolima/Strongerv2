import db, { type Sessao, type ExercicioExecutado, type SerieExecutada } from './db';
import { getTreinoById } from './treinos.service';

export interface SerieExecutadaAPI extends SerieExecutada {}

export interface ExercicioExecutadoAPI extends ExercicioExecutado {}

export interface SessaoAPI extends Sessao {}

export interface SessaoInput {
  treino_id?: number | string;
  data_sessao?: string;
  exercicios_executados?: ExercicioExecutadoAPI[];
  completo?: boolean;
  duracao_minutos?: number;
}

export const getSessoes = async (): Promise<SessaoAPI[]> => {
  // Sort by execution date descending
  return await db.sessoes.orderBy('data_sessao').reverse().toArray();
};

export const createSessao = async (data: SessaoInput): Promise<SessaoAPI> => {
  const numericTreinoId = typeof data.treino_id === 'string' ? parseInt(data.treino_id) : data.treino_id;
  
  if (!numericTreinoId) {
    throw new Error("ID do treino ausente");
  }

  // Fetch the workout name statically so the history shows the original name even if it's renamed later
  let treinoNome = "Treino Avulso";
  try {
    const treinoObj = await getTreinoById(numericTreinoId);
    treinoNome = treinoObj.nome;
  } catch (e) {
    // ignore
  }

  const novaSessao: Sessao = {
    treino_id: numericTreinoId,
    treino_nome: treinoNome,
    data_sessao: data.data_sessao || new Date().toISOString().split('T')[0],
    exercicios_executados: data.exercicios_executados || [],
    completo: data.completo || false,
    duracao_minutos: data.duracao_minutos || null,
    criado_em: new Date().toISOString()
  };

  const id = await db.sessoes.add(novaSessao);
  novaSessao.id = id as number;
  return novaSessao;
};
