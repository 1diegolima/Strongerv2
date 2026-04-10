require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Routes
const perfilRoutes = require('./src/routes/perfil.routes');
const pesosRoutes = require('./src/routes/pesos.routes');
const treinosRoutes = require('./src/routes/treinos.routes');
const sessoesRoutes = require('./src/routes/sessoes.routes');

const app = express();

// ----------------------------------------
// Middlewares
// ----------------------------------------
app.use(cors({
  origin: true, // Allow all origins (same-domain Vercel handles this safely)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.options('*', cors()); // Handle preflight requests

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ----------------------------------------
// Rotas da API
// Montadas em /api/... para funcionar tanto em:
//   - Dev local (http://localhost:3001/api/perfil)
//   - Vercel (https://app.vercel.app/api/perfil -> serverless function recebe /api/perfil)
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

module.exports = app;
