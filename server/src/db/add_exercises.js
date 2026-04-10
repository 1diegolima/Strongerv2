const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const exerciciosNovos = [
  // Peito
  { nome: 'Supino Reto com Halteres', grupo_muscular: 'Peito' },
  { nome: 'Supino Inclinado com Halteres', grupo_muscular: 'Peito' },
  { nome: 'Supino Declinado', grupo_muscular: 'Peito' },
  { nome: 'Crossover (Polia Alta)', grupo_muscular: 'Peito' },
  { nome: 'Crossover (Polia Baixa)', grupo_muscular: 'Peito' },
  { nome: 'Peck Deck (Fly)', grupo_muscular: 'Peito' },
  { nome: 'Pullover', grupo_muscular: 'Peito' },
  { nome: 'Flexão de Braço', grupo_muscular: 'Peito' },
  { nome: 'Crucifixo Inclinado', grupo_muscular: 'Peito' },
  { nome: 'Squeeze Press', grupo_muscular: 'Peito' },
  
  // Costas
  { nome: 'Barra Fixa (Pronada)', grupo_muscular: 'Costas' },
  { nome: 'Barra Fixa (Supinada)', grupo_muscular: 'Costas' },
  { unilateral: true, nome: 'Remada Unilateral (Serrote)', grupo_muscular: 'Costas' },
  { nome: 'Pulldown (Puxada Alta)', grupo_muscular: 'Costas' },
  { nome: 'Puxada Atrás da Nuca', grupo_muscular: 'Costas' },
  { nome: 'Remada Baixa no Cabo', grupo_muscular: 'Costas' },
  { nome: 'Remada Cavalinho', grupo_muscular: 'Costas' },
  { nome: 'Levantamento Terra', grupo_muscular: 'Costas' },
  { nome: 'Extensão Lombar', grupo_muscular: 'Costas' },
  { nome: 'Face Pull', grupo_muscular: 'Costas' },

  // Pernas / Glúteos
  { nome: 'Agachamento Livre (Barra)', grupo_muscular: 'Pernas' },
  { nome: 'Agachamento Sumô', grupo_muscular: 'Pernas' },
  { nome: 'Agachamento Búlgaro', grupo_muscular: 'Pernas' },
  { nome: 'Agachamento Hack', grupo_muscular: 'Pernas' },
  { nome: 'Cadeira Flexora', grupo_muscular: 'Pernas' },
  { nome: 'Mesa Flexora', grupo_muscular: 'Pernas' },
  { nome: 'Stiff', grupo_muscular: 'Pernas' },
  { nome: 'Avanço (Lunge)', grupo_muscular: 'Pernas' },
  { nome: 'Passada', grupo_muscular: 'Pernas' },
  { nome: 'Elevação Pélvica', grupo_muscular: 'Pernas' },
  { nome: 'Cadeira Abdutora', grupo_muscular: 'Pernas' },
  { nome: 'Cadeira Adutora', grupo_muscular: 'Pernas' },
  { nome: 'Panturrilha em Pé', grupo_muscular: 'Panturrilhas' },
  { nome: 'Panturrilha Sentado', grupo_muscular: 'Panturrilhas' },
  { nome: 'Panturrilha no Leg Press', grupo_muscular: 'Panturrilhas' },

  // Ombros / Trapézio
  { nome: 'Desenvolvimento com Halteres', grupo_muscular: 'Ombros' },
  { nome: 'Desenvolvimento Máquina', grupo_muscular: 'Ombros' },
  { nome: 'Elevação Frontal', grupo_muscular: 'Ombros' },
  { nome: 'Elevação Lateral no Cabo', grupo_muscular: 'Ombros' },
  { nome: 'Crucifixo Inverso', grupo_muscular: 'Ombros' },
  { nome: 'Remada Alta', grupo_muscular: 'Ombros' },
  { nome: 'Encolhimento com Barra', grupo_muscular: 'Ombros' },
  { nome: 'Encolhimento com Halteres', grupo_muscular: 'Ombros' },
  { nome: 'Arnold Press', grupo_muscular: 'Ombros' },

  // Bíceps
  { nome: 'Rosca Concentrada', grupo_muscular: 'Bíceps' },
  { nome: 'Rosca Scott', grupo_muscular: 'Bíceps' },
  { nome: 'Rosca Alternada com Halteres', grupo_muscular: 'Bíceps' },
  { nome: 'Rosca Inclinada', grupo_muscular: 'Bíceps' },
  { nome: 'Rosca Direta no Cabo', grupo_muscular: 'Bíceps' },
  { nome: 'Rosca Spider', grupo_muscular: 'Bíceps' },
  { nome: 'Rosca Inversa', grupo_muscular: 'Bíceps' },

  // Tríceps
  { nome: 'Tríceps Pulley (Polia)', grupo_muscular: 'Tríceps' },
  { nome: 'Tríceps Corda', grupo_muscular: 'Tríceps' },
  { nome: 'Tríceps Francês', grupo_muscular: 'Tríceps' },
  { nome: 'Tríceps Coice', grupo_muscular: 'Tríceps' },
  { nome: 'Tríceps Banco (Mergulho)', grupo_muscular: 'Tríceps' },
  { nome: 'Supino Fechado', grupo_muscular: 'Tríceps' },
  { nome: 'Mergulho nas Paralelas', grupo_muscular: 'Tríceps' },

  // Abdômen / Core
  { nome: 'Abdominal Supra (Crunch)', grupo_muscular: 'Abdômen' },
  { nome: 'Abdominal Infra', grupo_muscular: 'Abdômen' },
  { nome: 'Abdominal Oblíquo', grupo_muscular: 'Abdômen' },
  { nome: 'Prancha Isométrica', grupo_muscular: 'Abdômen' },
  { nome: 'Abdominal na Polia', grupo_muscular: 'Abdômen' },
  { nome: 'Russian Twist (Rotação Russa)', grupo_muscular: 'Abdômen' },
  { nome: 'Abdominal Roda', grupo_muscular: 'Abdômen' },
  { nome: 'Elevação de Pernas em Suspensão', grupo_muscular: 'Abdômen' },
];

const appPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: 'app_treino',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function run() {
  console.log('🔄 Inserindo novos exercícios...');
  const client = await appPool.connect();
  
  try {
    let inseridos = 0;
    for (const ex of exerciciosNovos) {
      // Usar a estrutura do Schema para não duplicar se já existir (mesmo nome)
      const res = await client.query(
        'SELECT id FROM exercicios WHERE LOWER(nome) = LOWER($1)',
        [ex.nome]
      );
      
      if (res.rows.length === 0) {
        await client.query(
          'INSERT INTO exercicios (nome, grupo_muscular) VALUES ($1, $2)',
          [ex.nome, ex.grupo_muscular]
        );
        inseridos++;
      }
    }
    console.log(`✅ Concluído! ${inseridos} exercícios foram adicionados ao banco com sucesso.`);
  } catch (err) {
    console.error('❌ Erro:', err);
  } finally {
    client.release();
    appPool.end();
  }
}

run();
