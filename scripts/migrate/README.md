# SQLite to Neon Postgres Migration

## Preconditions
- local SQLite source exists at `prisma/dev.db`
- `.env` contains a valid Neon/Postgres `DATABASE_URL`
- target Postgres database is empty

## Commands
1. Export current SQLite data:

```bash
npm run db:export:sqlite
```

2. Generate Prisma client against Postgres:

```bash
npm run db:generate
```

3. Push the schema to Neon:

```bash
npm run db:push
```

4. Import the exported snapshot into Postgres:

```bash
npm run db:import:postgres
```

5. Revalidate the repo:

```bash
npm run typecheck
npm run lint
npm run build
```

## Notes
- `db:import:postgres` aborts if the target database is not empty.
- Override the SQLite source path with `SQLITE_DATABASE_PATH=...` if needed.
- Keep `prisma/dev.db` intact until Neon has been fully validated.
