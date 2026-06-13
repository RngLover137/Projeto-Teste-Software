# Saúde Unida

## Stack

- **Next.js 14** — App Router, Server Actions
- **React 18** — UI com componentes cliente e servidor
- **Tailwind CSS** — Estilização utility-first
- **Drizzle ORM** — Type-safe ORM para PostgreSQL
- **Supabase** — PostgreSQL como banco de dados
- **JWT (jose)** + **bcryptjs** — Autenticação própria via cookies HTTP-only

---

## Setup

### 1. Crie um projeto no Supabase

Acesse [supabase.com](https://supabase.com), crie um projeto e copie:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **Anon Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Connection String (Transaction)** → `DATABASE_URL`

### 2. Configure o `.env.local`

```bash
cp .env.example .env.local
```

Preencha com suas credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
DATABASE_URL=postgresql://postgres:senha@db.xxxx.supabase.co:5432/postgres
JWT_SECRET=uma-chave-secreta-longa-e-aleatoria-aqui
```

> ⚠️ Para o `DATABASE_URL`, use a **Transaction pooler** string (porta 6543) do Supabase se for usar edge functions, ou a **Direct connection** (porta 5432) para desenvolvimento local.

### 3. Execute o schema SQL no Supabase

No painel do Supabase, vá em **SQL Editor** e execute o arquivo:

```
drizzle/0000_initial_schema.sql
```

Isso criará todas as tabelas, enums, índices e triggers necessários.

### 4. Instale as dependências e rode

```bash
npm install
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## Estrutura do Projeto

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── cadastro/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx          # Layout autenticado com sidebar
│   │   ├── rotinas/
│   │   │   ├── page.tsx        # Lista de rotinas
│   │   │   └── [id]/page.tsx   # Detalhe da rotina (quadro semanal)
│   │   └── perfil/page.tsx     # Perfil e exclusão de conta
│   ├── layout.tsx
│   ├── page.tsx                # Landing page
│   └── globals.css
├── components/
│   ├── Sidebar.tsx
│   ├── CreateRoutineModal.tsx
│   ├── RoutineHeader.tsx
│   ├── WeeklyBoard.tsx         # Quadro de tarefas por dia
│   ├── MembersPanel.tsx
│   └── DeleteAccountButton.tsx
├── lib/
│   ├── db/
│   │   ├── schema.ts           # Drizzle schema
│   │   └── index.ts            # DB client
│   ├── actions/
│   │   ├── auth.ts             # register, login, logout, delete
│   │   ├── routines.ts         # CRUD rotinas
│   │   ├── members.ts          # Convidar, remover, alterar role
│   │   └── tasks.ts            # CRUD tarefas
│   ├── queries.ts              # Funções de leitura
│   ├── auth.ts                 # JWT + cookies + bcrypt
│   └── utils.ts                # cn(), constantes de dias/roles
└── middleware.ts               # Proteção de rotas
```

---

## Comandos úteis

```bash
# Desenvolvimento
npm run dev

# Gerar migrations (após alterar schema.ts)
npm run db:generate

# Aplicar migrations
npm run db:push

# Visualizar banco (Drizzle Studio)
npm run db:studio
```

---

## Entidades

| Tabela | Descrição |
|--------|-----------|
| `users` | Usuários cadastrados |
| `routines` | Rotinas semanais de saúde |
| `members` | Relacionamento usuário ↔ rotina com role |
| `tasks` | Tarefas associadas a um dia da semana |
