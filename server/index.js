require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`\n🚀 Stronger API rodando em http://localhost:${PORT}`);
  console.log(`📋 Endpoints disponíveis:`);
  console.log(`   GET  /api/health`);
  console.log(`   GET  /api/perfil`);
  console.log(`   POST /api/perfil`);
  console.log(`   GET  /api/pesos`);
  console.log(`   POST /api/pesos`);
  console.log(`   GET  /api/treinos`);
  console.log(`   POST /api/treinos`);
  console.log(`   GET  /api/sessoes`);
  console.log(`   POST /api/sessoes\n`);
});
