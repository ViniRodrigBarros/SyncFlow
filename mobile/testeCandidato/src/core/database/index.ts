import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import { Empresa, FotoRegistro, Registro, Usuario } from './models';
import { mySchema } from './schema';

/**
 * Instância única do banco local SQLite via WatermelonDB.
 *
 * Mantemos como singleton de módulo para garantir que repositórios,
 * sync engine e telas usem sempre o mesmo handle. O adapter JSI fica
 * habilitado por padrão (`jsi: true`) para performance no Hermes.
 *
 * O banco é criado preguiçosamente — ao primeiro acesso. Não há
 * `init()` explícito a chamar: importar a constante já basta.
 */
const adapter = new SQLiteAdapter({
  schema: mySchema,
  dbName: 'syncflow.db',
  jsi: true,
  onSetUpError: error => {
    // eslint-disable-next-line no-console
    console.error('[database] falha ao inicializar SQLite', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [Empresa, Usuario, Registro, FotoRegistro],
});

export { mySchema } from './schema';
export * from './models';
