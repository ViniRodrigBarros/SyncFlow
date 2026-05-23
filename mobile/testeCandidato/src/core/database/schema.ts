import { appSchema, tableSchema } from '@nozbe/watermelondb';

/**
 * Schema do banco local.
 *
 * Os nomes de tabela e coluna seguem snake_case e batem 1:1 com o payload
 * que o backend devolve em /sync/pull e aceita em /sync/push, para que o
 * `synchronize()` do WatermelonDB consiga aplicar as mudanças sem mapeamento.
 *
 * `id` é gerenciado pelo WatermelonDB (string). Para empresa/usuario, que
 * são INT no backend, o server envia o id como string ('1', '2') — o cliente
 * trata como string normalmente.
 *
 * `created_at`/`updated_at` aqui são os timestamps do servidor — guardamos
 * para exibir "última atualização há X min" e para o ViewModel da Home
 * decidir se já há dados (e portanto se a sync deve passar `lastPulledAt`).
 */
export const mySchema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'empresas',
      columns: [
        { name: 'nome', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'usuarios',
      columns: [
        { name: 'nome', type: 'string' },
        { name: 'login', type: 'string' },
        { name: 'empresa_id', type: 'string', isIndexed: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'registros',
      columns: [
        { name: 'empresa_id', type: 'string', isIndexed: true },
        { name: 'usuario_id', type: 'string', isIndexed: true },
        { name: 'tipo', type: 'string' },
        { name: 'data_hora', type: 'number' },
        { name: 'descricao', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'foto_registros',
      columns: [
        { name: 'registro_id', type: 'string', isIndexed: true },
        { name: 'caminho', type: 'string' },
        // Suporte offline-first para fotos: arquivo ainda não enviado ao servidor
        { name: 'is_local_only', type: 'boolean' },
        { name: 'local_uri', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});
