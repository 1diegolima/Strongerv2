// Vercel Serverless Function entry point
// All /api/* requests are routed here by vercel.json
const app = require('../server/app');

module.exports = app;
