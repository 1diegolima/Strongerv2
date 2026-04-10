require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Routes
const perfilRoutes = require('./src/routes/perfil.routes');
const pesosRoutes = require('./src/routes/pesos.routes');
const treinosRoutes = require('./src/routes/treinos.routes');
const sessoesRoutes = require('./src/routes/sessoes.routes');

const app = express();
const PORT = process.env.PORT || 3001;

// ----------------------------------------
// Middlewares
// ----------------------------------------
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? true : ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ----------------------------------------
// Rotas da API
// ----------------------------------------
app.use('/api/perfil', perfilRoutes);
app.use('/api/pesos', pesosRoutes);
app.use('/api/treinos', treinosRoutes);
app.use('/api/sessoes', sessoesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Rota não encontrada: ${req.method} ${req.path}` });
});

// Error Handler global
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// ----------------------------------------
// Iniciar servidor
// ----------------------------------------
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

module.exports = app;
