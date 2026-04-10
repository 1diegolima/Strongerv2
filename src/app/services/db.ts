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

// Schema declaration (v1)
db.version(1).stores({
  perfil: '++id, nome', // Primary key and indexed props
  pesos: '++id, data_registro',
  exercicios: '++id, nome, grupo_muscular',
  treinos: '++id, nome, dia_semana',
  treino_exercicios: '++id, treinoId, exercicioId, ordem', // Indices for fast lookup by treinoId
  sessoes: '++id, treino_id, data_sessao, completo'
});

const ALL_EXERCISES = [
  // PEITO
  { nome: 'Supino Reto com Barra', grupo_muscular: 'Peito' },
  { nome: 'Supino Reto com Halteres', grupo_muscular: 'Peito' },
  { nome: 'Supino Inclinado com Barra', grupo_muscular: 'Peito' },
  { nome: 'Supino Inclinado com Halteres', grupo_muscular: 'Peito' },
  { nome: 'Supino Declinado', grupo_muscular: 'Peito' },
  { nome: 'Crucifixo Reto', grupo_muscular: 'Peito' },
  { nome: 'Crucifixo Inclinado', grupo_muscular: 'Peito' },
  { nome: 'Voador (Peck Deck)', grupo_muscular: 'Peito' },
  { nome: 'Cross Over', grupo_muscular: 'Peito' },
  { nome: 'Mergulho nas Paralelas', grupo_muscular: 'Peito' },
  { nome: 'Flexão de Braço', grupo_muscular: 'Peito' },
  
  // COSTAS
  { nome: 'Puxada Frontal Aberta', grupo_muscular: 'Costas' },
  { nome: 'Puxada Frontal Supinada', grupo_muscular: 'Costas' },
  { nome: 'Puxada Triângulo', grupo_muscular: 'Costas' },
  { nome: 'Remada Curvada com Barra', grupo_muscular: 'Costas' },
  { nome: 'Remada Curvada Supinada', grupo_muscular: 'Costas' },
  { nome: 'Remada Sentada (Triângulo)', grupo_muscular: 'Costas' },
  { nome: 'Remada Unilateral (Serrote)', grupo_muscular: 'Costas' },
  { nome: 'Remada Cavalinho', grupo_muscular: 'Costas' },
  { nome: 'Pull Down (Polia Alta)', grupo_muscular: 'Costas' },
  { nome: 'Levantamento Terra', grupo_muscular: 'Costas' },
  { nome: 'Barra Fixa', grupo_muscular: 'Costas' },
  
  // PERNAS (QUADRÍCEPS, POSTERIOR E GLÚTEOS)
  { nome: 'Agachamento Livre', grupo_muscular: 'Pernas' },
  { nome: 'Agachamento Hack', grupo_muscular: 'Pernas' },
  { nome: 'Agachamento Búlgaro', grupo_muscular: 'Pernas' },
  { nome: 'Leg Press 45º', grupo_muscular: 'Pernas' },
  { nome: 'Leg Press Horizontal', grupo_muscular: 'Pernas' },
  { nome: 'Cadeira Extensora', grupo_muscular: 'Pernas' },
  { nome: 'Cadeira Flexora', grupo_muscular: 'Pernas' },
  { nome: 'Mesa Flexora', grupo_muscular: 'Pernas' },
  { nome: 'Stiff', grupo_muscular: 'Pernas' },
  { nome: 'Elevação Pélvica', grupo_muscular: 'Glúteos' },
  { nome: 'Cadeira Abdutora', grupo_muscular: 'Glúteos' },
  { nome: 'Cadeira Adutora', grupo_muscular: 'Pernas' },
  { nome: 'Panturrilha em Pé (Máquina)', grupo_muscular: 'Panturrilhas' },
  { nome: 'Panturrilha Sentado (Máquina)', grupo_muscular: 'Panturrilhas' },
  { nome: 'Panturrilha no Leg Press', grupo_muscular: 'Panturrilhas' },
  
  // OMBROS E TRAPÉZIO
  { nome: 'Desenvolvimento com Halteres', grupo_muscular: 'Ombros' },
  { nome: 'Desenvolvimento com Barra (Militar)', grupo_muscular: 'Ombros' },
  { nome: 'Elevação Lateral com Halteres', grupo_muscular: 'Ombros' },
  { nome: 'Elevação Lateral na Polia', grupo_muscular: 'Ombros' },
  { nome: 'Elevação Frontal', grupo_muscular: 'Ombros' },
  { nome: 'Crucifixo Invertido (Máquina)', grupo_muscular: 'Ombros' },
  { nome: 'Crucifixo Invertido com Halteres', grupo_muscular: 'Ombros' },
  { nome: 'Encolhimento com Halteres', grupo_muscular: 'Trapézio' },
  { nome: 'Encolhimento com Barra', grupo_muscular: 'Trapézio' },
  
  // BÍCEPS E ANTEBRAÇO
  { nome: 'Rosca Direta com Barra (W ou Reta)', grupo_muscular: 'Bíceps' },
  { nome: 'Rosca Direta com Halteres', grupo_muscular: 'Bíceps' },
  { nome: 'Rosca Martelo com Halteres', grupo_muscular: 'Bíceps' },
  { nome: 'Rosca Martelo na Polia', grupo_muscular: 'Bíceps' },
  { nome: 'Rosca Scott', grupo_muscular: 'Bíceps' },
  { nome: 'Rosca Alternada', grupo_muscular: 'Bíceps' },
  { nome: 'Rosca Inversa', grupo_muscular: 'Antebraço' },
  
  // TRÍCEPS
  { nome: 'Tríceps Polia (Corda)', grupo_muscular: 'Tríceps' },
  { nome: 'Tríceps Polia (Barra Reta/V)', grupo_muscular: 'Tríceps' },
  { nome: 'Tríceps Testa com Barra W', grupo_muscular: 'Tríceps' },
  { nome: 'Tríceps Francês Unilateral', grupo_muscular: 'Tríceps' },
  { nome: 'Tríceps Coice na Polia', grupo_muscular: 'Tríceps' },
  { nome: 'Mergulho no Banco', grupo_muscular: 'Tríceps' },
  
  // CORE E ABDÔMEN
  { nome: 'Abdominal Supra (Crunch)', grupo_muscular: 'Core' },
  { nome: 'Abdominal Infra (Elevação de Pernas)', grupo_muscular: 'Core' },
  { nome: 'Abdominal Oblíquo', grupo_muscular: 'Core' },
  { nome: 'Prancha Isométrica', grupo_muscular: 'Core' },
  { nome: 'Abdominal Máquina', grupo_muscular: 'Core' },
  
  // CARDIO
  { nome: 'Esteira', grupo_muscular: 'Cardio' },
  { nome: 'Bicicleta Ergométrica', grupo_muscular: 'Cardio' },
  { nome: 'Elíptico', grupo_muscular: 'Cardio' },
  { nome: 'Escada', grupo_muscular: 'Cardio' },
];

// Schema migration (v2) - Upgrading the exercise list
db.version(2).stores({
   // Nothing changed in schema, but we bump version to run upgrade loop
  exercicios: '++id, nome, grupo_muscular',
}).upgrade(async (tx) => {
  // Add missing exercises for existing users without wiping their customs
  const existingExercises = await tx.table('exercicios').toArray();
  const existingNames = new Set(existingExercises.map(e => e.nome.toLowerCase()));

  const newExercises = ALL_EXERCISES.filter(
    (ex) => !existingNames.has(ex.nome.toLowerCase())
  );
  
  if (newExercises.length > 0) {
    await tx.table('exercicios').bulkAdd(newExercises);
  }
});


// --- Initial Data Seeding (Runs only on strictly first DB creation) ---
db.on('populate', () => {
  db.exercicios.bulkAdd(ALL_EXERCISES);
});

export default db;
