import { schemaMigrations } from '@nozbe/watermelondb/Schema/migrations';

/**
 * Pipeline de migrações do banco local.
 *
 * O array vazio é intencional: estamos na **versão 1** do schema (ver
 * `schema.ts`), então não há nada para migrar ainda. O Watermelon exige que o
 * adapter seja criado **com** este objeto — mesmo vazio — para que o sync
 * possa usar `migrationsEnabledAtVersion`. Sem isto, o `synchronize()` lança:
 *
 *   "Migration syncs cannot be enabled on a database that does not support
 *    migrations"
 *
 * Quando precisar evoluir o schema (ex.: adicionar coluna nova em `registros`):
 *
 *   1. Suba `version: 2` em `schema.ts`.
 *   2. Adicione a entrada correspondente aqui:
 *
 *        migrations: [
 *          {
 *            toVersion: 2,
 *            steps: [addColumns({ table: 'registros', columns: [...] })],
 *          },
 *        ]
 *
 *   3. Em dev, desinstale o app no aparelho para reiniciar do zero (ou rode a
 *      migração de verdade — o WatermelonDB cuida disso automaticamente em
 *      produção).
 */
export const migrations = schemaMigrations({
  migrations: [],
});
