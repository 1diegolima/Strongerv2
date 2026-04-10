import Dexie, { type EntityTable } from 'dexie';

// --- Data Models ---

export interface Perfil {
  id?: number;
  nome: string;
  data_nascimento?: string;
  altura_cm?: number;
  sexo?: 'M' | 'F';
  objetivo?: string;
  peso_atual?: number;
  criado_em: string;
  atualizado_em: string;
}

export interface Peso {
  id?: number;
  peso_kg: string | number; // Accept both, but keep consistent in operations
  data_registro: string;
  observacao?: string | null;
  criado_em: string;
}

export interface Exercicio {
  id?: number;
  nome: string;
  grupo_muscular: string;
}

export interface Serie {
  minReps: number;
  maxReps: number;
  targetLoad: number;
  restTime: number;
}

export interface Treino {
  id?: number;
  nome: string;
  dia_semana: number;
  observacoes?: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface TreinoExercicio {
  id?: number;
  treinoId: number;
  exercicioId: number;
  ordem: number;
  seriesPlanejadas: Serie[]; // Will be stored as an array directly (Dexie supports objects/arrays natively)
}

export interface SerieExecutada {
  reps: number;
  load: number;
  rir: number;
  isValid: boolean;
}

export interface ExercicioExecutado {
  exerciseId: string | number;
  sets: SerieExecutada[];
}

export interface Sessao {
  id?: number;
  treino_id: number;
  treino_nome: string;
  data_sessao: string;
  exercicios_executados: ExercicioExecutado[];
  completo: boolean;
  duracao_minutos?: number | null;
  criado_em: string;
}

// --- Database Configuration ---

const db = new Dexie('StrongerAppDB') as Dexie & {
  perfil: EntityTable<Perfil, 'id'>;
  pesos: EntityTable<Peso, 'id'>;
  exercicios: EntityTable<Exercicio, 'id'>;
  treinos: EntityTable<Treino, 'id'>;
  treino_exercicios: EntityTable<TreinoExercicio, 'id'>;
  sessoes: EntityTable<Sessao, 'id'>;
};

// Schema declaration
db.version(1).stores({
  perfil: '++id, nome', // Primary key and indexed props
  pesos: '++id, data_registro',
  exercicios: '++id, nome, grupo_muscular',
  treinos: '++id, nome, dia_semana',
  treino_exercicios: '++id, treinoId, exercicioId, ordem', // Indices for fast lookup by treinoId
  sessoes: '++id, treino_id, data_sessao, completo'
});

// --- Initial Data Seeding (Runs only on first DB creation) ---
db.on('populate', (transaction) => {
  transaction.table('exercicios').bulkAdd([
    { nome: 'Supino Reto', grupo_muscular: 'Peito' },
    { nome: 'Supino Inclinado', grupo_muscular: 'Peito' },
    { nome: 'Crucifixo', grupo_muscular: 'Peito' },
    { nome: 'Puxada Frontal', grupo_muscular: 'Costas' },
    { nome: 'Remada Curvada', grupo_muscular: 'Costas' },
    { nome: 'Remada Sentada', grupo_muscular: 'Costas' },
    { nome: 'Agachamento', grupo_muscular: 'Pernas' },
    { nome: 'Leg Press', grupo_muscular: 'Pernas' },
    { nome: 'Cadeira Extensora', grupo_muscular: 'Pernas' },
    { nome: 'Rosca Direta', grupo_muscular: 'Bíceps' },
    { nome: 'Rosca Martelo', grupo_muscular: 'Bíceps' },
    { nome: 'Tríceps Testa', grupo_muscular: 'Tríceps' },
    { nome: 'Desenvolvimento', grupo_muscular: 'Ombros' },
    { nome: 'Elevação Lateral', grupo_muscular: 'Ombros' },
    { nome: 'Panturrilha em Pé', grupo_muscular: 'Pernas' },
    { nome: 'Abdominal Crunch', grupo_muscular: 'Core' },
    { nome: 'Barra Fixa', grupo_muscular: 'Costas' },
    { nome: 'Mergulho', grupo_muscular: 'Peito' }
  ]);
});

export default db;
