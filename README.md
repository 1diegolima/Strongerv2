# Stronger V2

Aplicativo completo fitness (Full-Stack) evoluído a partir de protótipo Figma.
Stack: React, Vite, Node.js, Express, PostgreSQL e Tailwind CSS.

## 🚀 Pré-requisitos

- **Node.js**: v18+
- **PostgreSQL**: Rodando localmente na porta 5432 (porta padrão)

## 📦 Como Instalar e Rodar

1. **Configurar o Banco de Dados (PostgreSQL)**:
   Abra o arquivo `server/.env` e verifique a sua senha:
   ```env
   DB_USER=postgres
   DB_PASSWORD=sua_senha
   ```

2. **Instalar Dependências e Migrar Banco**:
   (Opcional se já realizou os comandos acima)
   Na raiz do projeto:
   ```bash
   npm install
   cd server && npm install
   cd ..
   npm run migrate
   ```

3. **Rodar o Projeto**:
   Abra 2 terminais separados na raiz do projeto (`Strongerv2`):

   No **Terminal 1** (Inicia o backend):
   ```bash
   npm run server:dev
   ```

   No **Terminal 2** (Inicia o frontend):
   ```bash
   npm run client
   ```

4. **Acessar**:
   Abra [http://localhost:5173/](http://localhost:5173/) no seu navegador.

## 📂 Estrutura de Pastas
- `src/`: Frontend React + Vite
- `src/app/pages`: Telas conectadas com backend
- `src/app/services`: Configuração de requisições API (axios)
- `src/app/hooks`: Custom hooks de cache de estado para integração da interface com o Service local.
- `server/`: Backend Node.js (Express, PG)
- `server/src/config/database.js`: Conexão com PG
- `server/src/db/`: Arquivos SQL (DB Schema, DB Seed, e Migrate Script)

## ✨ Melhorias em relação ao Figma Make base
- Dados não se apagam (Persistência real no Postgres ao invés de localStorage).
- Suporte à evolução e análise ao longo de vários dias/meses de forma consistente.
- Componente dedicado para Loading e Tratamento de Erros via Requesições HTTP.
- Toasts Globais (Notificações `Sonner`) nativamente conectados as ações da REST API (Express).